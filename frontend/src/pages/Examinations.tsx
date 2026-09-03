import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import './Examinations.css';

const SERVICE_URL = (import.meta.env.VITE_EXAMINATION_SERVICE_URL as string | undefined) ?? 'http://localhost:3008';

type Examination = {
  _id?: string;
  classId: string;
  subject?: string;
  title?: string;
  date?: string;
  results?: unknown[];
};

type ExaminationInput = Pick<Examination, 'classId' | 'subject' | 'title' | 'date'>;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${SERVICE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new Error(`Unable to reach the examination service at ${SERVICE_URL}.`);
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw new Error(`Examination service returned ${response.status}.`);
  return body as T;
}

function getExaminations(value: unknown): Examination[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Examination => typeof item === 'object' && item !== null && typeof (item as Examination).classId === 'string');
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusFor(examination: Examination): 'Scheduled' | 'Completed' {
  return examination.date && new Date(examination.date).getTime() < Date.now() ? 'Completed' : 'Scheduled';
}

export function Examinations() {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [classFilter, setClassFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'results'>('schedule');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try { setExaminations(getExaminations(await request<unknown>('/examinations'))); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load examinations.'); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  const classes = useMemo(() => [...new Set(examinations.map((examination) => examination.classId))].sort(), [examinations]);
  const visibleExaminations = useMemo(() => examinations.filter((examination) => !classFilter || examination.classId === classFilter), [classFilter, examinations]);
  const completed = examinations.filter((examination) => statusFor(examination) === 'Completed').length;

  async function createExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input: ExaminationInput = {
      classId: String(form.get('classId') ?? '').trim(),
      subject: String(form.get('subject') ?? '').trim(),
      title: String(form.get('title') ?? '').trim(),
      date: String(form.get('date') ?? ''),
    };
    if (!input.classId) return;
    setIsSaving(true);
    try {
      const created = await request<Examination>('/examinations', { method: 'POST', body: JSON.stringify({ data: input }) });
      setExaminations((current) => [...current, created]);
      setIsModalOpen(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create examination.'); }
    finally { setIsSaving(false); }
  }

  return (
    <AppShell title="Examinations & Results" subtitle="Manage test schedules, publish report cards, and track academic metrics." activeNav="Examinations" showNavIcons>
      <div className="examination-metrics" aria-label="Examination metrics">
        <Metric label="Upcoming Exams" value={String(examinations.length - completed)} detail="From the examination service" />
        <Metric label="Completed Exams" value={String(completed)} detail="Based on exam dates" />
        <Metric label="Average Score" value="Not available" detail="Results are not exposed as metrics" />
        <Metric label="Results Published" value="Not available" detail="Publishing is not supported" />
      </div>
      <section className="examination-card" aria-label="Examination schedule">
        <div className="examination-toolbar">
          <div className="examination-tabs" role="tablist">
            <button className={activeTab === 'schedule' ? 'is-active' : ''} onClick={() => setActiveTab('schedule')} role="tab" aria-selected={activeTab === 'schedule'}>Exam Schedule</button>
            <button className={activeTab === 'results' ? 'is-active' : ''} onClick={() => setActiveTab('results')} role="tab" aria-selected={activeTab === 'results'}>Results &amp; Publishing</button>
          </div>
          <div className="examination-actions">
            <label className="examination-filter"><span>Class:</span><select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}><option value="">All classes</option>{classes.map((classId) => <option key={classId} value={classId}>{classId}</option>)}</select></label>
            <button className="examination-create" type="button" onClick={() => setIsModalOpen(true)}>+ <span>Create Exam</span></button>
          </div>
        </div>
        {activeTab === 'results' && <p className="examination-notice">Results and publishing are not supported by the current Examination Service.</p>}
        {isLoading && <p className="examination-state">Loading examinations...</p>}
        {!isLoading && error && <p className="examination-state examination-state--error" role="alert">{error}</p>}
        {!isLoading && !error && activeTab === 'schedule' && <div className="examination-table-wrap"><table className="examination-table"><thead><tr><th>Exam Name</th><th>Subject</th><th>Class</th><th>Exam Date</th><th>Results</th><th>Status</th></tr></thead><tbody>{visibleExaminations.map((examination) => <tr key={examination._id ?? `${examination.classId}-${examination.title}-${examination.date}`}><th>{examination.title ?? '-'}</th><td>{examination.subject ?? '-'}</td><td>{examination.classId}</td><td>{formatDate(examination.date)}</td><td>{examination.results?.length ?? 0}</td><td><span className={`examination-badge examination-badge--${statusFor(examination).toLowerCase()}`}>{statusFor(examination)}</span></td></tr>)}</tbody></table>{visibleExaminations.length === 0 && <p className="examination-state">No examinations match this class.</p>}</div>}
      </section>
      {isModalOpen && <div className="examination-modal-backdrop"><form className="examination-modal" onSubmit={(event) => void createExam(event)}><div className="examination-modal__heading"><h2>Create Exam</h2><button type="button" aria-label="Close" onClick={() => setIsModalOpen(false)}>×</button></div><label>Exam title<input name="title" required /></label><label>Subject<input name="subject" /></label><label>Class ID<input name="classId" required /></label><label>Exam date<input name="date" type="date" /></label><button className="examination-create" disabled={isSaving} type="submit">{isSaving ? 'Creating...' : 'Create Exam'}</button></form></div>}
    </AppShell>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="examination-metric"><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}

export default Examinations;