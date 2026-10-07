const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const sections = [
  ['student-service', 'backend/services/student-service/.env'],
  ['teacher-service', 'backend/services/teacher-service/.env'],
  ['class-subject-service', 'backend/services/class-subject-service/.env'],
  ['timetable-service', 'backend/services/timetable-service/.env'],
  ['attendance-service', 'backend/services/attendance-service/.env'],
  ['examination-service', 'backend/services/examination-service/.env'],
  ['performance-service', 'backend/services/performance-service/.env'],
  ['assignment-service', 'backend/services/assignment-service/.env'],
  ['fee-service', 'backend/services/fee-service/.env'],
  ['leave-service', 'backend/services/leave-service/.env'],
  ['admission-service', 'backend/services/admission-service/.env'],
  ['certificate-service', 'backend/services/certificate-service/.env'],
  ['notice-service', 'backend/services/notice-service/.env'],
  ['library-service', 'backend/services/library-service/.env'],
  ['transport-service', 'backend/services/transport-service/.env'],
  ['dashboard-service', 'backend/services/dashboard-service/.env'],
  ['auth-service', 'backend/services/auth-service/.env'],
  ['api-gateway', 'backend/api-gateway/.env'],
  ['frontend', 'frontend/.env'],
];

const header = [
  '# This file is a consolidated REFERENCE ONLY — no service loads this file directly, since key names collide across services (PORT, MONGODB_URI, etc).',
  '# Each service continues to read its own .env in its own folder. Update this file manually whenever a per-service .env changes, or regenerate it with `npm run env:reference`.',
];

const content = sections.map(([name, file]) => {
  const env = readFileSync(join(root, file), 'utf8').trimEnd();
  const port = env.match(/^PORT=(.+)$/m)?.[1];
  const label = port ? `${name} (port ${port})` : name;
  return `# ===== ${label} =====\n${env}`;
});

writeFileSync(join(root, '.env'), `${header.join('\n')}\n\n${content.join('\n\n')}\n`);
