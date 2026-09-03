import type { ChangeEvent } from 'react';
import './StudentFilterBar.css';

interface StudentFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sectionValue: string;
  sectionOptions: string[];
  onSectionChange: (value: string) => void;
  onAddStudent: () => void;
}

/**
 * Search hits the backend `search` query param (matches firstName/lastName/rollNumber).
 * The Class/Section filter is client-side only, over `section` — the API has no
 * classId lookup to power a real "Class/Section" filter (see StudentTable notes).
 */
export function StudentFilterBar({
  searchValue,
  onSearchChange,
  sectionValue,
  sectionOptions,
  onSectionChange,
  onAddStudent,
}: StudentFilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__left">
        <label className="filter-bar__search">
          <SearchGlyph />
          <input
            type="text"
            placeholder="Search student by name or roll..."
            value={searchValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
            aria-label="Search students by name or roll number"
          />
        </label>

        <label className="filter-bar__select">
          <FilterGlyph />
          <select
            value={sectionValue}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => onSectionChange(event.target.value)}
            aria-label="Filter by section"
          >
            <option value="">Section: All</option>
            {sectionOptions.map((section) => (
              <option key={section} value={section}>
                Section: {section}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-bar__right">
        <button type="button" className="filter-bar__export" disabled title="Coming soon">
          <DownloadGlyph />
          Export Sheets
        </button>
        <button type="button" className="filter-bar__add" onClick={onAddStudent}>
          <PlusGlyph />
          Add Student
        </button>
      </div>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.3" stroke="#667085" strokeWidth="1.3" />
      <path d="M9.3 9.3L12 12" stroke="#667085" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function FilterGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1.5 2.5H10.5L7 6.6V10L5 9V6.6L1.5 2.5Z" stroke="#172033" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1.5V8" stroke="#172033" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M3 5.5L6 8.5L9 5.5" stroke="#172033" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.5 10.5H10.5" stroke="#172033" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PlusGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1.5V10.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M1.5 6H10.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
