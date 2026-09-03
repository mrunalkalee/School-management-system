import { useEffect, useMemo, useState } from 'react'
import './ExaminationPage.css'

const API_URL = import.meta.env.VITE_EXAMINATION_SERVICE_URL || 'http://localhost:3008'

async function request(path, options) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } })
  } catch {
    throw new Error(`Unable to reach the examination service at ${API_URL}.`)
  }
  const body = await response.json().catch(() => undefined)
  if (!response.ok) throw new Error(`Examination service returned ${response.status}.`)
  return body
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ExaminationPage() {
  const [exams, setExams] = useState([])
  const [classFilter, setClassFilter] = useState('')
  const [tab, setTab] = useState('schedule')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    request('/examinations').then((data) => setExams(Array.isArray(data) ? data : [])).catch((reason) => setError(reason.message)).finally(() => setLoading(false))
  }, [])

  const classes = useMemo(() => [...new Set(exams.map((exam) => exam.classId))].sort(), [exams])
  const visible = exams.filter((exam) => !classFilter || exam.classId === classFilter)
  const completed = exams.filter((exam) => exam.date && new Date(exam.date) < new Date()).length

  async function saveExam(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const data = { classId: form.get('classId').trim(), subject: form.get('subject').trim(), title: form.get('title').trim(), date: form.get('date') }
    setSaving(true)
    try {
      const created = await request('/examinations', { method: 'POST', body: JSON.stringify({ data }) })
      setExams((current) => [...current, created])
      setModal(false)
    } catch (reason) { setError(reason.message) } finally { setSaving(false) }
  }

  return <div className="examination-page">
    <div className="examination-heading"><div><h1>Examinations &amp; Results</h1><p>Manage test schedules, publish report cards, and track academic metrics.</p></div><span className="heading-accent" /></div>
    <div className="examination-metrics">
      <Metric label="Upcoming Exams" value={String(exams.length - completed)} detail="Based on examination dates" icon="▣" />
      <Metric label="Completed Exams" value={String(completed)} detail="Based on examination dates" icon="♙" />
      <Metric label="Average Score" value="Unavailable" detail="Not exposed by this service" icon="▥" />
      <Metric label="Results Published" value="Unavailable" detail="Publishing not supported" icon="◉" />
    </div>
    <section className="examination-panel">
      <div className="examination-toolbar"><div className="examination-tabs"><button className={tab === 'schedule' ? 'active' : ''} onClick={() => setTab('schedule')}>Exam Schedule</button><button className={tab === 'results' ? 'active' : ''} onClick={() => setTab('results')}>Results &amp; Publishing</button></div><div className="examination-actions"><label>Class: <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}><option value="">All classes</option>{classes.map((classId) => <option key={classId}>{classId}</option>)}</select></label><button className="primary" onClick={() => setModal(true)}>+ Create Exam</button></div></div>
      {tab === 'results' && <p className="examination-notice">Results and publishing are not supported by the current Examination Service.</p>}
      {loading && <p className="examination-state">Loading examinations...</p>}
      {!loading && error && <p className="examination-state error" role="alert">{error}</p>}
      {!loading && !error && tab === 'schedule' && <div className="examination-table-wrap"><table><thead><tr><th>Exam Name</th><th>Subject</th><th>Class</th><th>Exam Date</th><th>Results</th><th>Status</th></tr></thead><tbody>{visible.map((exam) => { const status = exam.date && new Date(exam.date) < new Date() ? 'Completed' : 'Scheduled'; return <tr key={exam._id || `${exam.classId}-${exam.title}-${exam.date}`}><th>{exam.title || '-'}</th><td>{exam.subject || '-'}</td><td className="class-cell">{exam.classId}</td><td>{formatDate(exam.date)}</td><td>{Array.isArray(exam.results) ? exam.results.length : 0}</td><td><span className={`badge ${status.toLowerCase()}`}>{status}</span></td></tr> })}</tbody></table>{visible.length === 0 && <p className="examination-state">No examinations match this class.</p>}</div>}
    </section>
    {modal && <div className="modal-backdrop"><form className="exam-modal" onSubmit={saveExam}><div className="modal-title"><h2>Create Exam</h2><button type="button" onClick={() => setModal(false)}>×</button></div><label>Exam title<input name="title" required /></label><label>Subject<input name="subject" /></label><label>Class ID<input name="classId" required /></label><label>Exam date<input name="date" type="date" /></label><button className="primary" disabled={saving}>{saving ? 'Creating...' : 'Create Exam'}</button></form></div>}
  </div>
}

function Metric({ label, value, detail, icon }) { return <article className="metric"><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div><span>{icon}</span></article> }