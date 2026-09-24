/*
 * BrightBoard gateway role-regression test.
 *
 * Run from backend/scripts:
 *   node regression-test.js
 *
 * This intentionally creates test records.  It uses a timestamp in record
 * values so repeated runs do not collide with prior runs.  Add checks by
 * appending another plain object to `tests` (or use the small role helpers).
 */
const axios = require('axios');

const BASE_URL = process.env.BRIGHTBOARD_GATEWAY_URL || 'http://localhost:3100';
const PASSWORD = 'TestPass123';
const stamp = Date.now().toString();
const ok = [200, 201];
const ansi = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', reset: '\x1b[0m' };

const client = axios.create({ baseURL: BASE_URL, timeout: 15_000, validateStatus: () => true });
const tokens = {};
const authUserIds = {};
const ids = {};

function auth(role) {
  return role ? { Authorization: `Bearer ${tokens[role]}` } : {};
}

function idOf(data, label) {
  const id = data && (data._id || data.id);
  if (!id) throw new Error(`${label} did not return an id`);
  return id;
}

function success(status) {
  return ok.includes(status);
}

async function request(test) {
  const url = typeof test.url === 'function' ? test.url() : test.url;
  const data = typeof test.data === 'function' ? test.data() : test.data;
  const response = await client.request({ method: test.method, url, data, headers: auth(test.as) });
  return { response, url };
}

async function loginUsers() {
  const users = [
    { role: 'admin', name: 'BrightBoard Test Admin', email: 'admin-test@brightboard.com' },
    { role: 'teacher', name: 'BrightBoard Test Teacher', email: 'teacher-test@brightboard.com' },
    { role: 'student', name: 'BrightBoard Test Student', email: 'student-test@brightboard.com' },
  ];

  for (const user of users) {
    // A 409 is expected after the first run; login below is the source of truth.
    await client.post('/auth/register', { ...user, password: PASSWORD });
    const login = await client.post('/auth/login', { email: user.email, password: PASSWORD });
    if (!success(login.status) || !login.data.access_token) {
      throw new Error(`Could not log in ${user.role}: HTTP ${login.status}`);
    }
    tokens[user.role] = login.data.access_token;
    authUserIds[user.role] = idOf(login.data.user, `${user.role} auth user`);
  }
}

async function createFixture(method, url, data, label) {
  const response = await client.request({ method, url, data, headers: auth('admin') });
  if (!success(response.status)) throw new Error(`Fixture ${label} failed: HTTP ${response.status}`);
  return idOf(response.data, label);
}

async function findOrCreateProfile(url, authUserId, data, label) {
  const lookup = await client.get(`${url}/by-auth-user/${authUserId}`, { headers: auth('admin') });
  if (lookup.status === 200) return idOf(lookup.data, label);
  if (lookup.status !== 404) throw new Error(`Could not look up ${label}: HTTP ${lookup.status}`);
  return createFixture('post', url, data, label);
}

async function createFixtures() {
  // Fixtures make allowed-write checks reach the downstream service rather
  // than failing because an ID from a different service does not exist.
  ids.student = await findOrCreateProfile('/students', authUserIds.student, {
    firstName: 'Role', lastName: 'Fixture', email: `role-student-${stamp}@brightboard.test`, rollNumber: `ROLE-${stamp}`, authUserId: authUserIds.student,
  }, 'student');
  ids.teacher = await findOrCreateProfile('/teachers', authUserIds.teacher, {
    firstName: 'Role', lastName: 'Teacher', email: `role-teacher-${stamp}@brightboard.test`, subjectsHandled: ['Mathematics'], authUserId: authUserIds.teacher,
  }, 'teacher');
  ids.class = await createFixture('post', '/classes', {
    name: `Role Grade ${stamp}`, section: 'A', academicYear: '2026-2027', classTeacherId: ids.teacher, studentIds: [ids.student],
  }, 'class');
  ids.subject = await createFixture('post', '/subjects', {
    name: `Role Mathematics ${stamp}`, code: `ROLE-${stamp}`, classId: ids.class, teacherId: ids.teacher,
  }, 'subject');
  ids.book = await createFixture('post', '/library/books', {
    title: `Role Test Book ${stamp}`, author: 'BrightBoard QA', isbn: `978-${stamp}`, category: 'Testing', totalCopies: 10,
  }, 'book');
  ids.route = await createFixture('post', '/transport/routes', {
    routeName: `Role Route ${stamp}`, vehicleNumber: `ROLE-${stamp}`, driverName: 'QA Driver', driverContact: '+919999999999',
    stops: [{ stopName: 'QA Stop', pickupTime: '07:30' }],
  }, 'route');
  ids.fee = await createFixture('post', '/fees/structures', {
    classId: ids.class, academicYear: '2026-2027', feeType: `QA Fee ${stamp}`, amount: 1000, dueDate: '2027-01-15T00:00:00.000Z',
  }, 'fee structure');
  ids.exam = await createFixture('post', '/exams', {
    name: `Role Exam ${stamp}`, classId: ids.class, subjectId: ids.subject, examDate: '2026-12-15T09:00:00.000Z', maxMarks: 100, examType: 'midterm',
  }, 'exam');
  ids.assignment = await createFixture('post', '/assignments', {
    title: `Role Assignment ${stamp}`, description: 'Regression fixture.', classId: ids.class, subjectId: ids.subject, teacherId: ids.teacher,
    dueDate: '2027-01-20T23:59:00.000Z',
  }, 'assignment');
  ids.admission = await createFixture('post', '/admissions', {
    applicantFirstName: 'Role', applicantLastName: 'Applicant', dateOfBirth: '2015-04-20T00:00:00.000Z', gender: 'male',
    guardianName: 'QA Guardian', guardianContact: '+919999999998', guardianEmail: `guardian-${stamp}@brightboard.test`, appliedClassId: ids.class,
  }, 'admission');
}

const studentPayload = () => ({ firstName: 'Write', lastName: 'Check', email: `write-student-${Date.now()}@brightboard.test` });
const teacherPayload = () => ({ firstName: 'Write', lastName: 'Check', email: `write-teacher-${Date.now()}@brightboard.test` });
const classPayload = () => ({ name: `Write Grade ${Date.now()}`, section: 'B', academicYear: '2026-2027', classTeacherId: ids.teacher, studentIds: [] });
const routePayload = () => ({ routeName: `Write Route ${Date.now()}`, vehicleNumber: `WRITE-${Date.now()}`, driverName: 'QA Driver', driverContact: '+919999999997', stops: [{ stopName: 'Write Stop', pickupTime: '08:00' }] });

function adminOnly(service, url, data) {
  return [
    { service, method: 'POST', url, data, as: 'teacher', expected: 403 },
    { service, method: 'POST', url, data, as: 'student', expected: 403 },
    { service, method: 'POST', url, data, as: 'admin', expected: ok },
  ];
}
function adminTeacher(service, url, data) {
  return [
    { service, method: 'POST', url, data, as: 'student', expected: 403 },
    { service, method: 'POST', url, data, as: 'teacher', expected: ok },
    { service, method: 'POST', url, data, as: 'admin', expected: ok },
  ];
}

// Plain test matrix. Every request goes through the API Gateway.
const tests = [
  { service: 'Gateway authentication', method: 'POST', url: '/students', data: studentPayload, as: null, expected: 401 },
  ...adminOnly('Students', '/students', studentPayload),
  ...adminOnly('Teachers', '/teachers', teacherPayload),
  ...adminOnly('Classes', '/classes', classPayload),
  ...adminOnly('Subjects', '/subjects', () => ({ name: `Write Subject ${Date.now()}`, code: `SUB-${Date.now()}`, classId: ids.class, teacherId: ids.teacher })),
  ...adminOnly('Timetables', '/timetables', () => ({ classId: ids.class, dayOfWeek: 'Monday', periods: [{ periodNumber: 1, subjectId: ids.subject, teacherId: ids.teacher, startTime: '09:00', endTime: '09:45' }] })),
  ...adminOnly('Fee structures', '/fees/structures', () => ({ classId: ids.class, academicYear: '2026-2027', feeType: `Write Fee ${Date.now()}`, amount: 500, dueDate: '2027-02-01T00:00:00.000Z' })),
  ...adminOnly('Payments', '/fees/payments', () => ({ studentId: ids.student, feeStructureId: ids.fee, amountPaid: 1, paymentMode: 'online', transactionRef: `QA-${Date.now()}` })),
  ...adminOnly('Certificates', '/certificates', () => ({ studentId: ids.student, type: 'bonafide' })),
  ...adminOnly('Notices', '/notices', () => ({ title: `Write Notice ${Date.now()}`, message: 'Role regression test.', targetRole: 'all' })),
  ...adminOnly('Library books', '/library/books', () => ({ title: `Write Book ${Date.now()}`, author: 'QA', isbn: `WRITE-${Date.now()}`, category: 'Testing', totalCopies: 1 })),
  ...adminOnly('Library issues', '/library/issue', () => ({ bookId: ids.book, borrowerId: ids.student, borrowerType: 'student', dueDate: '2027-02-01T00:00:00.000Z' })),
  ...adminOnly('Transport routes', '/transport/routes', routePayload),
  ...adminOnly('Transport allocations', '/transport/allocate', () => ({ studentId: ids.student, routeId: ids.route, stopName: 'QA Stop' })),
  ...adminTeacher('Attendance', '/attendance', () => ({ classId: ids.class, date: '2026-12-01', records: [{ studentId: ids.student, status: 'present' }] })),
  ...adminTeacher('Exams', '/exams', () => ({ name: `Write Exam ${Date.now()}`, classId: ids.class, subjectId: ids.subject, examDate: '2026-12-20T09:00:00.000Z', maxMarks: 100, examType: 'midterm' })),
  ...adminTeacher('Exam marks', () => `/exams/${ids.exam}/marks`, () => ({ marks: [{ studentId: ids.student, marksObtained: 80 }] })),
  ...adminTeacher('Assignments', '/assignments', () => ({ title: `Write Assignment ${Date.now()}`, description: 'Role regression test.', classId: ids.class, subjectId: ids.subject, teacherId: ids.teacher, dueDate: '2027-02-20T23:59:00.000Z' })),
  { service: 'Assignment submissions', method: 'POST', url: () => `/assignments/${ids.assignment}/submit`, data: () => ({ studentId: ids.student, submissionText: 'Student submission.' }), as: 'student', expected: ok },
  { service: 'Leave requests', method: 'POST', url: '/leave-requests', data: () => ({ requesterId: ids.student, requesterType: 'student', fromDate: '2027-02-01T00:00:00.000Z', toDate: '2027-02-02T00:00:00.000Z', reason: 'Role regression test.' }), as: 'student', expected: ok, after: (data) => { ids.leave = idOf(data, 'student leave request'); } },
  { service: 'Leave requests', method: 'POST', url: '/leave-requests', data: () => ({ requesterId: ids.teacher, requesterType: 'teacher', fromDate: '2027-02-03T00:00:00.000Z', toDate: '2027-02-04T00:00:00.000Z', reason: 'Role regression test.' }), as: 'teacher', expected: ok },
  { service: 'Leave review', method: 'PATCH', url: '/leave-requests/not-a-real-id/review', data: { status: 'approved' }, as: 'teacher', expected: 403 },
  { service: 'Leave review', method: 'PATCH', url: '/leave-requests/not-a-real-id/review', data: { status: 'approved' }, as: 'student', expected: 403 },
  { service: 'Leave review', method: 'PATCH', url: () => `/leave-requests/${ids.leave}/review`, data: { status: 'approved' }, as: 'admin', expected: 200 },
  { service: 'Admission status', method: 'PATCH', url: () => `/admissions/${ids.admission}/status`, data: { status: 'approved' }, as: 'teacher', expected: 403 },
  { service: 'Admission status', method: 'PATCH', url: () => `/admissions/${ids.admission}/status`, data: { status: 'approved' }, as: 'student', expected: 403 },
  { service: 'Admission status', method: 'PATCH', url: () => `/admissions/${ids.admission}/status`, data: { status: 'approved' }, as: 'admin', expected: ok },
  { service: 'Admissions (public contract)', method: 'POST', url: '/admissions', data: () => ({ applicantFirstName: 'Public', applicantLastName: 'Applicant', dateOfBirth: '2015-04-20T00:00:00.000Z', gender: 'male', guardianName: 'QA Guardian', guardianContact: '+919999999996', guardianEmail: `public-${Date.now()}@brightboard.test`, appliedClassId: ids.class }), as: null, expected: ok },
  // Open list/read endpoints: use a student token to prove no service role guard blocks them.
  ...['/students', '/teachers', '/classes', '/subjects', '/timetables', '/fees/structures', '/attendance', '/exams', '/assignments', '/leave-requests', '/notices', '/events', '/library/books', '/transport/routes', '/transport/allocations', '/admissions'].map((url) => ({ service: `Open read ${url}`, method: 'GET', url, as: 'student', expected: 200 })),
  { service: 'Certificates read', method: 'GET', url: () => `/certificates/student/${ids.student}`, as: 'student', expected: 200 },
  { service: 'Payments read', method: 'GET', url: () => `/fees/student/${ids.student}`, as: 'student', expected: 200 },
  { service: 'Performance read', method: 'GET', url: () => `/performance/student/${ids.student}`, as: 'student', expected: 200 },
  { service: 'Dashboard student', method: 'GET', url: () => `/dashboard/student/${ids.student}`, as: 'student', expected: 200 },
  { service: 'Dashboard parent', method: 'GET', url: () => `/dashboard/parent/${ids.student}`, as: 'student', expected: 200 },
  { service: 'Dashboard teacher', method: 'GET', url: () => `/dashboard/teacher/${ids.teacher}`, as: 'student', expected: 200 },
  { service: 'Dashboard admin', method: 'GET', url: '/dashboard/admin', as: 'student', expected: 200 },
];

function expectedLabel(expected) {
  return Array.isArray(expected) ? expected.join('/') : String(expected);
}

async function run() {
  await loginUsers();
  await createFixtures();
  const results = [];

  for (const test of tests) {
    try {
      const { response } = await request(test);
      const passed = Array.isArray(test.expected) ? test.expected.includes(response.status) : response.status === test.expected;
      if (passed && test.after) test.after(response.data);
      results.push({ service: test.service, method: test.method, expected: expectedLabel(test.expected), actual: response.status, passed });
    } catch (error) {
      results.push({ service: test.service, method: test.method, expected: expectedLabel(test.expected), actual: error.code || 'ERROR', passed: false });
    }
  }

  console.table(results.map((row) => ({ ...row, result: row.passed ? 'PASS' : 'FAIL' })));
  const failed = results.filter((row) => !row.passed);
  const passed = results.length - failed.length;
  console.log(`\n${passed}/${results.length} passed`);
  if (failed.length) {
    console.log(`${ansi.red}FAILED:${ansi.reset}`);
    failed.forEach((row) => console.log(`${ansi.red}${row.service} | ${row.method} | expected ${row.expected}, got ${row.actual}${ansi.reset}`));
    process.exitCode = 1;
  } else {
    console.log(`${ansi.green}All regression checks passed.${ansi.reset}`);
  }
}

run().catch((error) => {
  console.error(`${ansi.red}Test setup failed: ${error.message}${ansi.reset}`);
  process.exitCode = 1;
});
