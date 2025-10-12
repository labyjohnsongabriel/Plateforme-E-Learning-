export const DOMAINS = ['Informatique', 'Communication', 'Multimedia'] as const;
export type Domain = typeof DOMAINS[number];

export const CERTIFICATE_MIN_LEVEL = 'beta';
export const INACTIVITY_DAYS_FOR_REMINDER = 7;
export const FILE_CLEANUP_DAYS = 30;