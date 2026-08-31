import axios from 'axios'; import type { CreateStudentInput, PaginatedStudents, Student, StudentQuery, UpdateStudentInput } from '../types/student.types';
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000' });
client.interceptors.request.use((config) => { const token = localStorage.getItem('accessToken'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
export const getStudents = async (params: StudentQuery = {}) => (await client.get<PaginatedStudents>('/students', { params })).data;
export const getStudentById = async (id: string) => (await client.get<Student>(`/students/${id}`)).data;
export const createStudent = async (data: CreateStudentInput) => (await client.post<Student>('/students', data)).data;
export const updateStudent = async (id: string, data: UpdateStudentInput) => (await client.patch<Student>(`/students/${id}`, data)).data;
export const deleteStudent = async (id: string) => (await client.delete<Student>(`/students/${id}`)).data;
