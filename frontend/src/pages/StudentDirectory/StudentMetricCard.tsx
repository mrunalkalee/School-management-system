import './StudentMetricCard.css';

interface StudentMetricCardProps {
  /** Total active students currently loaded from the API, or null while loading. */
  total: number | null;
}

/**
 * Only "Total Students" is shown — the other three cards in the Figma design
 * (New This Term, Average Attendance, Pending Admissions) have no backing data
 * in the Student Service and were intentionally dropped for this version.
 */
export function StudentMetricCard({ total }: StudentMetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card__heading">
        <p className="metric-card__label">Total Students</p>
        <div className="metric-card__icon-tile">
          <PeopleGlyph />
        </div>
      </div>
      <p className="metric-card__value">{total === null ? '—' : total.toLocaleString()}</p>
      <p className="metric-card__caption">Active students on record</p>
    </div>
  );
}

function PeopleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="5" r="2.2" stroke="#2f6bff" strokeWidth="1.3" />
      <path d="M2 13c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="#2f6bff" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 6.2c1 .1 1.8.9 1.8 2" stroke="#2f6bff" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11.5 9.8c1.4.3 2.5 1.3 2.5 3" stroke="#2f6bff" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
