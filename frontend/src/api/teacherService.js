const BASE_URL = import.meta.env.VITE_TEACHER_SERVICE_URL || 'http://localhost:3002';

async function request(path, options = {}) {
  let response;
  try { response = await fetch(`${BASE_URL}${path}`, { ...options, headers: options.body ? { 'Content-Type': 'application/json', ...options.headers } : options.headers }); }
  catch { throw new Error(`Unable to reach the teacher service at ${BASE_URL}.`); }
  const body = await response.json().catch(() => undefined);
  if (!response.ok) throw new Error(typeof body?.message === 'string' ? body.message : `Teacher service returned ${response.status}.`);
  return body;
}

export const getTeachers = (search) => request(`/teachers${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const getTeacherById = (id) => request(`/teachers/${id}`);
export const createTeacher = (payload) => request('/teachers', { method: 'POST', body: JSON.stringify(payload) });
export const updateTeacher = (id, payload) => request(`/teachers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteTeacher = (id) => request(`/teachers/${id}`, { method: 'DELETE' });
