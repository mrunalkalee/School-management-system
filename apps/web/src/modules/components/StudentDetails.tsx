import type { Student } from '../types/student.types';
import { StudentStatusBadge } from './StudentStatusBadge';

const formatDate = (value: string) => new Date(value).toLocaleDateString();
function DetailItem({ label, value }: { label: string; value?: string }) { return <div><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>; }

export function StudentDetails({ student }: { student: Student }) {
  const address = student.address && Object.values(student.address).filter(Boolean).join(', ');
  return <section className="student-details-card" aria-label="Student profile">
    <header className="student-details-header"><div><p className="students-eyebrow">Student Profile</p><h1>{student.firstName} {student.lastName}</h1><p>Roll no. {student.rollNumber} · Admission no. {student.admissionNumber}</p></div><StudentStatusBadge status={student.status} /></header>
    <div className="student-profile-sections">
      <section><h2>Personal Information</h2><dl className="student-details-grid"><DetailItem label="Date of birth" value={formatDate(student.dateOfBirth)} /><DetailItem label="Gender" value={student.gender} /></dl></section>
      <section><h2>Academic Information</h2><dl className="student-details-grid"><DetailItem label="Class" value={student.class} /><DetailItem label="Section" value={student.section} /></dl></section>
      <section><h2>Contact Information</h2><dl className="student-details-grid"><DetailItem label="Email" value={student.email} /><DetailItem label="Phone" value={student.phone} /></dl></section>
      <section><h2>Admission Information</h2><dl className="student-details-grid"><DetailItem label="Admission date" value={formatDate(student.admissionDate)} /><DetailItem label="Admission status" value={student.status} /></dl></section>
      <section><h2>Guardian Information</h2><dl className="student-details-grid"><DetailItem label="Guardian name" value={student.guardian?.name} /><DetailItem label="Relation" value={student.guardian?.relation} /><DetailItem label="Guardian phone" value={student.guardian?.phone} /><DetailItem label="Guardian email" value={student.guardian?.email} /></dl></section>
      <section><h2>Address</h2><dl className="student-details-grid"><DetailItem label="Residential address" value={address} /></dl></section>
    </div>
  </section>;
}
