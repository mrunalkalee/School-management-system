import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { createAttendance, listAttendance, updateAttendance } from '../../api/attendanceApi';
import type { AttendanceRecord, AttendanceStatus } from '../../types/attendance';
import './AttendancePage.css';

const avatarUrls = [
  'https://www.figma.com/api/mcp/asset/5c4dbd4d-a8d7-452c-a8e0-41afeff7f89b.png',
  'https://www.figma.com/api/mcp/asset/3ba99648-69ac-4beb-b305-3947c14e1eec.png',
  'https://www.figma.com/api/mcp/asset/34df0bec-afa6-4b72-93ea-caeb5a53ef67.png',
  'https://www.figma.com/api/mcp/asset/8c95141c-c9db-4528-8db3-859f585ceb98.png',
  'https://www.figma.com/api/mcp/asset/18e222c3-2896-478e-85ce-a9a86288b002.png',
  'https://www.figma.com/api/mcp/asset/0e582aff-422c-4245-8356-11f74568da51.png',
];

export function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    void listAttendance().then(setRecords).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load attendance.')).finally(() => setIsLoading(false));
  }, []);

  const visibleRecords = useMemo(() => records.filter((record) => (!classId || record.classId === classId) && (!date || record.date.slice(0, 10) === date)), [records, classId, date]);
  const counts = useMemo(() => visibleRecords.reduce((total, record) => ({ ...total, [record.status]: total[record.status] + 1 }), { present: 0, absent: 0, leave: 0 }), [visibleRecords]);

  async function changeStatus(record: AttendanceRecord, status: AttendanceStatus) {
    try {
      const updated = await updateAttendance(record._id, status);
      setRecords((current) => current.map((item) => (item._id === record._id ? updated : item)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update attendance.');
    }
  }

  async function submitAttendance() {
    if (!classId || visibleRecords.length === 0) return;
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      await createAttendance({ classId, date, records: visibleRecords.map(({ studentId, status }) => ({ studentId, status })) });
      setSubmitMessage('Attendance submitted');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to submit attendance.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return <AppShell title="Class Attendance" subtitle="Record and monitor daily student attendance." activeNav="Attendance" portalLabel="Teacher portal" profileName="Daniel Carter" profileRole="Grade 9B Homeroom Teacher" profileAvatarUrl="https://www.figma.com/api/mcp/asset/b74abd6c-3b1c-4d29-a2f2-de13c9d9521c.png" showNavIcons>
    <div className="attendance-controls">
      <div className="attendance-selectors">
        <label className="attendance-select">Class: <input aria-label="Class ID" value={classId} onChange={(event) => setClassId(event.target.value)} placeholder="Class ID" /></label>
        <label className="attendance-select">Date: <input aria-label="Attendance date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      </div>
      <button className="attendance-submit" type="button" onClick={() => void submitAttendance()} disabled={isSubmitting || !classId || visibleRecords.length === 0}>✓ <span>{isSubmitting ? 'Submitting...' : 'Submit Attendance'}</span></button>
    </div>
    {submitMessage && <p className="attendance-message">{submitMessage}</p>}
    <section className="attendance-card" aria-label="Attendance records">
      <div className="attendance-table" role="table">
        <div className="attendance-row attendance-row--header" role="row"><span>Photo</span><span>Student ID</span><span>Class ID</span><span>Date</span><span>Attendance Status</span></div>
        {isLoading && <p className="attendance-state">Loading attendance...</p>}
        {!isLoading && error && <p className="attendance-state attendance-state--error" role="alert">{error}</p>}
        {!isLoading && !error && visibleRecords.length === 0 && <p className="attendance-state">No attendance records match these filters.</p>}
        {!isLoading && !error && visibleRecords.map((record, index) => <div className="attendance-row" role="row" key={record._id}>
          <img className="attendance-avatar" src={avatarUrls[index % avatarUrls.length]} alt="" />
          <strong>{record.studentId}</strong><span>{record.classId}</span><span>{record.date.slice(0, 10)}</span>
          <div className="attendance-statuses">{(['present', 'absent', 'leave'] as AttendanceStatus[]).map((status) => <button key={status} type="button" className={`status-button status-button--${status} ${record.status === status ? 'status-button--selected' : ''}`} onClick={() => void changeStatus(record, status)}>{status === 'leave' ? 'Leave' : status[0].toUpperCase() + status.slice(1)}</button>)}</div>
        </div>)}
      </div>
      <footer className="attendance-footer"><span>Class Summary:</span><strong className="summary-present">● Present: {counts.present}</strong><strong className="summary-absent">● Absent: {counts.absent}</strong><strong className="summary-leave">● Leave: {counts.leave}</strong><strong className="summary-total">Total: {visibleRecords.length}</strong></footer>
    </section>
  </AppShell>;
}