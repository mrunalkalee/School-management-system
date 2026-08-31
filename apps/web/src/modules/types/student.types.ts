export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred';
export type Gender = 'male' | 'female' | 'other';
export interface Address { street?: string; city?: string; state?: string; zipCode?: string; country?: string }
export interface Guardian { name?: string; relation?: string; phone?: string; email?: string }
export interface Student { _id: string; firstName: string; lastName: string; rollNumber: string; admissionNumber: string; dateOfBirth: string; gender: Gender; class: string; section: string; email?: string; phone?: string; address?: Address; guardian?: Guardian; admissionDate: string; status: StudentStatus; profileImageUrl?: string; createdAt: string; updatedAt: string }
export type CreateStudentInput = Omit<Student, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateStudentInput = Partial<CreateStudentInput>;
export interface PaginatedStudents { data: Student[]; meta: { page: number; limit: number; total: number; totalPages: number } }
export interface StudentQuery { page?: number; limit?: number; class?: string; section?: string; status?: StudentStatus; search?: string }
