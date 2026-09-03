import { useState } from 'react';
import type { ChangeEvent, FormEvent, MouseEvent } from 'react';
import type { CreateStudentInput, Gender, Student, UpdateStudentInput } from '../../types/student';
import { ApiError } from '../../api/client';
import './AddEditStudentModal.css';

interface AddEditStudentModalProps {
  /** null = create mode, Student = edit mode (prefilled). */
  student: Student | null;
  onClose: () => void;
  onCreate: (input: CreateStudentInput) => Promise<void>;
  onUpdate: (id: string, input: UpdateStudentInput) => Promise<void>;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rollNumber: string;
  section: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  gender: Gender | '';
}

function toFormState(student: Student | null): FormState {
  return {
    firstName: student?.firstName ?? '',
    lastName: student?.lastName ?? '',
    email: student?.email ?? '',
    phone: student?.phone ?? '',
    rollNumber: student?.rollNumber ?? '',
    section: student?.section ?? '',
    guardianName: student?.guardianName ?? '',
    guardianPhone: student?.guardianPhone ?? '',
    guardianEmail: student?.guardianEmail ?? '',
    gender: student?.gender ?? '',
  };
}

/** Fields the DTO actually accepts undefined/omitted for — send undefined rather than '' */
function toPayload(form: FormState): CreateStudentInput {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || undefined,
    rollNumber: form.rollNumber.trim() || undefined,
    section: form.section.trim() || undefined,
    guardianName: form.guardianName.trim() || undefined,
    guardianPhone: form.guardianPhone.trim() || undefined,
    guardianEmail: form.guardianEmail.trim() || undefined,
    gender: form.gender || undefined,
  };
}

export function AddEditStudentModal({ student, onClose, onCreate, onUpdate }: AddEditStudentModalProps) {
  const isEditMode = student !== null;
  const [form, setForm] = useState<FormState>(() => toFormState(student));
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!form.firstName.trim()) errors.push('First name is required.');
    if (!form.lastName.trim()) errors.push('Last name is required.');
    if (!form.email.trim()) {
      errors.push('Email is required.');
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      errors.push('Enter a valid email address.');
    }
    if (form.guardianEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.guardianEmail.trim())) {
      errors.push('Enter a valid guardian email address.');
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validate();
    if (clientErrors.length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors([]);
    setIsSubmitting(true);

    try {
      const payload = toPayload(form);
      if (isEditMode) {
        await onUpdate(student._id, payload);
      } else {
        await onCreate(payload);
      }
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 400 && Array.isArray(error.body?.message)) {
          setFieldErrors(error.body.message);
        } else if (error.statusCode === 409) {
          setFormError(error.message);
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-modal-title"
        onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h2 id="student-modal-title">{isEditMode ? 'Edit Student' : 'Add Student'}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={(event: FormEvent<HTMLFormElement>) => void handleSubmit(event)} noValidate>
          {(fieldErrors.length > 0 || formError) && (
            <div className="modal__error-summary" role="alert">
              {formError && <p>{formError}</p>}
              {fieldErrors.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
          )}

          <div className="modal__grid">
            <label className="modal__field">
              <span>First name *</span>
              <input value={form.firstName} onChange={(e: ChangeEvent<HTMLInputElement>) => update('firstName', e.target.value)} required />
            </label>
            <label className="modal__field">
              <span>Last name *</span>
              <input value={form.lastName} onChange={(e: ChangeEvent<HTMLInputElement>) => update('lastName', e.target.value)} required />
            </label>
            <label className="modal__field modal__field--wide">
              <span>Email *</span>
              <input type="email" value={form.email} onChange={(e: ChangeEvent<HTMLInputElement>) => update('email', e.target.value)} required />
            </label>
            <label className="modal__field">
              <span>Phone</span>
              <input value={form.phone} onChange={(e: ChangeEvent<HTMLInputElement>) => update('phone', e.target.value)} />
            </label>
            <label className="modal__field">
              <span>Gender</span>
              <select value={form.gender} onChange={(e: ChangeEvent<HTMLSelectElement>) => update('gender', e.target.value as Gender | '')}>
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="modal__field">
              <span>Roll number</span>
              <input value={form.rollNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => update('rollNumber', e.target.value)} />
            </label>
            <label className="modal__field">
              <span>Section</span>
              <input value={form.section} onChange={(e: ChangeEvent<HTMLInputElement>) => update('section', e.target.value)} />
            </label>
            <label className="modal__field">
              <span>Guardian name</span>
              <input value={form.guardianName} onChange={(e: ChangeEvent<HTMLInputElement>) => update('guardianName', e.target.value)} />
            </label>
            <label className="modal__field">
              <span>Guardian phone</span>
              <input value={form.guardianPhone} onChange={(e: ChangeEvent<HTMLInputElement>) => update('guardianPhone', e.target.value)} />
            </label>
            <label className="modal__field modal__field--wide">
              <span>Guardian email</span>
              <input
                type="email"
                value={form.guardianEmail}
                onChange={(e: ChangeEvent<HTMLInputElement>) => update('guardianEmail', e.target.value)}
              />
            </label>
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="modal__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Add student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
