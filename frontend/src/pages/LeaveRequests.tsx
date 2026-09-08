import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import './LeaveRequests.css';

const SERVICE_URL = (import.meta.env.VITE_LEAVE_SERVICE_URL as string | undefined) ?? 'http://localhost:3010';
const TABS = ['all', 'pending', 'approved', 'rejected'] as const;
type Tab = (typeof TABS)[number];
type LeaveRequest = { _id?: string; requesterId: string; requesterType: 'student' | 'teacher'; fromDate?: string; toDate?: string; reason?: string; status?: 'pending' | 'approved' | 'rejected'; reviewedBy?: string };

async function listLeaves(): Promise<LeaveRequest[]> {
  let response: Response;
  try { response = await fetch(`${SERVICE_URL}/leave-requests`); }
  catch { throw new Error(`Unable to reach the leave service at ${SERVICE_URL}.`); }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw new Error(`Leave service returned ${response.status}.`);
  if (!Array.isArray(body)) return [];
  return body.filter((item): item is LeaveRequest => typeof item === 'object' && item !== null && typeof (item as LeaveRequest).requesterId === 'string');
}

function dateValue(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? undefined : parsed;
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysBetween(request: LeaveRequest): number | string {
  const from = dateValue(request.fromDate);
  const to = dateValue(request.toDate);
  return from !== undefined && to !== undefined ? Math.max(1, Math.round((to - from) / 86400000) + 1) : '-';
}

function statusOf(request: LeaveRequest): string { return request.status ?? 'pending'; }

export function LeaveRequests() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [tab, setTab] = useState<Tab>('pending');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listLeaves().then(setRequests).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load leave requests.')).finally(() => setIsLoading(false));
  }, []);

  const roles = useMemo(() => ['student', 'teacher'], []);
  const visible = useMemo(() => requests.filter((request) => (tab === 'all' || statusOf(request) === tab) && (!department || request.requesterType === department)), [department, requests, tab]);
  const pending = requests.filter((request) => statusOf(request) === 'pending').length;
  const approvedToday = requests.filter((request) => statusOf(request) === 'approved' && dateValue(request.fromDate) !== undefined && dateValue(request.fromDate)! <= Date.now() && dateValue(request.toDate) !== undefined && dateValue(request.toDate)! >= Date.now()).length;
  const onLeaveToday = requests.filter((request) => statusOf(request) === 'approved' && dateValue(request.fromDate) !== undefined && dateValue(request.fromDate)! <= Date.now() && dateValue(request.toDate) !== undefined && dateValue(request.toDate)! >= Date.now()).length;
  const rejected = requests.filter((request) => statusOf(request) === 'rejected').length;
  const rejectionRate = requests.length ? Math.round((rejected / requests.length) * 100) : 0;

  return (
    <AppShell title="Leave Management" subtitle="Approve staff and student absence requests, track substitute cover plans." activeNav="Leave" showNavIcons>
      <div className="leave-metrics" aria-label="Leave metrics">
        <Metric label="Pending Requests" value={String(pending)} detail="Action required" tone="warning" />
        <Metric label="Approved Today" value={String(approvedToday)} detail="Leaves verified" />
        <Metric label="On Leave Today" value={String(onLeaveToday)} detail="Based on approved dates" />
        <Metric label="Rejection Rate" value={`${rejectionRate}%`} detail="From leave records" />
      </div>
      <section className="leave-card" aria-label="Leave requests">
        <div className="leave-toolbar">
          <div className="leave-tabs" role="tablist">
            {TABS.map((value) => <button key={value} className={tab === value ? 'is-active' : ''} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}>{value === 'all' ? 'All Requests' : value[0].toUpperCase() + value.slice(1)}{value === 'pending' ? ` (${pending})` : ''}</button>)}
          </div>
          <label className="leave-filter"><span>Department:</span><select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">All</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
        </div>
        {isLoading && <p className="leave-state">Loading leave requests...</p>}
        {!isLoading && error && <p className="leave-state leave-state--error" role="alert">{error}</p>}
        {!isLoading && !error && <div className="leave-table-wrap"><table className="leave-table"><thead><tr><th>Requester ID</th><th>Requester Type</th><th>Reason</th><th>From Date</th><th>To Date</th><th>Days</th><th>Status</th></tr></thead><tbody>{visible.map((request) => <tr key={request._id ?? `${request.requesterId}-${request.fromDate}-${request.toDate}`}><th>{request.requesterId}</th><td>{request.requesterType}</td><td>{request.reason ?? '-'}</td><td>{formatDate(request.fromDate)}</td><td>{formatDate(request.toDate)}</td><td>{daysBetween(request)}</td><td><span className={`leave-badge leave-badge--${statusOf(request)}`}>{statusOf(request)}</span></td></tr>)}</tbody></table>{visible.length === 0 && <p className="leave-state">No leave requests match this view.</p>}</div>}
      </section>
    </AppShell>
  );
}

function Metric({ label, value, detail, tone = 'default' }: { label: string; value: string; detail: string; tone?: 'default' | 'warning' }) {
  return <article className={`leave-metric leave-metric--${tone}`}><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}

export default LeaveRequests;
