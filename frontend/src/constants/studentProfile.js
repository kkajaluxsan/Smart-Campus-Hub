/** Matches backend `Department` enum */
export const DEPARTMENTS = [
  { value: 'IT', label: 'IT' },
  { value: 'SE', label: 'SE (Software Engineering)' },
  { value: 'DS', label: 'DS (Data Science)' },
  { value: 'CYBER', label: 'Cyber Security' },
  { value: 'AI', label: 'AI (Artificial Intelligence)' },
  { value: 'NETWORKING', label: 'Networking' },
];

export function formatDepartment(code) {
  if (!code) return '';
  const d = DEPARTMENTS.find((x) => x.value === code);
  return d ? d.label : code;
}

export function formatYearSemester(year, semester) {
  if (year == null || semester == null) return '';
  return `Year ${year} · Semester ${semester}`;
}
