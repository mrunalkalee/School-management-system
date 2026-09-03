import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import './ClassTimetable.css';

const SERVICE_URL = (import.meta.env.VITE_CLASS_TIMETABLE_SERVICE_URL as string | undefined) ?? 'http://localhost:3005';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CHEVRON_URL = 'https://www.figma.com/api/mcp/asset/a952bc73-c875-4cac-83ed-a77f10010818.svg';

type UnknownRecord = Record<string, unknown>;
type TimetableRecord = {
  _id?: string;
  classId: string;
  section?: string;
  day?: string;
  periods: unknown[];
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return undefined;
}

function periodText(period: unknown, keys: string[]): string | undefined {
  if (!isRecord(period)) return readText(period);
  for (const key of keys) {
    const value = readText(period[key]);
    if (value) return value;
  }
  return undefined;
}

function normalized(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function getRecords(value: unknown): TimetableRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is TimetableRecord => isRecord(item) && typeof item.classId === 'string' && Array.isArray(item.periods));
}

async function loadTimetables(): Promise<TimetableRecord[]> {
  let response: Response;
  try {
    response = await fetch(`${SERVICE_URL}/class-timetables`);
  } catch {
    throw new Error(`Unable to reach the class timetable service at ${SERVICE_URL}.`);
  }
  if (!response.ok) throw new Error(`Timetable service returned ${response.status}.`);
  return getRecords(await response.json());
}

export function ClassTimetable() {
  const [records, setRecords] = useState<TimetableRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadTimetables()
      .then(setRecords)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load the timetable.'))
      .finally(() => setIsLoading(false));
  }, []);

  const classes = useMemo(() => [...new Set(records.map((record) => record.classId))].sort(), [records]);
  useEffect(() => {
    if (!selectedClass && classes.length > 0) setSelectedClass(classes[0]);
  }, [classes, selectedClass]);

  const rooms = useMemo(() => {
    const values = records.flatMap((record) => record.periods.map((period) => periodText(period, ['room', 'roomId'])));
    return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
  }, [records]);
  const visibleRecords = useMemo(() => records.filter((record) => !selectedClass || record.classId === selectedClass), [records, selectedClass]);
  const rows = useMemo(() => {
    const count = Math.max(0, ...visibleRecords.map((record) => record.periods.length));
    return Array.from({ length: count }, (_, index) => index);
  }, [visibleRecords]);

  function recordForDay(day: string): TimetableRecord | undefined {
    return visibleRecords.find((record) => normalized(record.day) === normalized(day));
  }

  function periodForDay(day: string, row: number): unknown {
    const period = recordForDay(day)?.periods[row];
    if (!selectedRoom) return period;
    return normalized(periodText(period, ['room', 'roomId'])) === normalized(selectedRoom) ? period : undefined;
  }

  return (
    <AppShell
      title="Weekly Timetable"
      subtitle="Manage period allocations and room bookings."
      activeNav="Timetable"
      profileAvatarUrl="https://www.figma.com/api/mcp/asset/f2cc5aa0-b6f3-4f09-bf40-6ea06d33728b.png"
      showNavIcons
    >
      <div className="timetable-controls">
        <div className="timetable-control-group">
          <span className="timetable-control-label">Timetable for:</span>
          <label className="timetable-select-wrap">
            <span className="sr-only">Class</span>
            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
              <option value="">All classes</option>
              {classes.map((classId) => <option key={classId} value={classId}>{classId}</option>)}
            </select>
            <img src={CHEVRON_URL} alt="" aria-hidden="true" />
          </label>
          <label className="timetable-select-wrap">
            <span className="sr-only">Room</span>
            <select value={selectedRoom} onChange={(event) => setSelectedRoom(event.target.value)}>
              <option value="">Room: All Rooms</option>
              {rooms.map((room) => <option key={room} value={room}>{room}</option>)}
            </select>
            <img src={CHEVRON_URL} alt="" aria-hidden="true" />
          </label>
        </div>
        <label className="timetable-toggle">
          <span>Edit Mode</span>
          <input type="checkbox" checked={editMode} onChange={(event) => setEditMode(event.target.checked)} />
          <span className="timetable-toggle__track" aria-hidden="true"><span /></span>
        </label>
      </div>

      <section className="timetable-card" aria-label="Weekly timetable">
        {isLoading && <p className="timetable-state">Loading timetable...</p>}
        {!isLoading && error && <p className="timetable-state timetable-state--error" role="alert">{error}</p>}
        {!isLoading && !error && records.length === 0 && <p className="timetable-state">No timetable records are available.</p>}
        {!isLoading && !error && records.length > 0 && (
          <div className="timetable-grid" role="table">
            <div className="timetable-grid__header" role="row">
              <div className="timetable-time-heading">Time / Day</div>
              {DAYS.map((day) => <div className="timetable-day-heading" key={day}>{day}</div>)}
            </div>
            <div className="timetable-grid__rows">
              {rows.map((row) => {
                const firstPeriod = visibleRecords.find((record) => record.periods[row] !== undefined)?.periods[row];
                const breakLabel = periodText(firstPeriod, ['breakLabel', 'label', 'type', 'kind']);
                if (breakLabel?.toLowerCase().includes('break')) {
                  return <div className="timetable-break-row" role="row" key={row}>{breakLabel}</div>;
                }
                const start = periodText(firstPeriod, ['startTime', 'start', 'from']);
                const end = periodText(firstPeriod, ['endTime', 'end', 'to']);
                return (
                  <div className="timetable-grid__row" role="row" key={row}>
                    <div className="timetable-time">{start && end ? `${start} - ${end}` : `Period ${row + 1}`}</div>
                    {DAYS.map((day) => <PeriodCard key={day} period={periodForDay(day, row)} />)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function PeriodCard({ period }: { period: unknown }) {
  const subject = periodText(period, ['subject', 'subjectName', 'name', 'title']);
  const teacher = periodText(period, ['teacher', 'teacherInitials', 'teacherName', 'initials']);
  const room = periodText(period, ['room', 'roomId']);
  if (!period || (!subject && !teacher && !room)) return <div className="timetable-period timetable-period--empty" role="cell" />;

  return (
    <div className="timetable-period" role="cell">
      <strong>{subject ?? 'Untitled period'}</strong>
      <span><em>{teacher ?? '-'}</em><b>{room ?? '-'}</b></span>
    </div>
  );
}

export default ClassTimetable;