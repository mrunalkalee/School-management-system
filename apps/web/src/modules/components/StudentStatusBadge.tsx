import type { StudentStatus } from '../types/student.types';
export function StudentStatusBadge({ status }: { status: StudentStatus }) { return <span className={`student-status student-status--${status}`}>{status}</span>; }
