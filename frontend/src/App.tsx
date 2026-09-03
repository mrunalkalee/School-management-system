import { StudentDirectoryPage } from './pages/StudentDirectory/StudentDirectoryPage';
import { AttendancePage } from './pages/Attendance/AttendancePage';

// Only the Student Directory page exists so far — routing will be introduced
// once more Student Service pages are built.
export function App() {
  return window.location.pathname.startsWith('/attendance') ? <AttendancePage /> : <StudentDirectoryPage />;
}

export default App;
