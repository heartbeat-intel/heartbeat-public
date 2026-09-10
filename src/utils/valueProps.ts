/**
 * Subscribe-modal "value prop" bullets.
 *
 * Mirrored byte-for-byte in both hosts of the subscribe widget:
 *   heartbeat-web/src/constants/valueProps.ts
 *   heartbeat-public/src/utils/valueProps.ts
 * Keep the two files byte-identical: the same publisher is rendered by both,
 * depending on which host the reader is on, so a diff between them is drift.
 *
 * Publishers author their own from Setup → Pricing; these are what everyone
 * who hasn't customised them still sees. A NULL `value_props` column on the
 * Exchange publisher record means "never customised" and is the signal to fall
 * back here — an empty array would mean "deliberately blank".
 */
export const DEFAULT_PAID_VALUE_PROPS = [
  'Full access to all intel lists',
  'New releases as they publish',
  'Priority support',
  '2 months free',
];

export const DEFAULT_FREE_VALUE_PROPS = [
  'Access to free releases',
  'Stay up to date with new drops',
  'No credit card required',
];

/** Caps mirrored from the Exchange validator, so the editor cannot save a 422. */
export const MAX_VALUE_PROPS = 6;
export const MAX_VALUE_PROP_LENGTH = 60;

export type ValueProps = { paid?: string[]; free?: string[] } | null;

/** Publisher-authored bullets when set, otherwise the Heartbeat defaults. */
export const resolveValueProps = (
  authored: string[] | undefined,
  fallback: string[]
): string[] => (authored && authored.length > 0 ? authored : fallback);
