import type { AttendanceRecord, AttendanceStatus, CreateAttendanceInput } from '../types/attendance';

const ATTENDANCE_SERVICE_URL = (import.meta.env.VITE_ATTENDANCE_SERVICE_URL as string | undefined) ?? 'http://localhost:3005';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${ATTENDANCE_SERVICE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'message' in body ? String(body.message) : `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

export function listAttendance(): Promise<AttendanceRecord[]> {
  return request<AttendanceRecord[]>('/attendance');
}

export function createAttendance(input: CreateAttendanceInput): Promise<unknown> {
  return request('/attendance', { method: 'POST', body: JSON.stringify(input) });
}

export function updateAttendance(id: string, status: AttendanceStatus): Promise<AttendanceRecord> {
  return request<AttendanceRecord>(`/attendance/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}