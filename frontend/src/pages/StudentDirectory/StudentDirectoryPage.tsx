import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { StudentMetricCard } from './StudentMetricCard';
import { StudentFilterBar } from './StudentFilterBar';
import { StudentTable } from './StudentTable';
import { AddEditStudentModal } from './AddEditStudentModal';
import { createStudent, deleteStudent, listStudents, updateStudent } from '../../api/studentApi';
import type { CreateStudentInput, Student, UpdateStudentInput } from '../../types/student';
import { ApiError } from '../../api/client';
import './StudentDirectoryPage.css';

const SEARCH_DEBOUNCE_MS = 350;

export function StudentDirectoryPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  const [modalStudent, setModalStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce the search box before hitting the backend `search` query param.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  async function fetchStudents(search: string) {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await listStudents(search || undefined);
      setStudents(result);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : 'Unable to load students right now.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchStudents(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Section options are derived client-side from whatever's currently loaded —
  // there's no endpoint to fetch the full list of sections/classes.
  const sectionOptions = useMemo(() => {
    const values = new Set<string>();
    for (const student of students) {
      if (student.section) values.add(student.section);
    }
    return Array.from(values).sort();
  }, [students]);

  const visibleStudents = useMemo(() => {
    if (!sectionFilter) return students;
    return students.filter((student) => student.section === sectionFilter);
  }, [students, sectionFilter]);

  function openAddModal() {
    setModalStudent(null);
    setIsModalOpen(true);
  }

  function openEditModal(student: Student) {
    setModalStudent(student);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setModalStudent(null);
  }

  async function handleCreate(input: CreateStudentInput) {
    const created = await createStudent(input);
    setStudents((prev) => [created, ...prev]);
  }

  async function handleUpdate(id: string, input: UpdateStudentInput) {
    const updated = await updateStudent(id, input);
    setStudents((prev) => prev.map((student) => (student._id === id ? updated : student)));
  }

  async function handleDelete(student: Student) {
    await deleteStudent(student._id);
    setStudents((prev) => prev.filter((item) => item._id !== student._id));
  }

  return (
    <AppShell title="Student Directory" subtitle="Manage, inspect, and register student records.">
      <div className="student-directory__metrics">
        <StudentMetricCard total={isLoading && students.length === 0 ? null : students.length} />
      </div>

      <div className="student-table-section">
        <StudentFilterBar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          sectionValue={sectionFilter}
          sectionOptions={sectionOptions}
          onSectionChange={setSectionFilter}
          onAddStudent={openAddModal}
        />
        <StudentTable
          students={visibleStudents}
          isLoading={isLoading}
          loadError={loadError}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </div>

      {isModalOpen && (
        <AddEditStudentModal
          student={modalStudent}
          onClose={closeModal}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}
    </AppShell>
  );
}
