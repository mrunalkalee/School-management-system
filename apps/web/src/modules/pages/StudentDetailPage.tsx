import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StudentDetails } from '../components/StudentDetails';
import { deleteStudent, getStudentById } from '../services/students.service';
import type { Student } from '../types/student.types';

export function StudentDetailPage() {
  const { id = '' } = useParams(); const navigate = useNavigate(); const [student, setStudent] = useState<Student>(); const [error, setError] = useState(''); const [deleting, setDeleting] = useState(false);
  useEffect(() => { getStudentById(id).then(setStudent).catch(() => setError('Student not found or unavailable.')); }, [id]);
  if (error) return <main className="students-state students-state--error"><strong>Unable to load student</strong><p>{error}</p><button className="students-secondary-button" onClick={() => navigate('/students')}>Back to Students</button></main>;
  if (!student) return <main className="students-state" aria-busy="true">Loading student profile…</main>;
  const remove = async () => { if (!window.confirm('Delete this student record? The record will be marked inactive.')) return; setDeleting(true); try { await deleteStudent(id); navigate('/students'); } catch { setError('Unable to delete this student.'); } finally { setDeleting(false); } };
  return <main className="students-page"><div className="students-shell"><div className="student-detail-actions"><button className="students-secondary-button" onClick={() => navigate('/students')}>Back to Students</button><span /><button className="students-secondary-button" onClick={() => navigate(`/students/${id}/edit`)}>Edit Student</button><button className="students-danger-button" disabled={deleting} onClick={remove}>{deleting ? 'Deleting…' : 'Delete'}</button></div><StudentDetails student={student} /></div></main>;
}
