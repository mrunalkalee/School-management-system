import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentList } from '../components/StudentList';
import { deleteStudent } from '../services/students.service';

export function StudentsListPage() {
  const navigate = useNavigate(); const [refreshKey, setRefreshKey] = useState(0); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const remove = async (id: string) => { if (!window.confirm('Delete this student record? The record will be marked inactive.')) return; setError(''); setMessage(''); try { await deleteStudent(id); setRefreshKey((value) => value + 1); setMessage('Student was deleted and marked inactive.'); } catch { setError('Unable to delete this student. Please try again.'); } };
  return <main className="students-page"><div className="students-shell"><header className="students-page-header"><div><p className="students-eyebrow">Student Management</p><h1>Students</h1><p>Manage student registrations, profiles and admission information.</p></div><button className="students-primary-button" onClick={() => navigate('/students/new')}>+ Add Student</button></header>{message && <p className="students-success-message" role="status">{message}</p>}{error && <p className="students-inline-error" role="alert">{error}</p>}<StudentList key={refreshKey} onSelect={(id) => navigate(`/students/${id}`)} onEdit={(id) => navigate(`/students/${id}/edit`)} onDelete={remove} /></div></main>;
}
