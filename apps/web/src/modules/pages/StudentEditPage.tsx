import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StudentForm } from '../components/StudentForm';
import { getStudentById, updateStudent } from '../services/students.service';
import type { Student } from '../types/student.types';

export function StudentEditPage() {
  const { id = '' } = useParams(); const navigate = useNavigate(); const [student, setStudent] = useState<Student>(); const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { getStudentById(id).then(setStudent).catch(() => setError('Student not found or unavailable.')); }, [id]);
  if (error) return <main className="students-state students-state--error"><strong>Unable to load student</strong><p>{error}</p></main>;
  if (!student) return <main className="students-state" aria-busy="true">Loading student record…</main>;
  return <main className="student-form-page">{error && <p className="students-inline-error" role="alert">{error}</p>}<StudentForm student={student} submitting={submitting} onSubmit={async (data) => { setError(''); setSubmitting(true); try { await updateStudent(id, data); navigate(`/students/${id}`); } catch { setError('Could not save the student. Check the form and try again.'); } finally { setSubmitting(false); } }} /></main>;
}
