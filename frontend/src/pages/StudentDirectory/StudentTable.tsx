import { useState } from 'react';
import type { Student } from '../../types/student';
import './StudentTable.css';

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  loadError: string | null;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => Promise<void>;
}

const COLUMNS = ['Photo', 'Name', 'Roll No', 'Section', 'Guardian', 'Contact', 'Status', 'Action'] as const;

export function StudentTable({ students, isLoading, loadError, onEdit, onDelete }: StudentTableProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  async function handleConfirmDelete(student: Student) {
    setDeletingId(student._id);
    setRowError(null);
    try {
      await onDelete(student);
      setPendingDeleteId(null);
    } catch (error) {
      setRowError({ id: student._id, message: error instanceof Error ? error.message : 'Delete failed.' });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="student-table-card">
      <div className="student-table" role="table" aria-label="Students">
        <div className="student-table__header" role="row">
          {COLUMNS.map((column) => (
            <span key={column} className={`student-table__col student-table__col--${column.toLowerCase().replace(/\s+/g, '-')}`} role="columnheader">
              {column}
            </span>
          ))}
        </div>

        {isLoading && <TableSkeleton />}

        {!isLoading && loadError && (
          <div className="student-table__state student-table__state--error" role="alert">
            <p className="student-table__state-title">Couldn't load students</p>
            <p className="student-table__state-copy">{loadError}</p>
          </div>
        )}

        {!isLoading && !loadError && students.length === 0 && (
          <div className="student-table__state">
            <p className="student-table__state-title">No students found</p>
            <p className="student-table__state-copy">Try a different search, or add the first student.</p>
          </div>
        )}

        {!isLoading &&
          !loadError &&
          students.map((student) => {
            const isPendingDelete = pendingDeleteId === student._id;
            const isDeleting = deletingId === student._id;
            const initials = getInitials(student.firstName, student.lastName);

            return (
              <div key={student._id} className="student-table__row" role="row">
                <div className="student-table__col student-table__col--photo" role="cell">
                  {student.profilePhotoUrl ? (
                    <img className="student-table__avatar" src={student.profilePhotoUrl} alt="" />
                  ) : (
                    <span className="student-table__avatar student-table__avatar--fallback" aria-hidden="true">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="student-table__col student-table__col--name" role="cell">
                  {student.firstName} {student.lastName}
                </div>
                <div className="student-table__col student-table__col--roll-no" role="cell">
                  {student.rollNumber ?? '—'}
                </div>
                <div className="student-table__col student-table__col--section" role="cell">
                  {student.section ?? '—'}
                </div>
                <div className="student-table__col student-table__col--guardian" role="cell">
                  {student.guardianName ?? '—'}
                </div>
                <div className="student-table__col student-table__col--contact" role="cell">
                  {student.guardianPhone ?? '—'}
                </div>
                <div className="student-table__col student-table__col--status" role="cell">
                  <span
                    className={
                      student.isActive
                        ? 'student-table__badge student-table__badge--active'
                        : 'student-table__badge student-table__badge--inactive'
                    }
                  >
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="student-table__col student-table__col--action" role="cell">
                  {!isPendingDelete ? (
                    <>
                      <button
                        type="button"
                        className="student-table__icon-button"
                        onClick={() => onEdit(student)}
                        aria-label={`Edit ${student.firstName} ${student.lastName}`}
                      >
                        <EditGlyph />
                      </button>
                      <button
                        type="button"
                        className="student-table__icon-button student-table__icon-button--danger"
                        onClick={() => {
                          setRowError(null);
                          setPendingDeleteId(student._id);
                        }}
                        aria-label={`Delete ${student.firstName} ${student.lastName}`}
                      >
                        <TrashGlyph />
                      </button>
                    </>
                  ) : (
                    <div className="student-table__confirm">
                      <span>Delete?</span>
                      <button
                        type="button"
                        className="student-table__confirm-yes"
                        onClick={() => void handleConfirmDelete(student)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting…' : 'Yes'}
                      </button>
                      <button
                        type="button"
                        className="student-table__confirm-no"
                        onClick={() => setPendingDeleteId(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                {rowError?.id === student._id && (
                  <div className="student-table__row-error" role="alert">
                    {rowError.message}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="student-table__row student-table__row--skeleton">
          <div className="student-table__skeleton-avatar" />
          <div className="student-table__skeleton-line" style={{ width: '40%' }} />
          <div className="student-table__skeleton-line" style={{ width: '60%' }} />
        </div>
      ))}
    </div>
  );
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function EditGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M8.2 1.5L10.5 3.8L4 10.3L1.3 10.7L1.7 8L8.2 1.5Z" stroke="#172033" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function TrashGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1.5 3H10.5" stroke="#e96b5b" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M4 3V1.8C4 1.4 4.3 1 4.8 1H7.2C7.6 1 7.9 1.4 7.9 1.8V3" stroke="#e96b5b" strokeWidth="1.1" />
      <path d="M2.5 3L3 10.3C3 10.7 3.4 11 3.8 11H8.2C8.6 11 9 10.7 9 10.3L9.5 3" stroke="#e96b5b" strokeWidth="1.1" />
    </svg>
  );
}
