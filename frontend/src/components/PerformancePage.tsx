import { useEffect, useState } from 'react';
import { gateway, type Session } from '../api/gateway';
import { useEntityNames } from '../hooks/useEntityNames';

type Student = { _id: string; firstName: string; lastName: string; email: string };
type SubjectPerformance = { subjectId: string; subjectName?: string; averagePercentage: number; trend: string };
type Performance = { studentId: string; subjectWisePerformance: SubjectPerformance[]; attendancePercentage: number; overallAveragePercentage: number };

export function PerformancePage({ session }: { session: Session }) {
  const isParent = session.user.role === 'parent';
  const ownStudentId = session.user.role === 'student' ? session.user.linkedProfileId : undefined;
  const linkedChildren = session.user.linkedStudentIds ?? [];
  const [students, setStudents] = useState<Student[]>(isParent ? linkedChildren.map((_id, index) => ({ _id, firstName: `Child ${index + 1}`, lastName: '', email: '' })) : []);
  const [studentId, setStudentId] = useState(ownStudentId ?? linkedChildren[0] ?? '');
  const [data, setData] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(Boolean(ownStudentId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (ownStudentId || isParent) return;
    void gateway<Student[]>('/students', {}, session.access_token).then(setStudents).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load students.'));
  }, [ownStudentId, isParent, session.access_token]);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true); setError('');
    void gateway<Performance>('/performance/student/' + studentId, {}, session.access_token).then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load performance.')).finally(() => setLoading(false));
  }, [studentId, session.access_token]);

  const { resolve } = useEntityNames({ student: data?.studentId ? [data.studentId] : [], subject: data?.subjectWisePerformance.map((item) => item.subjectId) ?? [] }, session.access_token);
  const retry = () => {
    if (!studentId) return;
    setLoading(true); setError('');
    void gateway<Performance>('/performance/student/' + studentId, {}, session.access_token).then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load performance.')).finally(() => setLoading(false));
  };
  return <><div className="page-intro"><div><p>Student performance and attendance summary.</p><small>{studentId ? 'Data is loaded only from ' : 'Select a student to load performance from '}<code>{studentId ? '/performance/student/' + studentId : '/performance/student/:studentId'}</code>.</small></div></div>{!ownStudentId && <section className="data-card"><div className="data-top"><label>Student <select value={studentId} onChange={(event) => setStudentId(event.target.value)}><option value="">Select a student</option>{students.map((student) => <option key={student._id} value={student._id}>{student.firstName} {student.lastName} — {student.email}</option>)}</select></label></div></section>}<section className="data-card">{error ? <div className="state error"><strong>Couldn’t load performance.</strong><span>{error}</span><button className="secondary" onClick={retry}>Try again</button></div> : loading ? <div className="state">Loading performance…</div> : !studentId ? <div className="state">Choose a student to view performance.</div> : data ? <><div className="data-top"><div><h2>{resolve('student', data.studentId)}</h2><span>Attendance: {data.attendancePercentage}% · Overall average: {data.overallAveragePercentage}%</span></div></div><div className="table-wrap"><table><thead><tr><th>Subject</th><th>Average</th><th>Trend</th></tr></thead><tbody>{data.subjectWisePerformance.map((item) => <tr key={item.subjectId}><td title={item.subjectId}>{item.subjectName && item.subjectName !== item.subjectId ? item.subjectName : resolve('subject', item.subjectId)}</td><td>{item.averagePercentage}%</td><td>{item.trend}</td></tr>)}</tbody></table></div></> : <div className="state">No performance data returned.</div>}</section></>;
}
