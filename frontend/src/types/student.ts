// Mirrors backend/services/student-service/src/student.schema.ts and the
// Create/Update DTOs exactly. Do not add fields that don't exist on the API.

export type Gender = 'male' | 'female' | 'other';

/** Shape returned by the Student Service for every student record. */
export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: Gender;
  rollNumber?: string;
  /** Raw ID owned by class-subject-service. Never a display name — do not render directly. */
  classId?: string;
  section?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  admissionDate: string;
  profilePhotoUrl?: string;
  isActive: boolean;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Body for POST /students. firstName, lastName, email are required. */
export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: Gender;
  rollNumber?: string;
  classId?: string;
  section?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  admissionDate?: string;
  profilePhotoUrl?: string;
  isActive?: boolean;
}

/** Body for PATCH /students/:id. Every field optional. */
export type UpdateStudentInput = Partial<CreateStudentInput>;

/** Standard Nest exception filter error shape. */
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}
