import { FormEvent, useEffect, useMemo, useState } from 'react';
import { gateway, type Session } from '../api/gateway';
import './AdminUserManagement.css';

type Role = 'admin' | 'teacher' | 'student' | 'parent';
type User = { _id: string; name: string; email: string; role: Role; isActive: boolean; linkedProfileId?: string; linkedStudentIds?: string[] };
type Profile = { _id: string; firstName: string; lastName: string; email: string };

const displayName = (profile: Profile) => [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email;

function securePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*';
  const values = new Uint32Array(16);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('');
}

export function AdminUserManagement({ session }: { session: Session }) {
  const [role, setRole] = useState<Role>('teacher');
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState('');
  const [createProfile, setCreateProfile] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [profileSearch, setProfileSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  async function loadUsers() {
    setLoading(true);
    try { setUsers(await gateway<User[]>('/auth/users', {}, session.access_token)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load users.'); }
    finally { setLoading(false); }
  }

  async function loadProfiles(kind: 'teachers' | 'students') {
    try {
      const profiles = await gateway<Profile[]>(kind === 'teachers' ? '/teachers' : '/students', {}, session.access_token);
      if (kind === 'teachers') setTeachers(profiles); else setStudents(profiles);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load profiles.'); }
  }

  useEffect(() => { void loadUsers(); }, []);
  useEffect(() => {
    setProfileId(''); setCreateProfile(false); setSelectedStudents([]); setProfileSearch('');
    if (role === 'teacher') void loadProfiles('teachers');
    if (role === 'student' || role === 'parent') void loadProfiles('students');
  }, [role]);

  const visibleProfiles = useMemo(() => {
    const source = role === 'teacher' ? teachers : students;
    const search = profileSearch.toLowerCase();
    return source.filter((profile) => displayName(profile).toLowerCase().includes(search) || profile.email.toLowerCase().includes(search));
  }, [role, teachers, students, profileSearch]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true); setError(''); setCreated(null);
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    try {
      let linkedProfileId: string | undefined;
      if (role === 'teacher' || role === 'student') {
        if (createProfile) {
          const [firstName, ...rest] = name.split(/\s+/);
          if (!firstName) throw new Error('Full name is required to create a profile.');
          const endpoint = role === 'teacher' ? '/teachers' : '/students';
          const profile = await gateway<Profile>(endpoint, { method: 'POST', body: JSON.stringify({ firstName, lastName: rest.join(' ') || firstName, email }) }, session.access_token);
          linkedProfileId = profile._id;
        } else {
          if (!profileId) throw new Error('Choose an existing profile or create one.');
          linkedProfileId = profileId;
        }
      }
      if (role === 'parent' && !selectedStudents.length) throw new Error('Select at least one child for this parent account.');
      await gateway('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, ...(linkedProfileId ? { linkedProfileId } : {}), ...(role === 'parent' ? { linkedStudentIds: selectedStudents } : {}) }),
      }, session.access_token);
      setCreated({ email, password });
      event.currentTarget.reset();
      setProfileId(''); setSelectedStudents([]);
      await loadUsers();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create user.'); }
    finally { setSubmitting(false); }
  }

  if (session.user.role !== 'admin') return <section className="state error"><strong>Administrator access required.</strong></section>;

  return <div className="user-management">
    <div className="page-intro"><div><p>Create login accounts and connect them to the appropriate school profiles.</p><small>Only administrators can create or view users.</small></div></div>
    <section className="user-card">
      <h2>Create user</h2>
      <form className="user-form" onSubmit={(event) => void submit(event)}>
        <label>Full Name<input name="name" required maxLength={150} placeholder="Full name" /></label>
        <label>Email<input name="email" type="email" required placeholder="name@school.edu" /></label>
        <label>Password<div className="password-row"><input name="password" required minLength={8} type="text" placeholder="At least 8 characters" /><button className="secondary" type="button" onClick={(event) => { const input = event.currentTarget.previousElementSibling as HTMLInputElement; input.value = securePassword(); input.dispatchEvent(new Event('input', { bubbles: true })); }}>Generate</button></div></label>
        <label>Role<select value={role} onChange={(event) => setRole(event.target.value as Role)}><option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option><option value="parent">Parent</option></select></label>
        {(role === 'teacher' || role === 'student') && <div className="profile-link">
          <label className="toggle"><input type="checkbox" checked={createProfile} onChange={(event) => setCreateProfile(event.target.checked)} /> Create a new {role} profile instead</label>
          {!createProfile && <><input value={profileSearch} onChange={(event) => setProfileSearch(event.target.value)} placeholder={'Search existing ' + role + 's'} /><select value={profileId} onChange={(event) => setProfileId(event.target.value)} required><option value="">Select a profile</option>{visibleProfiles.map((profile) => <option value={profile._id} key={profile._id}>{displayName(profile)} — {profile.email}</option>)}</select></>}
          {createProfile && <small>A {role} profile will be created with this name and email before the login account.</small>}
        </div>}
        {role === 'parent' && <div className="profile-link"><label>Children<input value={profileSearch} onChange={(event) => setProfileSearch(event.target.value)} placeholder="Search students" /></label><div className="student-options">{visibleProfiles.map((student) => <label key={student._id}><input type="checkbox" checked={selectedStudents.includes(student._id)} onChange={(event) => setSelectedStudents((ids) => event.target.checked ? [...ids, student._id] : ids.filter((id) => id !== student._id))} /> {displayName(student)} <small>{student.email}</small></label>)}</div></div>}
        {error && <p className="form-error">{error}</p>}
        <button className="primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create user'}</button>
      </form>
      {created && <aside className="credentials"><strong>User created — share these credentials securely.</strong><span>Email: <code>{created.email}</code></span><span>Password: <code>{created.password}</code></span></aside>}
    </section>
    <section className="data-card"><div className="data-top"><div><h2>Users</h2><span>{loading ? 'Loading…' : users.length + ' account(s)'}</span></div><button className="secondary" type="button" onClick={() => void loadUsers()} disabled={loading}>Refresh</button></div>{loading ? <div className="state">Loading users…</div> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.isActive ? 'Active' : 'Inactive'}</td></tr>)}</tbody></table></div>}</section>
  </div>;
}
