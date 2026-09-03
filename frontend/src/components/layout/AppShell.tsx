import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import './AppShell.css';

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Shell used by admin pages: sidebar + top header (search/notifications/profile) + content.
 * The header's global search/notifications are static Figma chrome, not wired to any
 * behavior — they belong to app-wide features outside this page's scope.
 */
export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar />
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
            <div className="app-shell__avatar" aria-hidden="true">
              OG
            </div>
            <div className="app-shell__profile">
              <p className="app-shell__profile-name">Olivia Grant</p>
              <p className="app-shell__profile-role">School administrator</p>
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
