// Subscribe-modal bullets shown when a publisher has never customised theirs.
// Kept in sync with heartbeat-web's src/constants/valueProps.ts — the two
// modals must not drift, since the same publisher is rendered by both.
//
// Deliberately its own module rather than living in constants.ts: this is a
// value import from a client component, and constants.ts carries the static
// CONTENT_DATA fixtures.
export const DEFAULT_PAID_VALUE_PROPS = [
  'Full access to all intel lists',
  'New releases as they publish',
  'Priority support',
  '2 months free',
];
