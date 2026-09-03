import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import './AppShell.css';

interface AppShellProps {
  title: string;
  subtitle: string;
  activeNav?: string;
  portalLabel?: string;
  profileName?: string;
  profileRole?: string;
  children: ReactNode;
  profileAvatarUrl?: string;
  showNavIcons?: boolean;
}

/**
 * Shell used by admin pages: sidebar + top header (search/notifications/profile) + content.
 * The header's global search/notifications are static Figma chrome.
 */
export function AppShell({ title, subtitle, activeNav = 'Students', portalLabel = 'Admin portal', profileName = 'Olivia Grant', profileRole = 'School administrator', profileAvatarUrl, showNavIcons = false, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar activeNav={activeNav} portalLabel={portalLabel} showIcons={showNavIcons} />
      <div className="app-shell__workspace">
        <header className="app-shell__header">
          <div>
            <h1 className="app-shell__title">{title}</h1>
            <p className="app-shell__subtitle">{subtitle}</p>
          </div>
          <div className="app-shell__header-actions">
            <div className="app-shell__search" role="search">
              <SearchGlyph />
              <span className="app-shell__search-placeholder">Search anything</span>
            </div>
            <div className="app-shell__notifications" aria-label="Notifications">
              <BellGlyph />
            </div>
            {profileAvatarUrl ? <img className="app-shell__avatar" src={profileAvatarUrl} alt="" /> : <div className="app-shell__avatar" aria-hidden="true">OG</div>}
            <div className="app-shell__profile">
              <p className="app-shell__profile-name">{profileName}</p>
              <p className="app-shell__profile-role">{profileRole}</p>
            </div>
          </div>
        </header>
        <div className="app-shell__divider" />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="#667085" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BellGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 2.5C6.79 2.5 5 4.29 5 6.5V9L3.5 11.5H14.5L13 9V6.5C13 4.29 11.21 2.5 9 2.5Z"
        stroke="#667085"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7.3 13.5C7.3 14.47 8.03 15.2 9 15.2C9.97 15.2 10.7 14.47 10.7 13.5" stroke="#667085" strokeWidth="1.4" />
    </svg>
  );
}
