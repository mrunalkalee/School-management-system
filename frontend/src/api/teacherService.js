// Frontend-only in-memory data store. This module makes no HTTP requests.
let teachers = []
const copy = (value) => structuredClone(value)
export const getTeachers = async () => copy(teachers)
export const getTeacherById = async (id) => { const teacher = teachers.find((item) => item.id === id); if (!teacher) throw new Error('Teacher not found.'); return copy(teacher) }
export const createTeacher = async (payload) => { const teacher = { ...payload, id: crypto.randomUUID() }; teachers = [...teachers, teacher]; return copy(teacher) }
export const updateTeacher = async (id, payload) => { const index = teachers.findIndex((item) => item.id === id); if (index < 0) throw new Error('Teacher not found.'); teachers[index] = { ...teachers[index], ...payload }; return copy(teachers[index]) }
export const deleteTeacher = async (id) => { teachers = teachers.filter((item) => item.id !== id); return { id } }
