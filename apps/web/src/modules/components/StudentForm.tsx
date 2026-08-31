import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Path } from 'react-hook-form';
import { z } from 'zod';
import { useState, type ReactNode } from 'react';

import type { CreateStudentInput, Student } from '../types/student.types';
import './StudentFormCards.css';

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  rollNumber: z.string().min(1),
  admissionNumber: z.string().min(1),
  dateOfBirth: z.string().min(1),

  gender: z.enum(['male', 'female', 'other']),

  class: z.string().min(1),
  section: z.string().min(1),

  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),

  admissionDate: z.string().min(1),

  status: z.enum([
    'active',
    'inactive',
    'graduated',
    'transferred',
  ]),

  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),

  guardian: z
    .object({
      name: z.string().optional(),
      relation: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
    })
    .optional(),
});

type FormValues = z.infer<typeof schema>;

type SectionId =
  | 'personal'
  | 'academic'
  | 'contact'
  | 'admission'
  | 'guardian'
  | 'address';

export function StudentForm({
  student,
  onSubmit,
  submitting = false,
}: {
  student?: Student;
  onSubmit: (data: CreateStudentInput) => Promise<void> | void;
  submitting?: boolean;
}) {
  const [openSection, setOpenSection] = useState<SectionId | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),

    defaultValues: student
      ? {
          ...student,
          dateOfBirth: student.dateOfBirth.slice(0, 10),
          admissionDate: student.admissionDate.slice(0, 10),
        }
      : {
          gender: 'male',
          status: 'active',
          admissionDate: new Date().toISOString().slice(0, 10),
        },
  });

  const toggleSection = (section: SectionId) => {
    setOpenSection((current) =>
      current === section ? null : section
    );
  };

  const field = (
    name: Path<FormValues>,
    label: string,
    type = 'text',
    placeholder = '',
    required = false,
  ) => {
    const error = name.split('.').reduce<unknown>((current, key) => (current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined), errors) as { message?: string } | undefined;
    return <div className="student-field">
      <label htmlFor={name}>
        {label}
        {required && <span className="required-star">*</span>}
      </label>

      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
      />

      {error && (
        <span className="field-error" role="alert">
          {error.message || `Please enter a valid ${label.toLowerCase()}.`}
        </span>
      )}
    </div>
  };

  const sectionCard = (
    id: SectionId,
    number: string,
    title: string,
    description: string,
    icon: ReactNode,
    content: ReactNode
  ) => {
    const isOpen = openSection === id;

    return (
      <section
        className={`student-section-card ${
          isOpen ? 'student-section-open' : ''
        }`}
      >
        <button
          type="button"
          className="student-section-header"
          onClick={() => toggleSection(id)}
          aria-expanded={isOpen}
        >
          <div className="student-section-left">
            <div className="student-section-icon">
              {icon}
            </div>

            <div className="student-section-text">
              <div className="student-section-number">
                {number}
              </div>

              <div>
                <h2>{title}</h2>
                <p>{description}</p>
                {!isOpen && <small>Click to add information</small>}
              </div>
            </div>
          </div>

          <span
            className={`student-chevron ${
              isOpen ? 'student-chevron-open' : ''
            }`}
          >
            ›
          </span>
        </button>

        {isOpen && (
          <div className="student-section-content">
            {content}
          </div>
        )}
      </section>
    );
  };

  return (
    <form
      className="student-form"
      onSubmit={handleSubmit((data) =>
        onSubmit(data as CreateStudentInput)
      )}
    >
      {Object.keys(errors).length > 0 && <p className="student-form-error" role="alert">Please complete the required student information.</p>}
      {/* HEADER */}

      <div className="student-form-header">
        <div className="student-header-icon">
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c.8-4 3-6 7-6s6.2 2 7 6" />
          </svg>
        </div>

        <div>
          <span className="student-eyebrow">
            STUDENT MANAGEMENT
          </span>

          <h1>{student ? 'Edit Student' : 'Add Student'}</h1>

          <p>
            Create and manage complete student profile information.
          </p>
        </div>
      </div>

      <div className="student-cards-grid">
      {/* 01 PERSONAL */}

      {sectionCard(
        'personal',
        '01',
        'Personal Information',
        'Basic student identity and personal details.',
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="12" cy="8" r="3" />
          <path d="M5 20c.7-3.5 3-5.5 7-5.5s6.3 2 7 5.5" />
        </svg>,
        <div className="student-fields-grid">
          {field(
            'firstName',
            'First Name',
            'text',
            'Enter first name',
            true
          )}

          {field(
            'lastName',
            'Last Name',
            'text',
            'Enter last name',
            true
          )}

          {field(
            'dateOfBirth',
            'Date of Birth',
            'date',
            '',
            true
          )}

          <div className="student-field">
            <label htmlFor="gender">
              Gender
              <span className="required-star">*</span>
            </label>

            <select id="gender" {...register('gender')}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <span className="field-error" role="alert">Please select a gender.</span>}
          </div>
        </div>
      )}

      {/* 02 ACADEMIC */}

      {sectionCard(
        'academic',
        '02',
        'Academic Information',
        'Class, section and academic identification.',
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M3 9l9-5 9 5-9 5-9-5Z" />
          <path d="M6 11v5c2.5 2 9.5 2 12 0v-5" />
          <path d="M21 10v5" />
        </svg>,
        <div className="student-fields-grid">
          {field(
            'rollNumber',
            'Roll Number',
            'text',
            'Enter roll number',
            true
          )}

          {field(
            'admissionNumber',
            'Admission Number',
            'text',
            'Enter admission number',
            true
          )}

          {field(
            'class',
            'Class',
            'text',
            'Enter class',
            true
          )}

          {field(
            'section',
            'Section',
            'text',
            'Enter section',
            true
          )}
        </div>
      )}

      {/* 03 CONTACT */}

      {sectionCard(
        'contact',
        '03',
        'Contact Information',
        'Student email and contact details.',
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>,
        <div className="student-fields-grid">
          {field(
            'email',
            'Email',
            'email',
            'student@example.com'
          )}

          {field(
            'phone',
            'Phone',
            'tel',
            'Enter phone number'
          )}
        </div>
      )}

      {/* 04 ADMISSION */}

      {sectionCard(
        'admission',
        '04',
        'Admission Information',
        'Admission date and current academic status.',
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>,
        <div className="student-fields-grid">
          {field(
            'admissionDate',
            'Admission Date',
            'date',
            '',
            true
          )}

          <div className="student-field">
            <label htmlFor="status">
              Status
              <span className="required-star">*</span>
            </label>

            <select id="status" {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
            </select>
            {errors.status && <span className="field-error" role="alert">Please select an admission status.</span>}
          </div>
        </div>
      )}

      {/* 05 GUARDIAN */}

      {sectionCard(
        'guardian',
        '05',
        'Guardian Information',
        'Parent or guardian contact information.',
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.3" />
          <path d="M3.5 20c.5-3.5 2.5-5.5 5.5-5.5s5 2 5.5 5.5" />
          <path d="M14 15c2.8-.3 5 1.2 5.5 4" />
        </svg>,
        <div className="student-fields-grid">
          {field(
            'guardian.name',
            'Guardian Name',
            'text',
            'Enter guardian name'
          )}

          {field(
            'guardian.relation',
            'Relation',
            'text',
            'Parent / Guardian'
          )}

          {field(
            'guardian.phone',
            'Guardian Phone',
            'tel',
            'Enter phone number'
          )}

          {field(
            'guardian.email',
            'Guardian Email',
            'email',
            'guardian@example.com'
          )}
        </div>
      )}

      {/* 06 ADDRESS */}

      {sectionCard(
        'address',
        '06',
        'Address & Documents',
        'Student residential address details. Document uploads are not enabled.',
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M4 10 12 4l8 6" />
          <path d="M6 9v10h12V9" />
          <path d="M10 19v-5h4v5" />
        </svg>,
        <div className="student-fields-grid">
          {field(
            'address.street',
            'Street',
            'text',
            'Enter street'
          )}

          {field(
            'address.city',
            'City',
            'text',
            'Enter city'
          )}

          {field(
            'address.state',
            'State',
            'text',
            'Enter state'
          )}

          {field(
            'address.zipCode',
            'ZIP Code',
            'text',
            'Enter ZIP code'
          )}

          {field(
            'address.country',
            'Country',
            'text',
            'Enter country'
          )}
        </div>
      )}

      </div>

      {/* FOOTER */}

      <div className="student-form-footer">
        <span>
          <b>*</b> Required fields
        </span>

        <button
          type="submit"
          className="student-save-button"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save Student'}
        </button>
      </div>
    </form>
  );
}
