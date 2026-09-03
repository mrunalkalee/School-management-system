import './Sidebar.css';

const NAV_ITEMS = [
  'Overview',
  'Students',
  'Teachers',
  'Assignments',
  'Academics',
  'Attendance',
  'Fees',
  'Certificates',
  'Timetable',
  'Reports',
] as const;

/**
 * Admin sidebar from the Figma "student-management" frame.
 * Navigation labels remain static until their pages are built.
 */
const NAV_ICON_URLS = [
  'https://www.figma.com/api/mcp/asset/8a394829-daca-430f-af49-fe5f7c6ee176.svg',
  'https://www.figma.com/api/mcp/asset/57404522-aee3-4298-a23b-cc771ff0062d.svg',
  'https://www.figma.com/api/mcp/asset/0ce52ce9-f7cd-4ea4-9f84-407b693a2685.svg',
  'https://www.figma.com/api/mcp/asset/ce37cd9a-4893-4b03-94c7-a46d81f9a3dc.svg',
  'https://www.figma.com/api/mcp/asset/ce37cd9a-4893-4b03-94c7-a46d81f9a3dc.svg',
  'https://www.figma.com/api/mcp/asset/58e21b9c-426e-4ead-bc2b-0aed964cc9a2.svg',
  'https://www.figma.com/api/mcp/asset/9b01c4b8-475c-4fc7-949d-573f2416f4cd.svg',
  'https://www.figma.com/api/mcp/asset/ffa5dc46-5084-4b95-9df4-910152511669.svg',
  'https://www.figma.com/api/mcp/asset/e3ae42ac-dd37-4ff2-b8d9-3a322ba5e306.svg',
];
export function Sidebar({ activeNav = 'Students', portalLabel = 'Admin portal', showIcons = false }: { activeNav?: string; portalLabel?: string; showIcons?: boolean }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">A</div>
        <div className="sidebar__brand-copy">
          <p className="sidebar__brand-name">Aster School</p>
          <p className="sidebar__brand-role">{portalLabel}</p>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {NAV_ITEMS.map((item, index) => {
          const isActive = item === activeNav;
          return (
            <div
              key={item}
              className={isActive ? 'sidebar__nav-item sidebar__nav-item--active' : 'sidebar__nav-item'}
              aria-current={isActive ? 'page' : undefined}
            >
              {showIcons && <img className="sidebar__nav-icon" src={NAV_ICON_URLS[index]} alt="" />}
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
