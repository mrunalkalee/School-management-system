import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import './ClassSubjectManagement.css';

const SERVICE_URL = (import.meta.env.VITE_CLASS_SUBJECT_SERVICE_URL as string | undefined) ?? 'http://localhost:3003';
type SchoolClass = { _id?: string; name: string; section: string; academicYear: string; classTeacherId: string; studentIds: string[] };
type Subject = { _id?: string; name: string; code: string; classId: string; teacherId?: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(`${SERVICE_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } }); }
  catch { throw new Error(`Unable to reach the class & subject service at ${SERVICE_URL}.`); }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw new Error(`Class & subject service returned ${response.status}.`);
  return body as T;
}

function isClass(value: unknown): value is SchoolClass { return typeof value === 'object' && value !== null && typeof (value as SchoolClass).name === 'string' && typeof (value as SchoolClass).section === 'string'; }
function isSubject(value: unknown): value is Subject { return typeof value === 'object' && value !== null && typeof (value as Subject).name === 'string' && typeof (value as Subject).classId === 'string'; }
function displayClass(schoolClass: SchoolClass): string { return `${schoolClass.name}${schoolClass.section ? ` ${schoolClass.section}` : ''}`; }

export function ClassSubjectManagement() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'class' | 'subject' | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setError(null);
    try {
      const [classData, subjectData] = await Promise.all([request<unknown>('/classes'), request<unknown>('/subjects')]);
      const nextClasses = Array.isArray(classData) ? classData.filter(isClass) : [];
      setClasses(nextClasses);
      setSubjects(Array.isArray(subjectData) ? subjectData.filter(isSubject) : []);
      setSelectedClassId((current) => nextClasses.some((item) => item._id === current) ? current : nextClasses[0]?._id ?? '');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load academic structure.'); }
    finally { setIsLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);

  const selectedClass = classes.find((item) => item._id === selectedClassId);
  const selectedSubjects = useMemo(() => subjects.filter((subject) => subject.classId === selectedClassId), [selectedClassId, subjects]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = modal === 'class'
      ? { name: String(form.get('name') ?? '').trim(), section: String(form.get('section') ?? '').trim(), academicYear: String(form.get('academicYear') ?? '').trim(), classTeacherId: String(form.get('classTeacherId') ?? '').trim(), studentIds: [] as string[] }
      : { name: String(form.get('name') ?? '').trim(), code: String(form.get('code') ?? '').trim(), classId: selectedClassId, teacherId: String(form.get('teacherId') ?? '').trim() || undefined };
    setSaving(true);
    try { await request(modal === 'class' ? '/classes' : '/subjects', { method: 'POST', body: JSON.stringify(data) }); setModal(null); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save.'); }
    finally { setSaving(false); }
  }

  return <AppShell title="Class & Subject Management" subtitle="Configure class streams, subject lists, and teacher assignments." activeNav="Academics" showNavIcons>
    <div className="academic-heading"><strong>Academic Structure - Term 1, 2026</strong><div><button className="academic-secondary" type="button" onClick={() => setModal('class')}>+ New Class Stream</button><button className="academic-primary" type="button" disabled={!selectedClassId} onClick={() => setModal('subject')}>+ New Subject</button></div></div>
    {error && <p className="academic-error" role="alert">{error}</p>}
    <div className="academic-panels">
      <section className="academic-card class-streams"><h2>Class Streams</h2>{isLoading && <p className="academic-state">Loading classes...</p>}{!isLoading && classes.length === 0 && <p className="academic-state">No classes available.</p>}{classes.map((schoolClass) => <button className={`class-stream ${schoolClass._id === selectedClassId ? 'is-selected' : ''}`} type="button" key={schoolClass._id ?? displayClass(schoolClass)} onClick={() => setSelectedClassId(schoolClass._id ?? '')}><strong>{displayClass(schoolClass)}</strong><span>{schoolClass.studentIds.length} Students</span><b>›</b></button>)}</section>
      <section className="academic-card subject-panel"><div className="subject-heading"><div><h2>{selectedClass ? `${displayClass(selectedClass)} Subjects` : 'Subjects'}</h2><p>{selectedClass ? `Class Teacher: ${selectedClass.classTeacherId} · Academic year: ${selectedClass.academicYear}` : 'Select a class stream to view subjects.'}</p></div><span className="capacity-badge">Room capacity unavailable</span></div>{selectedClassId && selectedSubjects.length === 0 && <p className="academic-state">No subjects are assigned to this class.</p>}{selectedClassId && selectedSubjects.length > 0 && <div className="subject-table-wrap"><table className="subject-table"><thead><tr><th>Subject Name</th><th>Assigned Teacher</th><th>Periods/Week</th><th>Action</th></tr></thead><tbody>{selectedSubjects.map((subject) => <tr key={subject._id ?? subject.code}><th>{subject.name}<small>Academic course code: {subject.code}</small></th><td>{subject.teacherId ?? <span className="unassigned">Unassigned</span>}</td><td>Not available</td><td><span className="action-unavailable">Assign unavailable</span></td></tr>)}</tbody></table></div>}</section>
    </div>
    {modal && <div className="academic-modal-backdrop"><form className="academic-modal" onSubmit={(event) => void create(event)}><div className="academic-modal-heading"><h2>{modal === 'class' ? 'New Class Stream' : 'New Subject'}</h2><button type="button" aria-label="Close" onClick={() => setModal(null)}>×</button></div>{modal === 'class' ? <><label>Name<input name="name" required /></label><label>Section<input name="section" required /></label><label>Academic year<input name="academicYear" required /></label><label>Class teacher ID<input name="classTeacherId" required /></label></> : <><label>Subject name<input name="name" required /></label><label>Subject code<input name="code" required /></label><label>Teacher ID<input name="teacherId" /></label></>}<button className="academic-primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Create'}</button></form></div>}
  </AppShell>;
}

export default ClassSubjectManagement;