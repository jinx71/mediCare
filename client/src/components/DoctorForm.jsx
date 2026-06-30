import React from 'react';
import { useForm } from 'react-hook-form';
import Input from './Input';
import Select from './Select';
import Button from './Button';

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Orthopaedics',
  'General Medicine',
  'Psychiatry',
  'Ophthalmology',
  'ENT',
  'Gynaecology',
];

const WEEKDAYS = [
  { i: 1, label: 'Mon' },
  { i: 2, label: 'Tue' },
  { i: 3, label: 'Wed' },
  { i: 4, label: 'Thu' },
  { i: 5, label: 'Fri' },
  { i: 6, label: 'Sat' },
  { i: 0, label: 'Sun' },
];

const DEFAULT_SLOTS = '09:00, 09:30, 10:00, 10:30, 11:00, 14:00, 14:30, 15:00';

// Maps the form (slots as CSV, workingDays as checkbox array of strings) to the
// API payload, and back for editing.
const DoctorForm = ({ initial, submitting, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initial
      ? {
          ...initial,
          slots: (initial.slots || []).join(', '),
          workingDays: (initial.workingDays || []).map(String),
        }
      : {
          name: '',
          specialty: SPECIALTIES[0],
          qualifications: '',
          bio: '',
          experienceYears: 5,
          consultationFee: 100,
          location: 'Main Hospital, Dublin',
          slots: DEFAULT_SLOTS,
          workingDays: ['1', '2', '3', '4', '5'],
        },
  });

  const submit = (values) => {
    const payload = {
      ...values,
      experienceYears: Number(values.experienceYears),
      consultationFee: Number(values.consultationFee),
      workingDays: (values.workingDays || []).map(Number),
      slots: values.slots
        .split(',')
        .map((s) => s.trim())
        .filter((s) => /^\d{2}:\d{2}$/.test(s)),
    };
    onSubmit(payload);
  };

  return (
    <div className="space-y-4">
      <Input
        label="Name"
        required
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />
      <Select label="Specialty" {...register('specialty')}>
        {SPECIALTIES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Input label="Qualifications" placeholder="MB BCh, MRCPI" {...register('qualifications')} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Bio</label>
        <textarea
          rows={3}
          maxLength={600}
          className="w-full rounded-xl border border-ink-100 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          {...register('bio')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Experience (yrs)" type="number" min="0" {...register('experienceYears')} />
        <Input label="Fee (€)" type="number" min="0" {...register('consultationFee')} />
      </div>
      <Input label="Location" {...register('location')} />

      <div>
        <label className="mb-2 block text-sm font-medium text-ink-700">Working days</label>
        <div className="flex flex-wrap gap-3">
          {WEEKDAYS.map((d) => (
            <label key={d.i} className="inline-flex items-center gap-1.5 text-sm text-ink-700">
              <input
                type="checkbox"
                value={String(d.i)}
                className="h-4 w-4 rounded border-ink-100 text-brand-500 focus:ring-brand-300"
                {...register('workingDays')}
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      <Input
        label="Time slots"
        hint="Comma-separated, 24h HH:mm (e.g. 09:00, 09:30, 14:00)"
        {...register('slots')}
      />

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1" loading={submitting} onClick={handleSubmit(submit)}>
          {initial ? 'Save changes' : 'Add doctor'}
        </Button>
      </div>
    </div>
  );
};

export default DoctorForm;
