import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import './AssignmentBoard.css';

const SERVICE_URL = (import.meta.env.VITE_ASSIGNMENT_SERVICE_URL as string | undefined) ?? 'http://localhost:3007';

type Assignment = {
  _id?: string;
  classId: string;
  subject?: string;
  title?: string;
  dueDate?: string;
  teacherId?: string;
  submissions?: unknown[];
};

type AssignmentInput = Pick<Assignment, 'classId' | 'subject' | 'title' | 'dueDate' | 'teacherId'>;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${SERVICE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new Error(`Unable to reach the assignment service at ${SERVICE_URL}.`);
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw new Error(`Assignment service returned ${response.status}.`);
  return body as T;
}

function getAssignments(value: unknown): Assignment[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Assignment => typeof item === 'object' && item !== null && typeof (item as Assignment).classId === 'string');
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(assignment: Assignment): boolean {
  return Boolean(assignment.dueDate && new Date(assignment.dueDate).getTime() < Date.now());
}

export function AssignmentBoard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try { setAssignments(getAssignments(await request<unknown>('/assignments'))); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load assignments.'); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  const classes = useMemo(() => [...new Set(assignments.map((assignment) => assignment.classId))].sort(), [assignments]);
  const subjects = useMemo(() => [...new Set(assignments.map((assignment) => assignment.subject).filter((subject): subject is string => Boolean(subject)))].sort(), [assignments]);
  const visibleAssignments = useMemo(() => assignments.filter((assignment) => {
    const searchable = `${assignment.title ?? ''} ${assignment.subject ?? ''} ${assignment.classId}`.toLowerCase();
    return searchable.includes(search.toLowerCase()) && (!classFilter || assignment.classId === classFilter) && (!subjectFilter || assignment.subject === subjectFilter);
  }), [assignments, classFilter, search, subjectFilter]);
  const overdue = assignments.filter(isOverdue).length;

  async function createAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input: AssignmentInput = {
      title: String(form.get('title') ?? '').trim(),
      subject: String(form.get('subject') ?? '').trim(),
      classId: String(form.get('classId') ?? '').trim(),
      dueDate: String(form.get('dueDate') ?? ''),
      teacherId: String(form.get('teacherId') ?? '').trim(),
    };
    if (!input.classId) return;
    setIsSaving(true);
    setError(null);
    try {
      const created = await request<Assignment>('/assignments', { method: 'POST', body: JSON.stringify({ data: input }) });
      setAssignments((current) => [...current, created]);
      setIsCreateOpen(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create assignment.'); }
    finally { setIsSaving(false); }
  }

  return (
    <AppShell title="Assignments" subtitle="Track, review, and evaluate student homework and projects." activeNav="Assignments" showNavIcons>
      <div className="assignment-metrics" aria-label="Assignment metrics">
        <Metric label="Total Assignments" value={String(assignments.length)} detail="From the assignment service" />
        <Metric label="Pending Submissions" value="Not available" detail="Submission status is not defined" />
        <Metric label="Graded" value="Not available" detail="Grading data is not defined" />
        <Metric label="Overdue" value={String(overdue)} detail="Based on due dates" tone="warning" />
      </div>
      <section className="assignment-card" aria-label="Assignments">
        <div className="assignment-toolbar">
          <label className="assignment-search"><span className="sr-only">Search assignments</span><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assignment..." /></label>
          <label className="assignment-filter"><span>Class:</span><select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}><option value="">All</option>{classes.map((classId) => <option key={classId} value={classId}>{classId}</option>)}</select></label>
          <label className="assignment-filter"><span>Subject:</span><select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="">All</option>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select></label>
          <button className="assignment-create" type="button" onClick={() => setIsCreateOpen(true)}>+ <span>Create Assignment</span></button>
        </div>
        {isLoading && <p className="assignment-state">Loading assignments...</p>}
        {!isLoading && error && <p className="assignment-state assignment-state--error" role="alert">{error}</p>}
        {!isLoading && !error && <div className="assignment-table-wrap"><table className="assignment-table"><thead><tr><th>Assignment Title</th><th>Subject</th><th>Class</th><th>Due Date</th><th>Submissions</th><th>Status</th></tr></thead><tbody>{visibleAssignments.map((assignment) => <tr key={assignment._id ?? `${assignment.classId}-${assignment.title}-${assignment.dueDate}`}><th>{assignment.title ?? '-'}</th><td>{assignment.subject ?? '-'}</td><td className="assignment-class">{assignment.classId}</td><td>{formatDate(assignment.dueDate)}</td><td>{assignment.submissions?.length ?? 0}</td><td><span className={`assignment-badge assignment-badge--${isOverdue(assignment) ? 'overdue' : 'active'}`}>{isOverdue(assignment) ? 'Overdue' : 'Active'}</span></td></tr>)}</tbody></table>{visibleAssignments.length === 0 && <p className="assignment-state">No assignments match these filters.</p>}</div>}
      </section>
      {isCreateOpen && <div className="assignment-modal-backdrop"><form className="assignment-modal" onSubmit={(event) => void createAssignment(event)}><div className="assignment-modal__heading"><h2>Create Assignment</h2><button type="button" aria-label="Close" onClick={() => setIsCreateOpen(false)}>×</button></div><label>Assignment title<input name="title" required /></label><label>Subject<input name="subject" /></label><label>Class ID<input name="classId" required /></label><label>Due date<input name="dueDate" type="date" /></label><label>Teacher ID<input name="teacherId" /></label><button className="assignment-create" disabled={isSaving} type="submit">{isSaving ? 'Creating...' : 'Create Assignment'}</button></form></div>}
    </AppShell>
  );
}

function Metric({ label, value, detail, tone = 'default' }: { label: string; value: string; detail: string; tone?: 'default' | 'warning' }) {
  return <article className={`assignment-metric assignment-metric--${tone}`}><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}

export default AssignmentBoard;