import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { gateway, type Session } from '../api/gateway';
import { useEntityNames } from '../hooks/useEntityNames';
import './ClassesSubjectsPage.css';

type SchoolClass = { _id: string; name: string; section: string; academicYear: string; classTeacherId: string; studentIds?: string[] };
type Teacher = { _id: string; firstName: string; lastName: string; email: string };
type Student = { _id: string; firstName: string; lastName: string; email: string };
type Subject = { _id: string; name: string; code: string; classId: string; teacherId?: string };

const personName = (person: Teacher | Student) => `${person.firstName} ${person.lastName} — ${person.email}`;
const className = (item: SchoolClass) => `${item.name} — Section ${item.section} (${item.academicYear})`;
const currentAcademicYear = () => { const year = new Date().getFullYear(); return `${year}-${year + 1}`; };

export function ClassesSubjectsPage({ session }: { session: Session }) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [composer, setComposer] = useState<'class' | 'subject' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', section: '', academicYear: currentAcademicYear(), classTeacherId: '', studentIds: [] as string[] });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', classId: '', teacherId: '' });
  const [teacherQuery, setTeacherQuery] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [classQuery, setClassQuery] = useState('');

  const filteredTeachers = useMemo(() => teachers.filter((teacher) => personName(teacher).toLowerCase().includes(teacherQuery.toLowerCase())), [teachers, teacherQuery]);
  const filteredStudents = useMemo(() => students.filter((student) => personName(student).toLowerCase().includes(studentQuery.toLowerCase())), [students, studentQuery]);
  const filteredClasses = useMemo(() => classes.filter((item) => className(item).toLowerCase().includes(classQuery.toLowerCase())), [classes, classQuery]);
  const { resolve } = useEntityNames({ teacher: [...classes.map((item) => item.classTeacherId), ...subjects.map((item) => item.teacherId).filter((id): id is string => Boolean(id))] }, session.access_token);

  async function refresh() {
    setLoading(true); setError('');
    try {
      const [nextClasses, nextSubjects, nextTeachers, nextStudents] = await Promise.all([
        gateway<SchoolClass[]>('/classes', {}, session.access_token), gateway<Subject[]>('/subjects', {}, session.access_token),
        gateway<Teacher[]>('/teachers', {}, session.access_token), gateway<Student[]>('/students', {}, session.access_token),
      ]);
      setClasses(nextClasses); setSubjects(nextSubjects); setTeachers(nextTeachers); setStudents(nextStudents);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load classes and subjects.'); } finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, [session.access_token]);
  const toggleStudent = (studentId: string) => setClassForm((form) => ({ ...form, studentIds: form.studentIds.includes(studentId) ? form.studentIds.filter((id) => id !== studentId) : [...form.studentIds, studentId] }));

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(''); setNotice('');
    try { await gateway('/classes', { method: 'POST', body: JSON.stringify(classForm) }, session.access_token); setClassForm({ name: '', section: '', academicYear: currentAcademicYear(), classTeacherId: '', studentIds: [] }); setComposer(null); setNotice('Class created successfully.'); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create class.'); } finally { setSubmitting(false); }
  }
  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(''); setNotice('');
    try { const { teacherId, ...required } = subjectForm; await gateway('/subjects', { method: 'POST', body: JSON.stringify(teacherId ? subjectForm : required) }, session.access_token); setSubjectForm({ name: '', code: '', classId: '', teacherId: '' }); setComposer(null); setNotice('Subject created successfully.'); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create subject.'); } finally { setSubmitting(false); }
  }

  return <>
    <div className="page-intro"><div><p>Class sections, subject mapping and allocation.</p><small>Data is loaded from <code>/classes</code>, <code>/subjects</code>, <code>/teachers</code>, and <code>/students</code>.</small></div><div className="toolbar"><button className="secondary" onClick={() => void refresh()} disabled={loading}>Refresh</button><button className="secondary" onClick={() => { setError(''); setNotice(''); setComposer('subject'); }}>Add subject</button><button className="primary" onClick={() => { setError(''); setNotice(''); setComposer('class'); }}>Add class</button></div></div>
    {composer === 'class' && <section className="composer structured-composer"><div><h2>Add class</h2><p>Create a class section and assign its teacher and enrolled students.</p></div><form className="structured-form" onSubmit={(event) => void createClass(event)}><label>Class name<input required maxLength={100} value={classForm.name} onChange={(event) => setClassForm({ ...classForm, name: event.target.value })} placeholder="Grade 10" /></label><label>Section<input required maxLength={20} value={classForm.section} onChange={(event) => setClassForm({ ...classForm, section: event.target.value })} placeholder="A" /></label><label>Academic year<input required maxLength={20} value={classForm.academicYear} onChange={(event) => setClassForm({ ...classForm, academicYear: event.target.value })} placeholder="2026-2027" /></label><label>Search class teachers<input value={teacherQuery} onChange={(event) => setTeacherQuery(event.target.value)} placeholder="Type a name or email" /></label><label>Class teacher<select required value={classForm.classTeacherId} onChange={(event) => setClassForm({ ...classForm, classTeacherId: event.target.value })}><option value="">Choose a teacher</option>{filteredTeachers.map((teacher) => <option key={teacher._id} value={teacher._id}>{personName(teacher)}</option>)}</select></label><fieldset className="multi-select"><legend>Students (optional)</legend><input value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} placeholder="Search students by name or email" />{filteredStudents.slice(0, 10).map((student) => <label key={student._id}><input type="checkbox" checked={classForm.studentIds.includes(student._id)} onChange={() => toggleStudent(student._id)} />{personName(student)}</label>)}{filteredStudents.length > 10 && <small>Refine the search to see more students.</small>}</fieldset><div className="form-actions"><button type="button" className="secondary" onClick={() => setComposer(null)}>Cancel</button><button type="submit" className="primary" disabled={submitting}>{submitting ? 'Sending…' : 'Send to API'}</button></div></form></section>}
    {composer === 'subject' && <section className="composer structured-composer"><div><h2>Add subject</h2><p>Add a subject to an existing class. Assigning a teacher is optional.</p></div><form className="structured-form" onSubmit={(event) => void createSubject(event)}><label>Subject name<input required maxLength={100} value={subjectForm.name} onChange={(event) => setSubjectForm({ ...subjectForm, name: event.target.value })} placeholder="Mathematics" /></label><label>Subject code<input required maxLength={30} value={subjectForm.code} onChange={(event) => setSubjectForm({ ...subjectForm, code: event.target.value.toUpperCase() })} placeholder="MATH-10-A" /></label><label>Search classes<input value={classQuery} onChange={(event) => setClassQuery(event.target.value)} placeholder="Type a class or section" /></label><label>Class<select required value={subjectForm.classId} onChange={(event) => setSubjectForm({ ...subjectForm, classId: event.target.value })}><option value="">Choose a class</option>{filteredClasses.map((item) => <option key={item._id} value={item._id}>{className(item)}</option>)}</select></label><label>Search teachers<input value={teacherQuery} onChange={(event) => setTeacherQuery(event.target.value)} placeholder="Type a name or email" /></label><label>Teacher (optional)<select value={subjectForm.teacherId} onChange={(event) => setSubjectForm({ ...subjectForm, teacherId: event.target.value })}><option value="">No teacher assigned</option>{filteredTeachers.map((teacher) => <option key={teacher._id} value={teacher._id}>{personName(teacher)}</option>)}</select></label><div className="form-actions"><button type="button" className="secondary" onClick={() => setComposer(null)}>Cancel</button><button type="submit" className="primary" disabled={submitting}>{submitting ? 'Sending…' : 'Send to API'}</button></div></form></section>}
    {notice && <p className="form-success" role="status">{notice}</p>}{error && <div className="state error compact"><strong>Couldn’t complete the request.</strong><span>{error}</span></div>}
    <ClassTable title="Classes" loading={loading} count={classes.length}><thead><tr><th>Name</th><th>Section</th><th>Academic year</th><th>Class teacher</th><th>Students</th></tr></thead><tbody>{classes.map((item) => <tr key={item._id}><td>{item.name}</td><td>{item.section}</td><td>{item.academicYear}</td><td title={item.classTeacherId}>{resolve('teacher', item.classTeacherId)}</td><td>{(item.studentIds ?? []).length}</td></tr>)}</tbody></ClassTable>
    <ClassTable title="Subjects" loading={loading} count={subjects.length} extraClass="subject-list"><thead><tr><th>Name</th><th>Code</th><th>Class</th><th>Teacher</th></tr></thead><tbody>{subjects.map((subject) => { const item = classes.find((schoolClass) => schoolClass._id === subject.classId); return <tr key={subject._id}><td>{subject.name}</td><td>{subject.code}</td><td title={subject.classId}>{item ? className(item) : 'Unknown'}</td><td title={subject.teacherId}>{subject.teacherId ? resolve('teacher', subject.teacherId) : '—'}</td></tr>; })}</tbody></ClassTable>
  </>;
}

function ClassTable({ title, count, loading, extraClass = '', children }: { title: string; count: number; loading: boolean; extraClass?: string; children: ReactNode }) {
  return <section className={`data-card ${extraClass}`}><div className="data-top"><div><h2>{title}</h2><span>{loading ? 'Loading…' : `${count} record${count === 1 ? '' : 's'}`}</span></div></div>{loading ? <div className="state">Loading from the API Gateway…</div> : <div className="table-wrap"><table>{children}</table></div>}</section>;
}
