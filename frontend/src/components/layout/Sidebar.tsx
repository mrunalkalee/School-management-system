import './Sidebar.css';

const NAV_ITEMS = [
  'Overview',
  'Students',
  'Teachers',
  'Academics',
  'Attendance',
  'Fees',
  'Timetable',
  'Reports',
] as const;

/**
 * Admin sidebar from the Figma "student-management" frame.
 * Only "Students" is wired to this page; the rest are static labels since
 * their pages aren't built yet (per "one Student page at a time").
 */
export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">A</div>
        <div className="sidebar__brand-copy">
          <p className="sidebar__brand-name">Aster School</p>
          <p className="sidebar__brand-role">Admin portal</p>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = item === 'Students';
          return (
            <div
              key={item}
              className={isActive ? 'sidebar__nav-item sidebar__nav-item--active' : 'sidebar__nav-item'}
              aria-current={isActive ? 'page' : undefined}
            >
              {item}
            </div>
          );
        })}
      </nav>

      <div className="sidebar__support">
        <p className="sidebar__support-title">Need help?</p>
        <p className="sidebar__support-copy">Visit the help center or contact school administration.</p>
      </div>
    </aside>
  );
}
