import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTeachers } from '../../hooks/useTeachers'
import TeacherCard from '../../components/Teacher/TeacherCard'
import TeacherTable from '../../components/Teacher/TeacherTable'
import { teacherStatus } from '../../utils/statusBadge'

export default function TeacherListPage() {
  const navigate = useNavigate()
  const { teachers, isLoading, error, removeTeacher } = useTeachers()
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All')
  const departments = ['All', ...new Set(teachers.flatMap((teacher) => teacher.subjectsHandled || []))]
  const visibleTeachers = useMemo(() => teachers.filter((teacher) => `${teacher.firstName} ${teacher.lastName} ${teacher.email} ${teacher.subjectsHandled?.join(' ')}`.toLowerCase().includes(query.toLowerCase()) && (department === 'All' || teacher.subjectsHandled?.includes(department))), [teachers, query, department])
  const remove = async (id) => { if (!window.confirm('Remove this teacher?')) return; try { await removeTeacher(id) } catch (err) { window.alert(err.message) } }
  const activeCount = teachers.filter((teacher) => teacherStatus(teacher) === 'Active').length
  return <><header className="heading"><div><h1>Teacher Directory</h1><p>Manage academic staff assignments and profiles.</p></div></header><section className="metrics"><TeacherCard label="Total Teachers" value={teachers.length} caption="Full-time and adjunct" tint="#fff" icon="[]" /><TeacherCard label="Present Today" value={activeCount} caption="92% active attendance" tint="#fff" icon="ok" /><TeacherCard label="On Leave" value={teachers.length - activeCount} caption="Substitute cover assigned" tint="#fff" icon="[]" /><TeacherCard label="Avg Experience" value="8.2 yrs" caption="High retention rate" tint="#fff" icon="|||" /></section><section className="panel"><div className="filters"><input placeholder="Search teacher by name or subject..." value={query} onChange={(event) => setQuery(event.target.value)} /><select value={department} onChange={(event) => setDepartment(event.target.value)}>{departments.map((item) => <option key={item} value={item}>{item === 'All' ? 'Department: All' : `Department: ${item}`}</option>)}</select><button className="primary" onClick={() => navigate('/teachers/add')}>+ Add Teacher</button></div>{error ? <p className="error">{error.message}</p> : isLoading ? <p>Loading teachers...</p> : <TeacherTable teachers={visibleTeachers} onEdit={(teacher) => navigate(`/teachers/${teacher._id || teacher.id}/edit`)} onDelete={remove} />}</section></>
}
