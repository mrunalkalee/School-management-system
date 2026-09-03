import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import './FeeManagement.css';

const SERVICE_URL = (import.meta.env.VITE_FEE_SERVICE_URL as string | undefined) ?? 'http://localhost:3009';

type Fee = {
  _id?: string;
  studentId: string;
  term?: string;
  amount?: number;
  paid?: number;
  dueDate?: string;
  status?: string;
};

async function listFees(): Promise<Fee[]> {
  let response: Response;
  try {
    response = await fetch(`${SERVICE_URL}/fees`);
  } catch {
    throw new Error(`Unable to reach the fee service at ${SERVICE_URL}.`);
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw new Error(`Fee service returned ${response.status}.`);
  if (!Array.isArray(body)) return [];
  return body.filter((fee): fee is Fee => typeof fee === 'object' && fee !== null && typeof (fee as Fee).studentId === 'string');
}

function money(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusFor(fee: Fee): string {
  if (fee.status) return fee.status;
  if (fee.dueDate && new Date(fee.dueDate).getTime() < Date.now() && (fee.paid ?? 0) < (fee.amount ?? 0)) return 'overdue';
  return (fee.paid ?? 0) >= (fee.amount ?? 0) ? 'paid' : 'pending';
}

export function FeeManagement() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listFees().then(setFees).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load fees.')).finally(() => setIsLoading(false));
  }, []);

  const totals = useMemo(() => {
    const collected = fees.reduce((sum, fee) => sum + (fee.paid ?? 0), 0);
    const billed = fees.reduce((sum, fee) => sum + (fee.amount ?? 0), 0);
    const overdue = fees.filter((fee) => statusFor(fee).toLowerCase() === 'overdue').reduce((sum, fee) => sum + Math.max((fee.amount ?? 0) - (fee.paid ?? 0), 0), 0);
    return { collected, billed, overdue, rate: billed ? Math.round((collected / billed) * 100) : 0 };
  }, [fees]);
  const statuses = useMemo(() => [...new Set(fees.map(statusFor))].sort(), [fees]);
  const visibleFees = useMemo(() => fees.filter((fee) => `${fee.studentId} ${fee.term ?? ''}`.toLowerCase().includes(search.toLowerCase()) && (!statusFilter || statusFor(fee) === statusFilter)), [fees, search, statusFilter]);

  return (
    <AppShell title="Fees" subtitle="Track collections, pending targets, and record student tuition fees." activeNav="Fees" showNavIcons>
      <div className="fee-metrics" aria-label="Fee summary">
        <Metric label="Total Collected" value={money(totals.collected)} detail={`Of ${money(totals.billed)} billed`} />
        <Metric label="Pending" value={money(Math.max(totals.billed - totals.collected, 0))} detail="Based on unpaid balance" />
        <Metric label="Overdue" value={money(totals.overdue)} detail="Based on fee status" tone="warning" />
        <Metric label="Collection Rate" value={`${totals.rate}%`} detail="Collected against billed" />
      </div>
      <section className="fee-card" aria-label="Fee records">
        <div className="fee-toolbar">
          <label className="fee-search"><span className="sr-only">Search student fees</span><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student name..." /></label>
          <label className="fee-filter"><span>Status:</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
        </div>
        {isLoading && <p className="fee-state">Loading fees...</p>}
        {!isLoading && error && <p className="fee-state fee-state--error" role="alert">{error}</p>}
        {!isLoading && !error && <div className="fee-table-wrap"><table className="fee-table"><thead><tr><th>Student Name</th><th>Term</th><th>Fee Type</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead><tbody>{visibleFees.map((fee) => { const status = statusFor(fee); return <tr key={fee._id ?? `${fee.studentId}-${fee.term}-${fee.dueDate}`}><th>{fee.studentId}</th><td>{fee.term ?? '-'}</td><td>Fee</td><td>{money(fee.amount ?? 0)}</td><td>{formatDate(fee.dueDate)}</td><td><span className={`fee-badge fee-badge--${status.toLowerCase()}`}>{status}</span></td></tr>; })}</tbody></table>{visibleFees.length === 0 && <p className="fee-state">No fee records match these filters.</p>}</div>}
      </section>
    </AppShell>
  );
}

function Metric({ label, value, detail, tone = 'default' }: { label: string; value: string; detail: string; tone?: 'default' | 'warning' }) {
  return <article className={`fee-metric fee-metric--${tone}`}><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}

export default FeeManagement;