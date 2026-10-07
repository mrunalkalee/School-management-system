import { FormEvent, useEffect, useMemo, useState } from 'react';
import { clearSession, gateway, loadSession, saveSession, type Session } from './api/gateway';
import { AdminUserManagement } from './components/AdminUserManagement';
import { ClassesSubjectsPage } from './components/ClassesSubjectsPage';
import { StudentsPage } from './components/StudentsPage';
import { AssignmentsPage } from './components/AssignmentsPage';
import { StructuredResourcePage } from './components/StructuredResourcePage';
import { PerformancePage } from './components/PerformancePage';
import { type EntityType, useEntityNames } from './hooks/useEntityNames';
import './App.css';
import './zip-reference.css';

type Module = { id: string; label: string; endpoint: string; group: string; description: string; action?: string };
const modules: Module[] = [
  { id: 'dashboard', label: 'Dashboard', endpoint: '/dashboard/admin', group: 'Overview', description: 'A live, school-wide operational overview.' },
  { id: 'students', label: 'Students', endpoint: '/students', group: 'Academics', description: 'Student profiles and enrolment records.', action: 'Add student' },
  { id: 'teachers', label: 'Teachers', endpoint: '/teachers', group: 'Academics', description: 'Teacher profiles and assignments.', action: 'Add teacher' },
  { id: 'classes', label: 'Classes & Subjects', endpoint: '/classes', group: 'Academics', description: 'Class sections, subject mapping and allocation.', action: 'Add class' },
  { id: 'timetables', label: 'Timetable', endpoint: '/timetables', group: 'Academics', description: 'Weekly class timetable and periods.', action: 'Add period' },
  { id: 'attendance', label: 'Attendance', endpoint: '/attendance', group: 'Engagement', description: 'Daily attendance records and status.', action: 'Mark attendance' },
  { id: 'assignments', label: 'Assignments', endpoint: '/assignments', group: 'Engagement', description: 'Assignments, submissions and grading.', action: 'Create assignment' },
  { id: 'exams', label: 'Examinations', endpoint: '/exams', group: 'Engagement', description: 'Exam schedules and results entry.', action: 'Create exam' },
  { id: 'performance', label: 'Performance', endpoint: '/performance', group: 'Engagement', description: 'Student performance and report cards.' },
  { id: 'admissions', label: 'Admissions', endpoint: '/admissions', group: 'Administration', description: 'Admission applications and approval status.', action: 'New application' },
  { id: 'fees', label: 'Fees', endpoint: '/fees/structures', group: 'Administration', description: 'Fee structures, payments and billing.', action: 'Create fee structure' },
  { id: 'leave', label: 'Leave Requests', endpoint: '/leave-requests', group: 'Administration', description: 'Leave requests and approval workflow.', action: 'New request' },
  { id: 'certificates', label: 'Certificates', endpoint: '/certificates', group: 'Administration', description: 'Digital ID cards and certificate records.', action: 'Generate certificate' },
  { id: 'notices', label: 'Notices', endpoint: '/notices', group: 'Resources', description: 'School notices, events and announcements.', action: 'Create notice' },
  { id: 'library', label: 'Library', endpoint: '/library/books', group: 'Resources', description: 'Book catalogue and issue records.', action: 'Add book' },
  { id: 'transport', label: 'Transport', endpoint: '/transport/routes', group: 'Resources', description: 'Bus routes and student allocations.', action: 'Add route' },
  { id: 'auth', label: 'Auth & Roles', endpoint: '/auth/verify', group: 'Administration', description: 'Current authenticated account and role.' },
];
const groups = ['Overview', 'Academics', 'Engagement', 'Administration', 'Resources'];
const readable = (value: string) => value.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').replace(/^./, (x) => x.toUpperCase());
const navIcons: Record<string, string> = { dashboard: '⊞', students: '👤', teachers: '🎓', classes: '📚', timetables: '🗓', attendance: '✓', assignments: '📝', exams: '📋', performance: '📈', admissions: '📥', fees: '💰', leave: '📆', certificates: '🏅', notices: '📢', library: '📖', transport: '🚌', auth: '🔐' };

export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession);
  return session ? <Application session={session} onLogout={() => { clearSession(); setSession(null); }} /> : <Login onLogin={setSession} />;
}

function Application({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [active, setActive] = useState(() => window.location.pathname === '/admin/users' && session.user.role === 'admin' ? 'admin-users' : 'dashboard');
  useEffect(() => {
    const sync = () => setActive(window.location.pathname === '/admin/users' && session.user.role === 'admin' ? 'admin-users' : 'dashboard');
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [session.user.role]);
  const navigate = (id: string) => {
    const path = id === 'admin-users' ? '/admin/users' : '/';
    window.history.pushState({}, '', path);
    setActive(id);
  };
  if (session.user.role === 'admin') return <AdminPortal session={session} active={active} onNavigate={navigate} onLogout={onLogout} />;
  return <Portal session={session} active={active} onNavigate={navigate} onLogout={onLogout} />;
}

function AdminPortal({ session, active, onNavigate, onLogout }: { session: Session; active: string; onNavigate: (id: string) => void; onLogout: () => void }) {
  const adminModules = [...modules, { id: 'admin-users', label: 'User Management', endpoint: '/auth/users', group: 'Administration', description: 'Create and manage BrightBoard accounts.' }];
  const module = adminModules.find((item) => item.id === active) ?? adminModules[0];
  return <div className="app-shell"><aside className="sidebar"><div className="sidebar-brand"><span className="brand-mark">B</span><span><strong>BrightBoard</strong><small>School Management</small></span></div><nav>{groups.map((group) => <section className="nav-group" key={group}><span>{group}</span>{adminModules.filter((item) => item.group === group).map((item) => <button type="button" key={item.id} className={item.id === active ? 'nav-item selected' : 'nav-item'} onClick={() => onNavigate(item.id)}><i>{navIcons[item.id] ?? '◉'}</i>{item.label}</button>)}</section>)}</nav><div className="profile"><span>{session.user.name.slice(0, 2).toUpperCase()}</span><div><strong>{session.user.name}</strong><small className="role-tag role-tag--admin">Admin</small></div><button type="button" onClick={onLogout} aria-label="Sign out">↪</button></div></aside><div className="workspace"><header><h1>{module.label}</h1><div className="header-actions"><span className="header-avatar">{session.user.name.slice(0, 2).toUpperCase()}</span></div></header><main>{active === 'admin-users' ? <AdminUserManagement session={session} /> : <ResourcePage module={module} session={session} />}</main></div></div>;
}

function Login({ onLogin }: { onLogin: (session: Session) => void }) {
  const [role, setRole] = useState('admin'); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(''); const form = new FormData(event.currentTarget); try { const session = await gateway<Session>('/auth/login', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); if (session.user.role !== role) throw new Error(`This account is registered as ${session.user.role}, not ${role}.`); saveSession(session); onLogin(session); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.'); } finally { setBusy(false); } }
  return <div className="login"><section className="login-brand"><div className="brand-mark">B</div><h1>BrightBoard</h1><p>One place for every part of school life.</p><div className="login-statement"><strong>Connected school operations</strong><span>Admissions, academics, attendance, billing, resources and family portals—powered by your live services.</span></div></section><main className="login-card"><span className="eyebrow">WELCOME BACK</span><h2>Sign in to BrightBoard</h2><p>Use an account created in the Auth service.</p><div className="role-list">{['admin', 'teacher', 'student', 'parent'].map((item) => <button key={item} className={role === item ? 'role active' : 'role'} onClick={() => setRole(item)} type="button">{readable(item)}</button>)}</div><form onSubmit={(event) => void submit(event)}><label>Email or ID<input required name="email" type="email" placeholder="name@school.edu" /></label><label>Password<input required name="password" type="password" placeholder="Enter your password" /></label>{error && <p className="form-error">{error}</p>}<button className="primary login-button" disabled={busy}>{busy ? 'Signing in…' : `Sign in as ${readable(role)}`}</button></form></main></div>;
}

function Portal({ session, active, onNavigate, onLogout }: { session: Session; active: string; onNavigate: (id: string) => void; onLogout: () => void }) { const visibleModules = session.user.role === 'parent' ? modules.filter((item) => ['dashboard', 'performance', 'timetables', 'notices', 'library', 'transport'].includes(item.id)) : modules; const module = visibleModules.find((item) => item.id === active) ?? visibleModules[0]; return <div className="app-shell"><aside className="sidebar"><div className="sidebar-brand"><span className="brand-mark">B</span><span><strong>BrightBoard</strong><small>School Management</small></span></div><nav>{groups.map((group) => <section className="nav-group" key={group}><span>{group}</span>{visibleModules.filter((item) => item.group === group).map((item) => <button type="button" key={item.id} className={item.id === active ? 'nav-item selected' : 'nav-item'} onClick={() => onNavigate(item.id)}><i>{navIcons[item.id]}</i>{item.label}</button>)}</section>)}</nav><div className="profile"><span>{session.user.name.slice(0, 2).toUpperCase()}</span><div><strong>{session.user.name}</strong><small className={`role-tag role-tag--${session.user.role}`}>{readable(session.user.role)}</small></div><button type="button" onClick={onLogout} aria-label="Sign out">↪</button></div></aside><div className="workspace"><header><h1>{module.label}</h1><div className="header-actions"><label className="header-search"><span>⌕</span><input placeholder="Search students, teachers…" /></label><button className="header-icon" type="button" aria-label="Notifications">🔔<b /></button><button className="header-icon" type="button" aria-label="Settings">⚙</button><span className="header-avatar">{session.user.name.slice(0, 2).toUpperCase()}</span></div></header><main><ResourcePage module={module} session={session} /></main></div></div>; }

function ResourcePage({ module, session }: { module: Module; session: Session }) {
  const structured = ['teachers', 'timetables', 'attendance', 'exams', 'fees', 'leave', 'admissions', 'certificates', 'notices', 'library', 'transport'] as const;
  return module.id === 'students' ? <StudentsPage session={session} /> : module.id === 'classes' ? <ClassesSubjectsPage session={session} /> : module.id === 'assignments' ? <AssignmentsPage session={session} /> : module.id === 'performance' ? <PerformancePage session={session} /> : structured.includes(module.id as typeof structured[number]) ? <StructuredResourcePage id={module.id as typeof structured[number]} title={module.description} endpoint={module.endpoint} action={module.action ?? 'Create'} session={session} /> : <GenericResourcePage module={module} session={session} />;
}
function GenericResourcePage({ module, session }: { module: Module; session: Session }) { const [data, setData] = useState<unknown>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [query, setQuery] = useState(''); const [composer, setComposer] = useState(false); const [payload, setPayload] = useState('{\n  \n}'); const [submitting, setSubmitting] = useState(false); const endpoint = useMemo(() => module.id === 'dashboard' ? dashboardEndpoint(session) : module.endpoint, [module, session]); async function refresh() { setLoading(true); setError(''); try { setData(await gateway<unknown>(endpoint, {}, session.access_token)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load data.'); } finally { setLoading(false); } } useEffect(() => { void refresh(); }, [endpoint]); const records = Array.isArray(data) ? data : data && typeof data === 'object' ? [data as Record<string, unknown>] : []; const filtered = records.filter((record) => JSON.stringify(record).toLowerCase().includes(query.toLowerCase())); async function create() { setSubmitting(true); setError(''); try { await gateway(module.endpoint, { method: 'POST', body: JSON.stringify(JSON.parse(payload)) }, session.access_token); setComposer(false); await refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Invalid request.'); } finally { setSubmitting(false); } } return <><div className="page-intro"><div><p>{module.description}</p><small>Data is loaded only from <code>{endpoint}</code>.</small></div><div className="toolbar"><button className="secondary" onClick={() => void refresh()} disabled={loading}>Refresh</button>{module.action && <button className="primary" onClick={() => setComposer(true)}>{module.action}</button>}</div></div>{composer && <section className="composer"><div><h2>{module.action}</h2><p>Enter a payload matching this service’s API contract.</p></div><textarea value={payload} onChange={(event) => setPayload(event.target.value)} spellCheck={false} aria-label="JSON request payload" /><div><button className="secondary" onClick={() => setComposer(false)}>Cancel</button><button className="primary" onClick={() => void create()} disabled={submitting}>{submitting ? 'Sending…' : 'Send to API'}</button></div></section>}<section className="data-card"><div className="data-top"><div><h2>Live records</h2><span>{loading ? 'Loading…' : `${filtered.length} record${filtered.length === 1 ? '' : 's'}`}</span></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search returned data" aria-label="Search records" /></div>{error ? <div className="state error"><strong>Couldn’t load this module.</strong><span>{error}</span><button className="secondary" onClick={() => void refresh()}>Try again</button></div> : loading ? <div className="state">Loading from the API Gateway…</div> : filtered.length ? <Records rows={filtered} /> : <div className="state">No records returned. Create one using the live service, then refresh.</div>}</section></>; }
function dashboardEndpoint(session: Session): string { const profile = session.user.linkedProfileId; const child = session.user.linkedStudentIds?.[0]; if (session.user.role === 'parent' && child) return `/dashboard/parent/${child}`; return profile && session.user.role !== 'admin' ? `/dashboard/${session.user.role}/${profile}` : '/dashboard/admin'; }
function Records({ rows }: { rows: unknown[] }) {
  const objects = rows.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object');
  const keys = [...new Set(objects.flatMap((row) => Object.keys(row).filter((key) => !['_id', '__v', 'password', 'refreshToken'].includes(key))))].slice(0, 7);
  const idsByType: Partial<Record<EntityType, string[]>> = {};
  const entityFor = (row: Record<string, unknown>, field: string): EntityType | undefined => {
    if (field === 'studentId') return 'student';
    if (field === 'classId') return 'class';
    if (field === 'subjectId') return 'subject';
    if (field === 'teacherId' || field === 'classTeacherId' || field === 'markedBy') return 'teacher';
    if (field === 'requesterId') return row.requesterType === 'teacher' ? 'teacher' : 'student';
    return undefined;
  };
  objects.forEach((row) => keys.forEach((field) => {
    const type = entityFor(row, field);
    const id = row[field];
    if (type && typeof id === 'string') (idsByType[type] ??= []).push(id);
  }));
  const { resolve } = useEntityNames(idsByType, loadSession()?.access_token ?? '');
  return <div className="table-wrap"><table><thead><tr>{keys.map((key) => <th key={key}>{readable(key)}</th>)}</tr></thead><tbody>{objects.map((row, index) => <tr key={String(row._id ?? index)}>{keys.map((key) => {
    const type = entityFor(row, key); const id = row[key];
    return <td key={key}>{type && typeof id === 'string' ? <span title={id}>{resolve(type, id)}</span> : format(id)}</td>;
  })}</tr>)}</tbody></table></div>;
}
function format(value: unknown): string { if (value === null || value === undefined) return '—'; if (typeof value === 'object') return Array.isArray(value) ? `${value.length} item(s)` : 'View details'; return String(value); }
