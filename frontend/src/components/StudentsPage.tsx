import { type FormEvent, useEffect, useState } from 'react';
import { gateway, type Session } from '../api/gateway';
import './StudentsPage.css';
import './ClassesSubjectsPage.css';

type Student = { _id: string; firstName: string; lastName: string; email: string; phone?: string; address?: string; dateOfBirth?: string; gender?: string; rollNumber?: string; classId?: string; section?: string; guardianName?: string; guardianPhone?: string; guardianEmail?: string; isActive: boolean };
type SchoolClass = { _id: string; name: string; section: string; academicYear: string };
type StudentForm = Omit<Student, '_id' | 'isActive'>;

const emptyForm: StudentForm = { firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '', gender: '', rollNumber: '', classId: '', section: '', guardianName: '', guardianPhone: '', guardianEmail: '' };
const inputFields: Array<[string, keyof StudentForm, string, boolean]> = [['First Name', 'firstName', 'text', true], ['Last Name', 'lastName', 'text', true], ['Email', 'email', 'email', true], ['Phone', 'phone', 'text', false], ['Address', 'address', 'text', false], ['Date of Birth', 'dateOfBirth', 'date', false], ['Roll Number', 'rollNumber', 'text', false], ['Section', 'section', 'text', false], ['Guardian Name', 'guardianName', 'text', false], ['Guardian Phone', 'guardianPhone', 'text', false], ['Guardian Email', 'guardianEmail', 'email', false]];

export function StudentsPage({ session }: { session: Session }) {
  const isAdmin = session.user.role === 'admin';
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [composer, setComposer] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadStudents() {
    setLoading(true); setError('');
    try {
      const [studentData, classData] = await Promise.all([
        gateway<Student[]>(isAdmin && showInactive ? '/students?includeInactive=true' : '/students', {}, session.access_token),
        gateway<SchoolClass[]>('/classes', {}, session.access_token),
      ]);
      setStudents(studentData); setClasses(classData);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load students.'); } finally { setLoading(false); }
  }
  useEffect(() => { void loadStudents(); }, [session.access_token, showInactive, isAdmin]);

  function openForm(student?: Student) {
    setEditing(student ?? null);
    setForm(student ? { ...emptyForm, ...student, dateOfBirth: student.dateOfBirth?.slice(0, 10) ?? '' } : emptyForm);
    setComposer(true); setError('');
  }
  function updateField(field: keyof StudentForm, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  async function saveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError('');
    const optional = (value: string | undefined) => value?.trim() || undefined;
    const body = { ...form, phone: optional(form.phone), address: optional(form.address), dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined, gender: optional(form.gender), rollNumber: optional(form.rollNumber), classId: optional(form.classId), section: optional(form.section), guardianName: optional(form.guardianName), guardianPhone: optional(form.guardianPhone), guardianEmail: optional(form.guardianEmail) };
    try {
      const saved = await gateway<Student>(editing ? `/students/${editing._id}` : '/students', { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(body) }, session.access_token);
      setStudents((items) => editing ? items.map((item) => item._id === saved._id ? saved : item) : [saved, ...items]);
      setComposer(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save student.'); } finally { setSubmitting(false); }
  }
  async function deleteStudent(student: Student) {
    const name = `${student.firstName} ${student.lastName}`.trim() || 'this student';
    if (!window.confirm(`Are you sure you want to deactivate ${name}? This removes them from active student lists.`)) return;
    setDeletingId(student._id); setError('');
    try { await gateway(`/students/${student._id}`, { method: 'DELETE' }, session.access_token); setStudents((items) => items.filter((item) => item._id !== student._id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to deactivate student.'); } finally { setDeletingId(null); }
  }

  const filtered = students.filter((student) => JSON.stringify(student).toLowerCase().includes(query.toLowerCase()));
  return <><div className="page-intro"><div><p>Student profiles and enrolment records.</p><small>Data is loaded from <code>/students</code> and <code>/classes</code>.</small></div><div className="toolbar"><button className="secondary" onClick={() => void loadStudents()} disabled={loading}>Refresh</button><button className="primary" onClick={() => openForm()}>Add student</button></div></div>
    {composer && <section className="composer structured-composer"><div><h2>{editing ? 'Edit student' : 'Add student'}</h2><p>Complete the student profile fields below.</p></div><form className="structured-form" onSubmit={(event) => void saveStudent(event)}>{inputFields.map(([label, field, type, required]) => <label key={field}>{label}<input type={type} required={required} value={form[field] ?? ''} onChange={(event) => updateField(field, event.target.value)} /></label>)}<label>Gender<select value={form.gender ?? ''} onChange={(event) => updateField('gender', event.target.value)}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label>Class<select value={form.classId ?? ''} onChange={(event) => updateField('classId', event.target.value)}><option value="">Choose a class</option>{classes.map((schoolClass) => <option key={schoolClass._id} value={schoolClass._id}>{schoolClass.name} — {schoolClass.section} ({schoolClass.academicYear})</option>)}</select></label><div className="form-actions"><button type="button" className="secondary" onClick={() => setComposer(false)}>Cancel</button><button className="primary" disabled={submitting}>{submitting ? 'Sending…' : 'Send to API'}</button></div></form></section>}
    <section className="data-card"><div className="data-top"><div><h2>Live records</h2><span>{loading ? 'Loading…' : `${filtered.length} record${filtered.length === 1 ? '' : 's'}`}</span></div><div className="student-table-controls">{isAdmin && <label className="inactive-toggle"><input type="checkbox" checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)} /> Show inactive students</label>}<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students" aria-label="Search students" /></div></div>{error && <div className="state error"><strong>Couldn’t load students.</strong><span>{error}</span><button className="secondary" onClick={() => void loadStudents()}>Try again</button></div>}{loading ? <div className="state">Loading from the API Gateway…</div> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Roll number</th><th>Section</th><th>Status</th>{isAdmin && <th>Actions</th>}</tr></thead><tbody>{filtered.map((student) => <tr key={student._id} className={!student.isActive ? 'inactive-record' : ''}><td>{student.firstName} {student.lastName}</td><td>{student.email}</td><td>{student.rollNumber ?? '—'}</td><td>{student.section ?? '—'}</td><td>{student.isActive ? 'Active' : 'Inactive'}</td>{isAdmin && <td>{student.isActive && <><button className="secondary" type="button" onClick={() => openForm(student)}>Edit</button><button className="danger-button" type="button" onClick={() => void deleteStudent(student)} disabled={deletingId === student._id}>{deletingId === student._id ? 'Deleting…' : 'Delete'}</button></>}</td>}</tr>)}</tbody></table></div>}</section>
  </>;
}
