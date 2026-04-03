/**
 * Fixed expertise categories — keep in sync with heartbeat-web `src/constants/expertise.ts`
 * and the backend ExpertiseCategory enum.
 */
export const EXPERTISE_CATEGORIES = [
  'Finance',
  'Tech',
  'AI & Data',
  'Strategy',
  'Markets',
  'Venture Capital',
  'Healthcare',
  'Energy',
  'Real Estate',
  'Crypto',
  'Macro',
  'ESG',
  'Family Office',
  'Investments',
] as const;

export type ExpertiseCategory = (typeof EXPERTISE_CATEGORIES)[number];

export const MAX_EXPERTISE_SELECTIONS = 5;
