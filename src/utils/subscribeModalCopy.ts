/**
 * Subscribe-widget copy: every user-visible string, label, timer and storage
 * key the widget uses, as data-only `{var}` templates.
 *
 * Mirrored byte-for-byte in both hosts of the widget:
 *   heartbeat-web/src/constants/subscribeModalCopy.ts
 *   heartbeat-public/src/utils/subscribeModalCopy.ts
 * Keep the two files byte-identical. The tenant (Chakra) and Exchange
 * (Tailwind) modals are two implementations of one spec, and each repo
 * snapshots SUBSCRIBE_COPY so a one-sided edit fails that repo's tests.
 *
 * No imports: this module loads in a Vite/React build and in an Astro build.
 * Icons, test ids, layout, colours and API paths stay in the components.
 */

export type TierId = 'monthly' | 'yearly' | 'free';

/** Card order on the pricing step. */
export const TIER_ORDER: readonly TierId[] = ['monthly', 'yearly', 'free'];

/** Preselected when the publisher offers it, otherwise the first tier wins. */
export const DEFAULT_TIER: TierId = 'monthly';

export const TIER_NAMES: Record<TierId, string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
  free: 'Get invite',
};

export const TIER_PERIODS: Record<TierId, string> = {
  monthly: '/month',
  yearly: '/year',
  free: '',
};

export const STEP_LABELS = {
  choosePlan: 'Choose Plan',
  verifyEmail: 'Verify Email',
  payment: 'Payment',
  access: 'Access',
} as const;

/** The three stepper labels; the last one says where the tier ends up. */
export const stepLabels = (tier: TierId | ''): readonly [string, string, string] => [
  STEP_LABELS.choosePlan,
  STEP_LABELS.verifyEmail,
  tier === 'free' ? STEP_LABELS.access : STEP_LABELS.payment,
];

export const OTP_LENGTH = 6;
/** Pause after the last digit before auto-submitting, so the box fills first. */
export const OTP_AUTOSUBMIT_DELAY_MS = 100;
/** Dev mode only: subscribe-init returns the code; verify it after this pause. */
export const DEV_CODE_AUTOVERIFY_DELAY_MS = 200;

/** localStorage key for the Exchange JWT that bridges to checkout and success. */
export const EXCHANGE_TOKEN_STORAGE_KEY = 'exchange_access_token';

export const SUBSCRIBE_COPY = {
  cta: {
    withPublisher: 'Subscribe to {publisher} for access',
    generic: 'Subscribe for access',
  },
  pricing: {
    title: 'Subscribe to {publisher}',
    titleGeneric: 'Subscribe to Premium Intel',
    bestValue: 'BEST VALUE',
    savings: 'Save ${savings}',
    price: '${price}',
    free: 'Free',
    perMonth: '${pricePerMonth}/month',
    ctaPaid: 'Subscribe for ${price}{period}',
    ctaFree: 'Get Free Access',
    ctaLoading: 'Processing...',
    stripeFooter: 'Secure checkout powered by Stripe. Cancel anytime.',
    noPricingTitle: 'Contact for Pricing',
    noPricingBody: 'Reach out to {publisher} to discuss subscription options.',
    noPricingPublisherFallback: 'this publisher',
    missingPublisherTitle: 'Error',
    missingPublisher: 'Unable to identify publisher. Please refresh and try again.',
  },
  plan: {
    label: 'YOUR PLAN',
    free: 'Free',
    price: '${price}{period}',
    paidNote: "Full access to {publisher}'s intel",
    freeNote: "Access to {publisher}'s free releases",
  },
  email: {
    title: 'Continue with Email',
    subtitle: "We'll send you a verification code",
    label: 'Email Address',
    placeholder: 'you@example.com',
    cta: 'Continue with Email',
    ctaLoading: 'Sending code...',
    footnoteAccount: "We'll create an account for you if you don't have one",
    footnoteMagicLink: 'No password needed - we use secure magic links',
    errorRequired: 'Please enter your email',
    errorSendFailed: 'Failed to send verification code',
  },
  verify: {
    title: 'Enter Verification Code',
    subtitle: 'Check your inbox for {email}',
    label: 'Verification Code',
    ctaPaid: 'Verify & Continue to Payment',
    ctaFree: 'Verify & Get Access',
    loadingPaid: 'Redirecting to checkout...',
    loadingFree: 'Activating access...',
    resendPrompt: "Didn't receive it?",
    resendAction: 'Resend code',
    errorRequired: 'Please enter the verification code',
    errorInvalid: 'Invalid or expired code',
    errorCheckoutFailed: 'Failed to create checkout session',
    errorFreeSubscribeFailed: 'Failed to subscribe to free tier',
  },
  success: {
    title: "You're In!",
    subtitle: "You've joined {publisher}'s free tier",
    subtitleGeneric: "You've joined the free tier",
    body: "Your free subscription is active. You'll get access to free releases as they're published.",
    cta: 'Done',
  },
  chrome: {
    close: 'Close',
    back: 'Go back',
    profileLink: 'View {publisher} profile',
    profileLinkPublisherFallback: 'publisher',
  },
} as const;

/** Fill `{var}` placeholders; a placeholder with no value is left as written. */
export const fmt = (template: string, vars: Record<string, string | number> = {}): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));

/** The CTA that opens the widget, on every host. */
export const subscribeCtaLabel = (publisher?: string | null): string =>
  publisher ? fmt(SUBSCRIBE_COPY.cta.withPublisher, { publisher }) : SUBSCRIBE_COPY.cta.generic;
