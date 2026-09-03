import { apiRequest } from './client';
import type { CreateStudentInput, Student, UpdateStudentInput } from '../types/student';

/** GET /students?search= — active students only, matched server-side against name/roll number. */
export function listStudents(search?: string): Promise<Student[]> {
  return apiRequest<Student[]>('/students', { query: { search } });
}

/** GET /students/:id */
export function getStudent(id: string): Promise<Student> {
  return apiRequest<Student>(`/students/${id}`);
}

/** POST /students */
export function createStudent(input: CreateStudentInput): Promise<Student> {
  return apiRequest<Student>('/students', { method: 'POST', body: input });
}

/** PATCH /students/:id */
export function updateStudent(id: string, input: UpdateStudentInput): Promise<Student> {
  return apiRequest<Student>(`/students/${id}`, { method: 'PATCH', body: input });
}

/** DELETE /students/:id — soft delete (sets isActive: false server-side). */
export function deleteStudent(id: string): Promise<Student> {
  return apiRequest<Student>(`/students/${id}`, { method: 'DELETE' });
}
