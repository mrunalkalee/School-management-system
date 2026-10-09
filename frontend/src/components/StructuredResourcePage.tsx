import { FormEvent, useEffect, useMemo, useState } from 'react';
import { gateway, type Session } from '../api/gateway';
import { type EntityType, useEntityNames } from '../hooks/useEntityNames';
import '../components/ClassesSubjectsPage.css';

type ModuleId = 'students'|'teachers'|'timetables'|'attendance'|'exams'|'fees'|'leave'|'admissions'|'certificates'|'notices'|'library'|'transport';
type Row = Record<string, unknown> & { _id: string };
type Props = { id: ModuleId; title: string; endpoint: string; action: string; session: Session };
const richName = (x: Row) => {
  const person = [x.firstName ?? x.applicantFirstName, x.lastName ?? x.applicantLastName].filter(Boolean).join(' ');
  if (x.studentId && x.date) return `Attendance — ${x.date} • ${x.status ?? 'unmarked'}`;
  if (x.dayOfWeek) return `Timetable — ${x.dayOfWeek} • ${Array.isArray(x.periods) ? x.periods.length : 0} period(s)`;
  if (x.feeType) return `Fee: ${x.feeType} • ${x.academicYear ?? 'Academic year not set'} • ₹${x.amount ?? 0}`;
  if (x.applicantFirstName) return `Admission: ${person} • ${x.status ?? 'pending'} • Guardian: ${x.guardianName ?? '—'}`;
  if (x.type && x.issuedDate) return `Certificate: ${x.type} • Issued ${new Date(String(x.issuedDate)).toLocaleDateString()}`;
  const label = x.name || x.routeName || x.title || x.type || x.examType || x.rollNumber || person || x.guardianName || x.email;
  return String(label || 'Unnamed record');
};
const name = (x: Row) => {
  const person = [x.firstName, x.lastName].filter(Boolean).join(' ');
  return String((x.name ?? x.title ?? x.routeName ?? x.dayOfWeek ?? x.feeType ?? x.examType ?? person) || x.email || x._id || 'Unknown');
};
const toIso = (v: FormDataEntryValue | null) => v ? new Date(String(v)).toISOString() : undefined;
const hiddenColumns = new Set(['_id', '__v', 'createdAt', 'updatedAt']);
const readable = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase());
const cellValue = (value: unknown, fallback: string) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) return value.length ? `${value.length} item(s)` : '—';
  if (typeof value === 'object') return 'View details';
  return String(value);
};

function entityFor(row: Row, column: string): EntityType | undefined {
  if (column === 'classId' || column === 'targetClassId') return 'class';
  if (column === 'studentId') return 'student';
  if (column === 'subjectId') return 'subject';
  if (column === 'teacherId' || column === 'markedBy') return 'teacher';
  if (column === 'requesterId') return row.requesterType === 'teacher' ? 'teacher' : 'student';
  return undefined;
}

function ResourceTable({ rows, resolve, isAdmin, onEdit, onDelete, deletingId }: { rows: Row[]; resolve: (type: EntityType, id?: string) => string; isAdmin: boolean; onEdit: (row: Row) => void; onDelete: (row: Row) => void; deletingId: string | null }) {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row).filter((key) => !hiddenColumns.has(key))))].slice(0, 7);
  const visibleColumns = columns.length ? columns : ['record'];
  return <div className="table-wrap"><table><thead><tr>{visibleColumns.map((column) => <th key={column}>{readable(column)}</th>)}{isAdmin && <th>Actions</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={row._id || index}>{visibleColumns.map((column) => {
    const value = row[column];
    const entity = entityFor(row, column);
    const id = typeof value === 'string' ? value : undefined;
    return <td key={column} title={id}>{column === 'record' ? richName(row) : entity && id ? resolve(entity, id) : cellValue(value, column.endsWith('Id') ? String(value ?? 'Unknown') : 'Unknown')}</td>;
  })}{isAdmin && <td><button className="secondary" type="button" onClick={() => onEdit(row)}>Edit</button><button className="danger-button" type="button" onClick={() => onDelete(row)} disabled={deletingId === row._id}>{deletingId === row._id ? 'Deleting…' : 'Delete'}</button></td>}</tr>)}</tbody></table></div>;
}

export function StructuredResourcePage({ id, title, endpoint, action, session }: Props) {
  const [rows,setRows]=useState<Row[]>([]),[classes,setClasses]=useState<Row[]>([]),[subjects,setSubjects]=useState<Row[]>([]),[teachers,setTeachers]=useState<Row[]>([]),[students,setStudents]=useState<Row[]>([]);
  const [open,setOpen]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),[selectedClass,setSelectedClass]=useState(''),[periods,setPeriods]=useState([{periodNumber:1,subjectId:'',teacherId:'',startTime:'09:00',endTime:'09:45'}]),[stops,setStops]=useState([{stopName:'',pickupTime:'07:30'}]),[attendance,setAttendance]=useState<Record<string,string>>({});
  const [editing,setEditing]=useState<Row|null>(null),[editDraft,setEditDraft]=useState<Record<string,string>>({}),[deletingId,setDeletingId]=useState<string|null>(null);
  const isAdmin = session.user.role === 'admin';
  const need = id==='students'||id==='teachers'||id==='timetables'||id==='attendance'||id==='exams'||id==='fees'||id==='leave'||id==='admissions'||id==='certificates'||id==='notices';
  async function load(){setError('');try{const req:Promise<Row[]>[]=[gateway<Row[]>(endpoint,{},session.access_token)];if(need)req.push(gateway<Row[]>('/classes',{},session.access_token),gateway<Row[]>('/subjects',{},session.access_token),gateway<Row[]>('/teachers',{},session.access_token),gateway<Row[]>('/students',{},session.access_token));const [data,c,s,t,st]=await Promise.all(req);setRows(data);if(c){setClasses(c);setSubjects(s!);setTeachers(t!);setStudents(st!);}}catch(e){setError(e instanceof Error?e.message:'Unable to load data.');}}
  useEffect(()=>{void load();},[endpoint,session.access_token]);
  const idsByType = useMemo<Partial<Record<EntityType, string[]>>>(() => {
    const ids: Partial<Record<EntityType, string[]>> = {};
    const add = (type: EntityType, value: unknown) => {
      if (typeof value === 'string' && value) (ids[type] ??= []).push(value);
    };
    rows.forEach((row) => {
      add('class', row.classId); add('class', row.targetClassId);
      add('student', row.studentId); add('subject', row.subjectId);
      add('teacher', row.teacherId); add('teacher', row.markedBy);
      if (row.requesterType === 'teacher') add('teacher', row.requesterId); else add('student', row.requesterId);
      if (Array.isArray(row.periods)) row.periods.forEach((period) => {
        if (period && typeof period === 'object') {
          const item = period as Record<string, unknown>;
          add('subject', item.subjectId); add('teacher', item.teacherId);
        }
      });
    });
    return ids;
  }, [rows]);
  const { resolve } = useEntityNames(idsByType, session.access_token);
  const editableFields = editing ? Object.entries(editing).filter(([key, value]) => (id === 'admissions' || id === 'leave' ? key === 'status' : !hiddenColumns.has(key) && key !== '_id') && ['string', 'number', 'boolean'].includes(typeof value)) : [];
  const updatePath = (row: Row) => id === 'admissions' ? `${endpoint}/${row._id}/status` : id === 'leave' ? `${endpoint}/${row._id}/review` : `${endpoint}/${row._id}`;
  function beginEdit(row: Row) {
    const draft: Record<string, string> = {};
    Object.entries(row).forEach(([key, value]) => { if (!hiddenColumns.has(key) && key !== '_id' && ['string', 'number', 'boolean'].includes(typeof value)) draft[key] = String(value ?? ''); });
    setEditing(row); setEditDraft(draft); setError('');
  }
  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return; setBusy(true); setError('');
    const body: Record<string, unknown> = {};
    Object.entries(editDraft).forEach(([key, value]) => { const original = editing[key]; body[key] = typeof original === 'number' ? Number(value) : typeof original === 'boolean' ? value === 'true' : value; });
    try { const updated = await gateway<Row>(updatePath(editing), { method: 'PATCH', body: JSON.stringify(body) }, session.access_token); setRows((items) => items.map((item) => item._id === editing._id ? updated : item)); setEditing(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update record.'); } finally { setBusy(false); }
  }
  async function remove(row: Row) {
    if (!window.confirm(`Are you sure you want to delete ${richName(row)}? This cannot be undone.`)) return;
    setDeletingId(row._id); setError('');
    try { await gateway(`${endpoint}/${row._id}`, { method: 'DELETE' }, session.access_token); setRows((items) => items.filter((item) => item._id !== row._id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to delete record.'); } finally { setDeletingId(null); }
  }
  const classSubjects=useMemo(()=>subjects.filter(s=>!selectedClass||s.classId===selectedClass),[subjects,selectedClass]); const classStudents=useMemo(()=>students.filter(s=>s.classId===selectedClass),[students,selectedClass]);
  function refs(){return <><label>Class<select required value={selectedClass} onChange={e=>{setSelectedClass(e.target.value);setAttendance({});}}><option value="">Choose a class</option>{classes.map(x=><option key={x._id} value={x._id}>{name(x)} {x.section?`— ${x.section}`:''}</option>)}</select></label></>}
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const f=new FormData(e.currentTarget);let body:Record<string,unknown>={};const text=(k:string)=>String(f.get(k)??'').trim();try{
    if(id==='students') body={firstName:text('firstName'),lastName:text('lastName'),email:text('email'),phone:text('phone')||undefined,address:text('address')||undefined,dateOfBirth:toIso(f.get('dateOfBirth')),gender:text('gender')||undefined,rollNumber:text('rollNumber')||undefined,classId:text('classId')||undefined,section:text('section')||undefined,guardianName:text('guardianName')||undefined,guardianPhone:text('guardianPhone')||undefined,guardianEmail:text('guardianEmail')||undefined};
    if(id==='teachers') body={firstName:text('firstName'),lastName:text('lastName'),email:text('email'),phone:text('phone')||undefined,qualification:text('qualification')||undefined,subjectsHandled:f.getAll('subjectsHandled').map(String),joiningDate:toIso(f.get('joiningDate'))};
    if(id==='timetables') body={classId:selectedClass,dayOfWeek:text('dayOfWeek'),periods:periods.map(p=>({...p,periodNumber:Number(p.periodNumber)}) )};
    if(id==='attendance') body={classId:selectedClass,date:text('date'),records:classStudents.map(s=>({studentId:s._id,status:attendance[s._id]??'present'}))};
    if(id==='exams') body={name:text('name'),classId:selectedClass,subjectId:text('subjectId'),examDate:toIso(f.get('examDate')),maxMarks:Number(text('maxMarks')),examType:text('examType')};
    if(id==='fees') body={classId:selectedClass,academicYear:text('academicYear'),feeType:text('feeType'),amount:Number(text('amount')),dueDate:toIso(f.get('dueDate'))};
    if(id==='leave') body={requesterType:text('requesterType'),requesterId:text('requesterId'),fromDate:toIso(f.get('fromDate')),toDate:toIso(f.get('toDate')),reason:text('reason')};
    if(id==='admissions') body={applicantFirstName:text('applicantFirstName'),applicantLastName:text('applicantLastName'),dateOfBirth:toIso(f.get('dateOfBirth')),gender:text('gender'),guardianName:text('guardianName'),guardianContact:text('guardianContact'),guardianEmail:text('guardianEmail'),appliedClassId:selectedClass};
    if(id==='certificates') body={studentId:text('studentId'),type:text('type')};
    if(id==='notices') body={title:text('title'),message:text('message'),targetRole:text('targetRole')||undefined,targetClassId:text('targetClassId')||undefined};
    if(id==='library') body={title:text('title'),author:text('author'),isbn:text('isbn'),category:text('category'),totalCopies:Number(text('totalCopies'))};
    if(id==='transport') body={routeName:text('routeName'),vehicleNumber:text('vehicleNumber'),driverName:text('driverName'),driverContact:text('driverContact'),stops};
    await gateway(endpoint,{method:'POST',body:JSON.stringify(body)},session.access_token);setOpen(false);await load();
  }catch(x){setError(x instanceof Error?x.message:'Unable to create record.');}finally{setBusy(false);}}
  const field=(label:string,key:string,type='text',required=true)=><label>{label}<input name={key} type={type} required={required}/></label>;
  const lookup=(labelText:string,key:string,items:Row[],required=true)=><label>{labelText}<select name={key} required={required}><option value="">Choose {labelText.toLowerCase()}</option>{items.map(x=><option key={x._id} value={x._id}>{name(x)}</option>)}</select></label>;
  function form(){if(id==='students')return <>{field('First Name','firstName')}{field('Last Name','lastName')}{field('Email','email','email')}{field('Phone','phone')}{field('Address','address')}{field('Date of Birth','dateOfBirth','date',false)}<label>Gender<select name="gender"><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label>{field('Roll Number','rollNumber', 'text',false)}{refs()}{field('Section','section', 'text',false)}{field('Guardian Name','guardianName','text',false)}{field('Guardian Phone','guardianPhone','text',false)}{field('Guardian Email','guardianEmail','email',false)}</>;
    if(id==='teachers')return <>{field('First Name','firstName')}{field('Last Name','lastName')}{field('Email','email')}{field('Phone','phone', 'text',false)}{field('Qualification','qualification','text',false)}<fieldset className="multi-select"><legend>Subjects Handled</legend>{subjects.map(s=><label key={s._id}><input type="checkbox" name="subjectsHandled" value={name(s)}/>{name(s)}</label>)}</fieldset>{field('Joining Date','joiningDate','date',false)}</>;
    if(id==='timetables')return <>{refs()}<label>Day of Week<select name="dayOfWeek" required>{['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(x=><option key={x}>{x}</option>)}</select></label><Periods periods={periods} setPeriods={setPeriods} subjects={classSubjects} teachers={teachers}/></>;
    if(id==='attendance')return <>{refs()}{field('Date','date','date')}<fieldset className="multi-select"><legend>Student attendance</legend>{classStudents.map(s=><label key={s._id}>{name(s)}<select value={attendance[s._id]??'present'} onChange={e=>setAttendance({...attendance,[s._id]:e.target.value})}><option value="present">Present</option><option value="absent">Absent</option><option value="leave">Leave</option></select></label>)}</fieldset></>;
    if(id==='exams')return <>{field('Name','name')}{refs()}{lookup('Subject','subjectId',classSubjects)}{field('Exam Date','examDate','date')}{field('Max Marks','maxMarks','number')}<label>Exam Type<select name="examType" required>{['unit-test','midterm','final','online-test'].map(x=><option key={x}>{x}</option>)}</select></label></>;
    if(id==='fees')return <>{refs()}{field('Academic Year','academicYear')}{field('Fee Type','feeType')}{field('Amount','amount','number')}{field('Due Date','dueDate','date')}</>;
    if(id==='leave'){const role='student';return <><label>Requester Type<select name="requesterType"><option value="student">Student</option><option value="teacher">Teacher</option></select></label>{lookup('Requester','requesterId',[...students,...teachers])}{field('From Date','fromDate','date')}{field('To Date','toDate','date')}<label className="full">Reason<textarea name="reason" required/></label></>}
    if(id==='admissions')return <>{field('Applicant First Name','applicantFirstName')}{field('Applicant Last Name','applicantLastName')}{field('Date of Birth','dateOfBirth','date')}<label>Gender<select name="gender"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label>{field('Guardian Name','guardianName')}{field('Guardian Contact','guardianContact')}{field('Guardian Email','guardianEmail','email')}{refs()}</>;
    if(id==='certificates')return <>{lookup('Student','studentId',students)}<label>Type<select name="type"><option value="id-card">ID Card</option><option value="bonafide">Bonafide</option><option value="transfer">Transfer</option></select></label></>;
    if(id==='notices')return <>{field('Title','title')}<label className="full">Message<textarea name="message" required/></label><label>Target Role<select name="targetRole"><option value="all">All</option><option value="student">Students</option><option value="teacher">Teachers</option><option value="parent">Parents</option><option value="admin">Admins</option></select></label>{lookup('Target Class','targetClassId',classes,false)}</>;
    if(id==='library')return <>{field('Title','title')}{field('Author','author')}{field('ISBN','isbn')}{field('Category','category')}{field('Total Copies','totalCopies','number')}</>;
    return <>{field('Route Name','routeName')}{field('Vehicle Number','vehicleNumber')}{field('Driver Name','driverName')}{field('Driver Contact','driverContact')}<Stops stops={stops} setStops={setStops}/></>}
  return <><div className="page-intro"><div><p>{title}</p><small>Data is loaded from <code>{endpoint}</code>.</small></div><div className="toolbar"><button className="secondary" onClick={()=>void load()}>Refresh</button><button className="primary" onClick={()=>setOpen(true)}>{action}</button></div></div>{open&&<section className="composer structured-composer"><div><h2>{action}</h2><p>Complete the fields below and send the request.</p></div><form className="structured-form" onSubmit={e=>void submit(e)}>{form()}<div className="form-actions"><button className="secondary" type="button" onClick={()=>setOpen(false)}>Cancel</button><button className="primary" disabled={busy}>{busy?'Sending…':'Send to API'}</button></div></form></section>}{editing&&<section className="composer structured-composer"><div><h2>Edit {richName(editing)}</h2><p>Update the record fields below.</p></div><form className="structured-form" onSubmit={event=>void saveEdit(event)}>{editableFields.map(([key, value]) => <label key={key}>{readable(key)}<input value={editDraft[key] ?? ''} onChange={event => setEditDraft({ ...editDraft, [key]: event.target.value })} /></label>)}<div className="form-actions"><button className="secondary" type="button" onClick={()=>setEditing(null)}>Cancel</button><button className="primary" disabled={busy}>{busy?'Saving…':'Save changes'}</button></div></form></section>}{error&&<div className="state error"><strong>Couldn’t load this module.</strong><span>{error}</span><button className="secondary" onClick={()=>void load()}>Try again</button></div>}<section className="data-card"><div className="data-top"><h2>Live records</h2><span>{rows.length} record(s)</span></div>{rows.length ? <ResourceTable rows={rows} resolve={resolve} isAdmin={isAdmin} onEdit={beginEdit} onDelete={row=>void remove(row)} deletingId={deletingId} /> : <div className="state">No records returned.</div>}</section></>;
}
function Periods({periods,setPeriods,subjects,teachers}:{periods:any[];setPeriods:(x:any[])=>void;subjects:Row[];teachers:Row[]}){return <fieldset className="multi-select"><legend>Periods</legend>{periods.map((p,i)=><div className="period-row" key={i}><input type="number" min="1" value={p.periodNumber} onChange={e=>setPeriods(periods.map((x,j)=>j===i?{...x,periodNumber:e.target.value}:x))}/><select value={p.subjectId} onChange={e=>setPeriods(periods.map((x,j)=>j===i?{...x,subjectId:e.target.value}:x))}><option value="">Subject</option>{subjects.map(s=><option value={s._id} key={s._id}>{name(s)}</option>)}</select><select value={p.teacherId} onChange={e=>setPeriods(periods.map((x,j)=>j===i?{...x,teacherId:e.target.value}:x))}><option value="">Teacher</option>{teachers.map(t=><option value={t._id} key={t._id}>{name(t)}</option>)}</select><input type="time" value={p.startTime} onChange={e=>setPeriods(periods.map((x,j)=>j===i?{...x,startTime:e.target.value}:x))}/><input type="time" value={p.endTime} onChange={e=>setPeriods(periods.map((x,j)=>j===i?{...x,endTime:e.target.value}:x))}/></div>)}<button type="button" className="secondary" onClick={()=>setPeriods([...periods,{periodNumber:periods.length+1,subjectId:'',teacherId:'',startTime:'09:00',endTime:'09:45'}])}>Add period</button></fieldset>}
function Stops({stops,setStops}:{stops:any[];setStops:(x:any[])=>void}){return <fieldset className="multi-select"><legend>Stops</legend>{stops.map((s,i)=><div className="period-row" key={i}><input placeholder="Stop name" value={s.stopName} onChange={e=>setStops(stops.map((x,j)=>j===i?{...x,stopName:e.target.value}:x))}/><input type="time" value={s.pickupTime} onChange={e=>setStops(stops.map((x,j)=>j===i?{...x,pickupTime:e.target.value}:x))}/></div>)}<button type="button" className="secondary" onClick={()=>setStops([...stops,{stopName:'',pickupTime:'07:30'}])}>Add stop</button></fieldset>}
