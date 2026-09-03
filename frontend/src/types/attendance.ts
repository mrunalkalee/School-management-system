export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface AttendanceRecord {
  _id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  markedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAttendanceInput {
  classId: string;
  date: string;
  records: Array<{ studentId: string; status: AttendanceStatus }>;
  markedBy?: string;
}