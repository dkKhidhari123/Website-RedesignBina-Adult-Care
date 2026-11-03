/**
 * Fixed form options. Kept in their own dependency-free file because the
 * /api functions import them for validation.
 */
export const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1 year',
  ...Array.from({ length: 9 }, (_, i) => `${i + 2} years`),
  'More than 10 years',
] as const;

/* ── Visits ────────────────────────────────────────────────── */
export const VISIT_TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'] as const;
export const VISITOR_COUNTS = ['1', '2', '3', '4', '5+'] as const;
