import { StudentDirectoryPage } from './pages/StudentDirectory/StudentDirectoryPage';
import { AttendancePage } from './pages/Attendance/AttendancePage';
import { ClassTimetable } from './pages/ClassTimetable';
import { Examinations } from './pages/Examinations';
import { AssignmentBoard } from './pages/AssignmentBoard';

// Only the Student Directory page exists so far — routing will be introduced
// once more Student Service pages are built.
export function App() {
  if (window.location.pathname.startsWith('/attendance')) return <AttendancePage />;
  if (window.location.pathname.startsWith('/timetable')) return <ClassTimetable />;
  if (window.location.pathname.startsWith('/examinations')) return <Examinations />;
  if (window.location.pathname.startsWith('/assignments')) return <AssignmentBoard />;
  return <StudentDirectoryPage />;
}

export default App;
