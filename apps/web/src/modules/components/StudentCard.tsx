import type { Student } from '../types/student.types'; import { StudentStatusBadge } from './StudentStatusBadge';
export function StudentCard({ student }: { student: Student }) { return <article className="student-card"><h3>{student.firstName} {student.lastName}</h3><p>{student.class}–{student.section} · {student.rollNumber}</p><StudentStatusBadge status={student.status} /></article>; }
