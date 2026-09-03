import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import './Admission.css';

const SERVICE_URL = (import.meta.env.VITE_ADMISSION_SERVICE_URL as string | undefined) ?? 'http://localhost:3004';

type AdmissionRecord = {
  _id?: string;
  applicationNo: string;
  studentName?: string;
  grade?: string;
  guardianEmail?: string;
  status?: string;
  createdAt?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${SERVICE_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  } catch {
    throw new Error(`Unable to reach the admission service at ${SERVICE_URL}.`);
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw new Error(`Admission service returned ${response.status}.`);
  return body as T;
}

function getAdmissions(value: unknown): AdmissionRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is AdmissionRecord => typeof item === 'object' && item !== null && typeof (item as AdmissionRecord).applicationNo === 'string');
}

function statusOf(admission: AdmissionRecord): string { return admission.status?.toLowerCase() || 'submitted'; }

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function Admission() {
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void request<unknown>('/admissions').then((value) => setAdmissions(getAdmissions(value))).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load admissions.')).finally(() => setIsLoading(false));
  }, []);

  const grades = useMemo(() => [...new Set(admissions.map((admission) => admission.grade).filter((grade): grade is string => Boolean(grade)))].sort(), [admissions]);
  const visible = useMemo(() => admissions.filter((admission) => `${admission.applicationNo} ${admission.studentName ?? ''} ${admission.grade ?? ''}`.toLowerCase().includes(search.toLowerCase()) && (!gradeFilter || admission.grade === gradeFilter)), [admissions, gradeFilter, search]);
  const count = (status: string) => admissions.filter((admission) => statusOf(admission) === status).length;

  async function createAdmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = { applicationNo: String(form.get('applicationNo') ?? '').trim(), studentName: String(form.get('studentName') ?? '').trim(), grade: String(form.get('grade') ?? '').trim(), guardianEmail: String(form.get('guardianEmail') ?? '').trim() };
    if (!data.applicationNo) return;
    setIsSaving(true);
    setError(null);
    try {
      const created = await request<AdmissionRecord>('/admissions', { method: 'POST', body: JSON.stringify({ data }) });
      setAdmissions((current) => [...current, created]);
      setIsCreateOpen(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create admission.'); }
    finally { setIsSaving(false); }
  }

  return (
    <AppShell title="Online Admissions" subtitle="Review incoming student registrations and verified attachments." activeNav="Admissions" showNavIcons>
      <div className="admission-metrics" aria-label="Admission metrics">
        <Metric label="Total Applications" value={String(admissions.length)} detail="From the admission service" />
        <Metric label="Pending Review" value={String(count('submitted') + count('pending'))} detail="Submitted applications" tone="warning" />
        <Metric label="Approved" value={String(count('approved'))} detail="Based on application status" />
        <Metric label="Rejected" value={String(count('rejected'))} detail="Based on application status" tone="danger" />
      </div>
      <section className="admission-card" aria-label="Admission applications">
        <div className="admission-toolbar">
          <label className="admission-search"><span className="sr-only">Search applicants</span><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicant name..." /></label>
          <label className="admission-filter"><span>Class Applied:</span><select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)}><option value="">All</option>{grades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}</select></label>
          <button className="admission-create" type="button" onClick={() => setIsCreateOpen(true)}>+ <span>New Application</span></button>
        </div>
        {isLoading && <p className="admission-state">Loading applications...</p>}
        {!isLoading && error && <p className="admission-state admission-state--error" role="alert">{error}</p>}
        {!isLoading && !error && <div className="admission-table-wrap"><table className="admission-table"><thead><tr><th>Application ID</th><th>Student Name</th><th>Class Applied</th><th>Guardian Name</th><th>Submitted Date</th><th>Documents</th><th>Status</th><th>Action</th></tr></thead><tbody>{visible.map((admission) => <tr key={admission._id ?? admission.applicationNo}><th>{admission.applicationNo}</th><td>{admission.studentName ?? '-'}</td><td>{admission.grade ?? '-'}</td><td>{admission.guardianEmail ?? '-'}</td><td>{formatDate(admission.createdAt)}</td><td>-</td><td><span className={`admission-badge admission-badge--${statusOf(admission)}`}>{statusOf(admission)}</span></td><td>-</td></tr>)}</tbody></table>{visible.length === 0 && <p className="admission-state">No applications match these filters.</p>}</div>}
      </section>
      {isCreateOpen && <div className="admission-modal-backdrop"><form className="admission-modal" onSubmit={(event) => void createAdmission(event)}><div className="admission-modal__heading"><h2>New Application</h2><button type="button" aria-label="Close" onClick={() => setIsCreateOpen(false)}>×</button></div><label>Application ID<input name="applicationNo" required /></label><label>Student name<input name="studentName" /></label><label>Class applied<input name="grade" /></label><label>Guardian email<input name="guardianEmail" type="email" /></label><button className="admission-create" disabled={isSaving} type="submit">{isSaving ? 'Creating...' : 'Create Application'}</button></form></div>}
    </AppShell>
  );
}

function Metric({ label, value, detail, tone = 'default' }: { label: string; value: string; detail: string; tone?: 'default' | 'warning' | 'danger' }) {
  return <article className={`admission-metric admission-metric--${tone}`}><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}

export default Admission;