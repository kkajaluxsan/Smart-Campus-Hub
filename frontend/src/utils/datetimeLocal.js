/** Parse YYYY-MM-DDTHH:mm (local) without UTC shift */
export function parseLocalDatetime(s) {
  if (!s || typeof s !== 'string') return null;
  const normalized = s.length === 16 ? `${s}:00` : s;
  const [datePart, timePart] = normalized.split('T');
  if (!datePart || !timePart) return null;
  const [y, mo, da] = datePart.split('-').map(Number);
  const tp = timePart.split(':');
  const h = Number(tp[0]);
  const mi = Number(tp[1]);
  const se = tp[2] != null ? Number(tp[2]) : 0;
  if ([y, mo, da, h, mi, se].some((x) => Number.isNaN(x))) return null;
  return new Date(y, mo - 1, da, h, mi, se, 0);
}

export function toLocalDatetimeLocalValue(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local value → LocalDateTime string for API (no timezone shift) */
export function localToApi(dtLocal) {
  if (!dtLocal) return '';
  return dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal;
}

/**
 * Inline validation for booking start/end (local times).
 * @returns {{ start: string, end: string }} empty strings when valid
 */
export function getBookingTimeErrors(startStr, endStr) {
  const errors = { start: '', end: '' };
  if (!startStr?.trim()) {
    errors.start = 'Choose a start date and time.';
    return errors;
  }
  const start = parseLocalDatetime(startStr);
  if (!start) {
    errors.start = 'Invalid start date or time.';
    return errors;
  }
  if (!endStr?.trim()) {
    errors.end = 'Choose an end date and time.';
    return errors;
  }
  const end = parseLocalDatetime(endStr);
  if (!end) {
    errors.end = 'Invalid end date or time.';
    return errors;
  }
  if (start.getTime() <= Date.now()) {
    errors.start = 'Start must be in the future.';
  }
  if (end.getTime() <= start.getTime()) {
    errors.end = 'End must be after the start time.';
  }
  return errors;
}
