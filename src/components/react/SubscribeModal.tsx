import { useState, useRef, useEffect, useMemo } from 'react';
import type {
  ClipboardEvent as ReactClipboardEvent,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Icon } from '@iconify/react';

import type { PricingTier } from '../../utils/constants';
import {
  DEFAULT_FREE_VALUE_PROPS,
  DEFAULT_PAID_VALUE_PROPS,
  resolveValueProps,
} from '../../utils/valueProps';
import type { ValueProps } from '../../utils/valueProps';
import {
  DEFAULT_TIER,
  DEV_CODE_AUTOVERIFY_DELAY_MS,
  EXCHANGE_TOKEN_STORAGE_KEY,
  OTP_AUTOSUBMIT_DELAY_MS,
  OTP_LENGTH,
  SUBSCRIBE_COPY,
  TIER_NAMES,
  TIER_ORDER,
  TIER_PERIODS,
  fmt,
  stepLabels,
} from '../../utils/subscribeModalCopy';
import type { TierId } from '../../utils/subscribeModalCopy';

const API_BASE = import.meta.env.PUBLIC_EXCHANGE_API_URL || '';

// The Exchange implementation of the subscribe widget. heartbeat-web's
// SubscribeModal (Chakra) is the spec: same steps, same test ids, same copy
// module, same timers — only the styling follows this host's theme.
// pricing → email → verify-code → Stripe checkout (paid) or success (free)
type ModalStep = 'pricing' | 'email' | 'verify-code' | 'success';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  publisherName?: string;
  publisherLogoUrl?: string | null;
  accentColor?: string;
  publisherId?: string;
  monthlyPriceCents?: number;
  yearlyPriceCents?: number;
  billingOptions?: string; // "both" | "monthly_only" | "yearly_only"
  freeTierEnabled?: boolean;
  /** Publisher-authored bullets; null/absent falls back to the defaults. */
  valueProps?: ValueProps;
}

const TITLE_ID = 'subscribe-modal-title';
const OTP_LABEL_ID = 'subscribe-modal-otp-label';
const EMAIL_INPUT_ID = 'subscribe-modal-email';

const PRIMARY_BUTTON_CLASS =
  'w-full py-3 px-6 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed';

/** "$29/month", or "Free" for the free tier — never "$0". */
const planPriceLabel = (tier: PricingTier | undefined) => {
  if (!tier) return '';
  return tier.id === 'free'
    ? SUBSCRIBE_COPY.plan.free
    : fmt(SUBSCRIBE_COPY.plan.price, { price: tier.price, period: tier.period });
};

// Step indicator component
const StepIndicator = ({
  currentStep,
  selectedTier,
  accentColor,
}: {
  currentStep: ModalStep;
  selectedTier: TierId | '';
  accentColor: string;
}) => {
  const steps = stepLabels(selectedTier);
  const stepNumber = currentStep === 'pricing' ? 1 : currentStep === 'email' || currentStep === 'verify-code' ? 2 : 3;

  return (
    <div className="flex items-center justify-center gap-2 mb-4" data-testid="step-indicator">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === stepNumber;
        const isCompleted = stepNum < stepNumber;
        const isLit = isActive || isCompleted;

        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                isLit ? 'text-white' : 'bg-white/10 text-white/40'
              }`}
              style={isLit ? { backgroundColor: accentColor } : undefined}
              data-testid={isActive ? `step-${stepNum}-active` : isCompleted ? `step-${stepNum}-completed` : `step-${stepNum}`}
            >
              {isCompleted ? <Icon icon="mdi:check" width={14} /> : stepNum}
            </div>
            <span className={`text-xs ${isLit ? 'text-white' : 'text-white/40'} ${isActive ? 'font-semibold' : 'font-normal'}`}>
              {label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 w-6 ${isCompleted ? '' : 'bg-white/10'}`}
                style={isCompleted ? { backgroundColor: accentColor } : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Plan summary component
const PlanSummary = ({
  selectedPricing,
  publisherName,
}: {
  selectedPricing: PricingTier | undefined;
  publisherName?: string;
}) => (
  <div className="p-4 bg-white/5 rounded-xl border border-white/10" data-testid="plan-summary">
    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">{SUBSCRIBE_COPY.plan.label}</p>
    <div className="flex items-center justify-between">
      <span className="font-semibold text-white">{selectedPricing?.name}</span>
      <span className="font-semibold text-white">{planPriceLabel(selectedPricing)}</span>
    </div>
    {publisherName && (
      <p className="text-[13px] text-white/60 mt-1">
        {fmt(selectedPricing?.id === 'free' ? SUBSCRIBE_COPY.plan.freeNote : SUBSCRIBE_COPY.plan.paidNote, {
          publisher: publisherName,
        })}
      </p>
    )}
  </div>
);

const toChars = (value: string): string[] => Array.from({ length: OTP_LENGTH }, (_, idx) => value[idx] ?? '');

// Six one-digit boxes standing in for Chakra's PinInput: auto-advance,
// Backspace back to the previous box, a pasted code spread across the boxes,
// and onComplete once every box holds a digit.
const OtpInput = ({
  value,
  onChange,
  onComplete,
  isInvalid,
  accentColor,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  isInvalid: boolean;
  accentColor: string;
  disabled?: boolean;
}) => {
  const [chars, setChars] = useState<string[]>(() => toChars(value));
  const boxRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Follow the parent only when it holds something else — a reset to '' on
  // back / resend, or the dev-mode autofill. Local edits already round-tripped
  // through onChange, and re-deriving them would collapse a gap (a digit in
  // box 2 with box 1 still empty) onto box 1.
  useEffect(() => {
    setChars((prev) => (prev.join('') === value ? prev : toChars(value)));
  }, [value]);

  const focusBox = (idx: number) => {
    boxRefs.current[Math.max(0, Math.min(OTP_LENGTH - 1, idx))]?.focus();
  };

  const commit = (next: string[]) => {
    setChars(next);
    const joined = next.join('');
    onChange(joined);
    if (next.every((char) => char !== '')) onComplete(joined);
  };

  /** Write `digits` from `start` on, then move to the box after the last one written. */
  const fill = (start: number, digits: string) => {
    const next = [...chars];
    let cursor = start;
    for (const digit of digits) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = digit;
      cursor += 1;
    }
    commit(next);
    focusBox(cursor);
  };

  const handleInput = (idx: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      const next = [...chars];
      next[idx] = '';
      commit(next);
      return;
    }
    fill(idx, digits);
  };

  const handlePaste = (idx: number, event: ReactClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData.getData('text/plain').replace(/\D/g, '');
    if (!digits) return;
    event.preventDefault();
    // A whole code pasted into any box fills from the first one.
    fill(digits.length >= OTP_LENGTH ? 0 : idx, digits.slice(0, OTP_LENGTH));
  };

  const handleKeyDown = (idx: number, event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && chars[idx] === '' && idx > 0) {
      event.preventDefault();
      const next = [...chars];
      next[idx - 1] = '';
      commit(next);
      focusBox(idx - 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(idx - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusBox(idx + 1);
    }
  };

  return (
    <div role="group" aria-labelledby={OTP_LABEL_ID} className="flex justify-center gap-2">
      {chars.map((char, idx) => (
        <input
          key={idx}
          ref={(el) => {
            boxRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          autoFocus={idx === 0}
          value={char}
          disabled={disabled}
          onChange={(e) => handleInput(idx, e.target.value)}
          onPaste={(e) => handlePaste(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          data-testid={`code-input-${idx + 1}`}
          className={`h-14 w-12 rounded-xl border bg-white/5 text-center text-2xl font-semibold text-white focus:outline-none focus:border-[color:var(--accent)] ${
            isInvalid ? 'border-red-500' : 'border-white/10'
          }`}
          style={{ '--accent': accentColor } as CSSProperties}
        />
      ))}
    </div>
  );
};

export default function SubscribeModal({
  isOpen,
  onClose,
  publisherName,
  publisherLogoUrl,
  accentColor = '#FB4C02',
  publisherId,
  monthlyPriceCents,
  yearlyPriceCents,
  billingOptions = 'both',
  freeTierEnabled = false,
  valueProps,
}: SubscribeModalProps) {
  const [selectedTier, setSelectedTier] = useState<TierId | ''>('');
  const [step, setStep] = useState<ModalStep>('pricing');
  const [email, setEmail] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // The OTP auto-submit and the verify button can both fire for one code;
  // this makes that one checkout session, not two.
  const verifyInFlight = useRef(false);

  // Generate dynamic pricing tiers based on publisher data and billing_options
  const pricingTiers = useMemo(() => {
    const tiers: Partial<Record<TierId, PricingTier>> = {};
    // Monthly and yearly share one publisher-authored list. That drops
    // "Cancel anytime" from the monthly card, which is fine: the Stripe footer
    // below says it, and it renders for every paid tier.
    const paidFeatures = resolveValueProps(valueProps?.paid, DEFAULT_PAID_VALUE_PROPS);
    const freeFeatures = resolveValueProps(valueProps?.free, DEFAULT_FREE_VALUE_PROPS);

    if (monthlyPriceCents && billingOptions !== 'yearly_only') {
      tiers.monthly = {
        id: 'monthly',
        name: TIER_NAMES.monthly,
        price: monthlyPriceCents / 100,
        period: TIER_PERIODS.monthly,
        pricePerMonth: monthlyPriceCents / 100,
        features: paidFeatures,
      };
    }

    if (yearlyPriceCents && billingOptions !== 'monthly_only') {
      const yearlyPrice = yearlyPriceCents / 100;
      const monthlyEquiv = yearlyPrice / 12;
      const monthlyPrice = monthlyPriceCents ? monthlyPriceCents / 100 : 29;
      const savings = monthlyPrice * 12 - yearlyPrice;

      tiers.yearly = {
        id: 'yearly',
        name: TIER_NAMES.yearly,
        price: yearlyPrice,
        period: TIER_PERIODS.yearly,
        pricePerMonth: monthlyEquiv,
        popular: true,
        savings: savings > 0 ? fmt(SUBSCRIBE_COPY.pricing.savings, { savings: Math.round(savings) }) : undefined,
        features: paidFeatures,
      };
    }

    if (freeTierEnabled) {
      tiers.free = {
        id: 'free',
        name: TIER_NAMES.free,
        price: 0,
        period: TIER_PERIODS.free,
        pricePerMonth: 0,
        features: freeFeatures,
      };
    }

    // Card order is the shared contract, not insertion order. May be empty
    // when no pricing is configured.
    return TIER_ORDER.map((id) => tiers[id]).filter((tier): tier is PricingTier => tier !== undefined);
  }, [monthlyPriceCents, yearlyPriceCents, billingOptions, freeTierEnabled, valueProps]);

  // Default to monthly: every publisher sells it and it is the smallest
  // commitment. Yearly stays selectable wherever the publisher offers it.
  useEffect(() => {
    if (pricingTiers.length > 0 && !selectedTier) {
      const hasDefault = pricingTiers.some((t) => t.id === DEFAULT_TIER);
      setSelectedTier(hasDefault ? DEFAULT_TIER : pricingTiers[0].id);
    }
  }, [pricingTiers, selectedTier]);

  const selectedPricing = pricingTiers.find((t) => t.id === selectedTier);

  const handleClose = () => {
    setStep('pricing');
    setEmail('');
    setLoginCode('');
    setFormError(null);
    setSelectedTier(''); // Will be reset by useEffect based on available tiers
    setIsLoading(false);
    verifyInFlight.current = false;
    onClose();
  };

  // Escape closes, as the tenant's Chakra modal does (same shape as SignInModal).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const createCheckout = async (accessToken: string) => {
    // No return_url: Exchange already returns to the tenant's checkout pages.
    const response = await fetch(`${API_BASE}/api/v1/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        publisher_id: publisherId,
        price_type: selectedTier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || SUBSCRIBE_COPY.verify.errorCheckoutFailed);
    }

    const { checkout_url } = await response.json();
    window.location.href = checkout_url;
  };

  const createFreeSubscription = async (accessToken: string) => {
    const response = await fetch(`${API_BASE}/api/v1/payments/free-subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ publisher_id: publisherId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || SUBSCRIBE_COPY.verify.errorFreeSubscribeFailed);
    }
  };

  const handleContinue = () => {
    if (!publisherId) {
      setFormError(SUBSCRIBE_COPY.pricing.missingPublisher);
      return;
    }
    setFormError(null);
    setStep('email');
  };

  const handleSendCode = async () => {
    if (!email) {
      setFormError(SUBSCRIBE_COPY.email.errorRequired);
      return;
    }

    if (!publisherId) {
      setFormError(SUBSCRIBE_COPY.pricing.missingPublisher);
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/subscribe-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, publisher_id: publisherId, tier: selectedTier }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || SUBSCRIBE_COPY.email.errorSendFailed);
      }

      const data: { is_new_user?: boolean; email?: string; dev_code?: string } = await response.json();

      setStep('verify-code');

      // Dev mode: auto-fill and auto-submit the code
      if (data.dev_code) {
        setLoginCode(data.dev_code);
        setTimeout(() => handleVerifyCode(data.dev_code), DEV_CODE_AUTOVERIFY_DELAY_MS);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : SUBSCRIBE_COPY.email.errorSendFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (codeOverride?: string) => {
    const code = codeOverride || loginCode;
    if (!code) {
      setFormError(SUBSCRIBE_COPY.verify.errorRequired);
      return;
    }
    if (verifyInFlight.current) return;
    verifyInFlight.current = true;

    setIsLoading(true);
    setFormError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/subscribe-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || SUBSCRIBE_COPY.verify.errorInvalid);
      }

      const { access_token } = await response.json();

      // The Exchange JWT bridges to Stripe checkout and to the post-signup
      // pages on both paths (DarkHeader reads it to show the account chip),
      // so it is stored before the tier decides what happens next.
      localStorage.setItem(EXCHANGE_TOKEN_STORAGE_KEY, access_token);

      if (selectedTier === 'free') {
        // Free tier: create subscription directly, no Stripe
        await createFreeSubscription(access_token);
        setStep('success');
        setIsLoading(false);
        verifyInFlight.current = false;
      } else {
        // Paid tier: redirect to Stripe checkout. Stay locked and loading —
        // the page is about to unload.
        await createCheckout(access_token);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : SUBSCRIBE_COPY.verify.errorInvalid);
      setIsLoading(false);
      verifyInFlight.current = false;
    }
  };

  const handleBack = () => {
    setFormError(null);
    if (step === 'verify-code') {
      setLoginCode('');
      setStep('email');
    } else if (step === 'email') {
      setStep('pricing');
    }
    // No back from success
  };

  // Handle OTP input change
  const handleCodeChange = (value: string) => {
    setLoginCode(value);
    setFormError(null);
  };

  // Handle OTP complete (auto-submit)
  const handleCodeComplete = (value: string) => {
    setLoginCode(value);
    // Auto-submit when all digits entered
    if (value.length === OTP_LENGTH) {
      // Delay slightly for UI feedback, pass value directly to avoid stale state
      setTimeout(() => {
        handleVerifyCode(value);
      }, OTP_AUTOSUBMIT_DELAY_MS);
    }
  };

  const renderHeaderIcon = (icon: string) => (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full"
      style={{ backgroundColor: `${accentColor}15` }}
    >
      <Icon icon={icon} width={28} color={accentColor} />
    </div>
  );

  // Render header based on current step
  const renderHeader = () => {
    const titleClass = 'text-2xl font-bold text-white tracking-tight';
    const subtitleClass = 'text-[15px] text-white/40';

    switch (step) {
      case 'success':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
              <Icon icon="mdi:check-circle" width={28} className="text-green-400" />
            </div>
            <h2 id={TITLE_ID} className={titleClass}>{SUBSCRIBE_COPY.success.title}</h2>
            <p className={subtitleClass}>
              {publisherName
                ? fmt(SUBSCRIBE_COPY.success.subtitle, { publisher: publisherName })
                : SUBSCRIBE_COPY.success.subtitleGeneric}
            </p>
          </div>
        );
      case 'email':
        return (
          <div className="flex flex-col items-center gap-3">
            {renderHeaderIcon('mdi:email-outline')}
            <h2 id={TITLE_ID} className={titleClass}>{SUBSCRIBE_COPY.email.title}</h2>
            <p className={subtitleClass}>{SUBSCRIBE_COPY.email.subtitle}</p>
          </div>
        );
      case 'verify-code':
        return (
          <div className="flex flex-col items-center gap-3">
            {renderHeaderIcon('mdi:shield-check-outline')}
            <h2 id={TITLE_ID} className={titleClass}>{SUBSCRIBE_COPY.verify.title}</h2>
            <p className={subtitleClass}>{fmt(SUBSCRIBE_COPY.verify.subtitle, { email })}</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
              style={{ backgroundColor: `${accentColor}15` }}
              data-testid="publisher-avatar"
            >
              {publisherLogoUrl ? (
                <img src={publisherLogoUrl} alt={publisherName || ''} className="h-full w-full rounded-full object-cover" />
              ) : (
                <Icon icon="mdi:crown" width={28} color={accentColor} />
              )}
            </div>
            {/* No subtitle under the title: the cards below say what is on offer. */}
            <h2 id={TITLE_ID} className={titleClass}>
              {publisherName ? fmt(SUBSCRIBE_COPY.pricing.title, { publisher: publisherName }) : SUBSCRIBE_COPY.pricing.titleGeneric}
            </h2>
          </div>
        );
    }
  };

  // Render pricing step
  const renderPricingStep = () => {
    // If no pricing configured, show contact message
    if (pricingTiers.length === 0) {
      return (
        <div data-testid="no-pricing-step">
          <div className="p-6 bg-white/5 rounded-xl text-center">
            <Icon icon="mdi:email-outline" width={32} className="mx-auto text-white/40" />
            <p className="text-base font-semibold text-white mt-3">{SUBSCRIBE_COPY.pricing.noPricingTitle}</p>
            <p className="text-sm text-white/40 mt-2">
              {fmt(SUBSCRIBE_COPY.pricing.noPricingBody, {
                publisher: publisherName || SUBSCRIBE_COPY.pricing.noPricingPublisherFallback,
              })}
            </p>
          </div>
        </div>
      );
    }

    const continueLabel =
      selectedTier === 'free'
        ? SUBSCRIBE_COPY.pricing.ctaFree
        : selectedPricing
          ? fmt(SUBSCRIBE_COPY.pricing.ctaPaid, { price: selectedPricing.price, period: selectedPricing.period })
          : '';

    return (
      <div className="space-y-4" data-testid="pricing-step">
        {formError && (
          <div role="alert" className="p-3 bg-red-500/15 text-red-400 rounded-lg text-sm" data-testid="error-message">
            {formError}
          </div>
        )}

        {/* Pricing Tiers */}
        <div className="flex gap-4">
          {pricingTiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left relative ${
                  isSelected ? 'border-current' : 'border-white/10 hover:border-white/20'
                }`}
                style={{
                  borderColor: isSelected ? accentColor : undefined,
                  backgroundColor: isSelected ? `${accentColor}10` : 'rgba(255,255,255,0.03)',
                }}
                data-testid={`tier-${tier.id}`}
              >
                {tier.popular && (
                  <span
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-semibold text-white rounded-full whitespace-nowrap"
                    style={{ backgroundColor: accentColor }}
                  >
                    {SUBSCRIBE_COPY.pricing.bestValue}
                  </span>
                )}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold text-white">{tier.name}</span>
                  {tier.savings && (
                    <span className="text-[10px] font-medium bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {tier.savings}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  {/* The free tier reads "Free", not "$0" — a price of zero
                      rendered as currency looks like a bug on a plan card. */}
                  <span className="text-[28px] font-bold text-white">
                    {tier.id === 'free' ? SUBSCRIBE_COPY.pricing.free : fmt(SUBSCRIBE_COPY.pricing.price, { price: tier.price })}
                  </span>
                  <span className="text-sm text-white/30">{tier.period}</span>
                </div>
                {tier.id === 'yearly' && (
                  <span className="text-xs text-white/30">
                    {fmt(SUBSCRIBE_COPY.pricing.perMonth, { pricePerMonth: tier.pricePerMonth.toFixed(2) })}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <hr className="border-white/10" />

        {/* Features List */}
        <div className="space-y-2 px-2">
          {selectedPricing?.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Icon icon="mdi:check-circle" width={18} color={accentColor} />
              <span className="text-sm text-white/60">{feature}</span>
            </div>
          ))}
        </div>

        {/* Subscribe Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={isLoading}
          className={PRIMARY_BUTTON_CLASS}
          style={{ backgroundColor: accentColor }}
          data-testid="continue-button"
        >
          {isLoading ? SUBSCRIBE_COPY.pricing.ctaLoading : continueLabel}
          {!isLoading && <Icon icon="mdi:arrow-right" width={20} />}
        </button>

        {selectedTier !== 'free' && (
          <div className="flex items-center justify-center gap-1 text-white/30">
            <Icon icon="mdi:lock" width={14} />
            <span className="text-xs">{SUBSCRIBE_COPY.pricing.stripeFooter}</span>
          </div>
        )}
      </div>
    );
  };

  // Render email step (simplified - works for both new and existing users)
  const renderEmailStep = () => (
    <div className="space-y-4" data-testid="email-step">
      <PlanSummary selectedPricing={selectedPricing} publisherName={publisherName} />

      <div>
        <label htmlFor={EMAIL_INPUT_ID} className="block text-sm text-white/60 mb-2">
          {SUBSCRIBE_COPY.email.label}
        </label>
        <input
          id={EMAIL_INPUT_ID}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) handleSendCode();
          }}
          placeholder={SUBSCRIBE_COPY.email.placeholder}
          className={`w-full p-3 bg-white/5 border rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 ${
            formError ? 'border-red-500' : 'border-white/10'
          }`}
          data-testid="email-input"
          autoFocus
        />
        {formError && (
          <p className="mt-2 text-sm text-red-400" data-testid="error-message">
            {formError}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleSendCode}
        disabled={isLoading}
        className={PRIMARY_BUTTON_CLASS}
        style={{ backgroundColor: accentColor }}
        data-testid="continue-email"
      >
        {isLoading ? SUBSCRIBE_COPY.email.ctaLoading : SUBSCRIBE_COPY.email.cta}
        {!isLoading && <Icon icon="mdi:arrow-right" width={20} />}
      </button>

      <p className="text-xs text-white/40 text-center">{SUBSCRIBE_COPY.email.footnoteAccount}</p>

      <div className="flex items-center justify-center gap-1 text-white/40">
        <Icon icon="mdi:lock" width={14} />
        <span className="text-xs">{SUBSCRIBE_COPY.email.footnoteMagicLink}</span>
      </div>
    </div>
  );

  // Render verify code step with 6-box OTP input
  const renderVerifyCodeStep = () => (
    <div className="space-y-4" data-testid="verify-step">
      <PlanSummary selectedPricing={selectedPricing} publisherName={publisherName} />

      <div>
        <p id={OTP_LABEL_ID} className="block text-sm text-white/60 mb-2 text-center">
          {SUBSCRIBE_COPY.verify.label}
        </p>
        <OtpInput
          value={loginCode}
          onChange={handleCodeChange}
          onComplete={handleCodeComplete}
          isInvalid={!!formError}
          accentColor={accentColor}
          disabled={isLoading}
        />
        {formError && (
          <p className="mt-2 text-sm text-red-400 text-center" data-testid="verify-error-message">
            {formError}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => handleVerifyCode()}
        disabled={isLoading || loginCode.length !== OTP_LENGTH}
        className={PRIMARY_BUTTON_CLASS}
        style={{ backgroundColor: accentColor }}
        data-testid="verify-button"
      >
        {isLoading
          ? selectedTier === 'free'
            ? SUBSCRIBE_COPY.verify.loadingFree
            : SUBSCRIBE_COPY.verify.loadingPaid
          : selectedTier === 'free'
            ? SUBSCRIBE_COPY.verify.ctaFree
            : SUBSCRIBE_COPY.verify.ctaPaid}
        {!isLoading && <Icon icon="mdi:arrow-right" width={20} />}
      </button>

      <p className="text-sm text-white/60 text-center">
        {SUBSCRIBE_COPY.verify.resendPrompt}{' '}
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setLoginCode('');
            handleSendCode();
          }}
          disabled={isLoading}
          className="font-semibold hover:underline disabled:opacity-70"
          style={{ color: accentColor }}
        >
          {SUBSCRIBE_COPY.verify.resendAction}
        </button>
      </p>
    </div>
  );

  // Render success step for free tier signup
  const renderSuccessStep = () => (
    <div className="space-y-5 text-center" data-testid="success-step">
      <div className="p-5 bg-green-500/10 rounded-xl border border-green-500/20">
        <p className="text-[15px] text-green-400 font-medium">{SUBSCRIBE_COPY.success.body}</p>
      </div>
      <button
        type="button"
        onClick={handleClose}
        className={PRIMARY_BUTTON_CLASS}
        style={{ backgroundColor: accentColor }}
        data-testid="success-close-button"
      >
        {SUBSCRIBE_COPY.success.cta}
      </button>
    </div>
  );

  // Render body content based on step
  const renderBody = () => {
    switch (step) {
      case 'success':
        return renderSuccessStep();
      case 'email':
        return renderEmailStep();
      case 'verify-code':
        return renderVerifyCodeStep();
      default:
        return renderPricingStep();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        className="relative bg-hb-black-2 rounded-2xl mx-4 max-w-lg w-full shadow-xl border border-white/10"
        data-testid="subscribe-modal"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label={SUBSCRIBE_COPY.chrome.close}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <Icon icon="mdi:close" width={24} />
        </button>

        {/* Back button */}
        {step !== 'pricing' && step !== 'success' && (
          <button
            type="button"
            onClick={handleBack}
            aria-label={SUBSCRIBE_COPY.chrome.back}
            className="absolute top-4 left-4 text-white/30 hover:text-white transition-colors"
            data-testid="back-button"
          >
            <Icon icon="mdi:arrow-left" width={24} />
          </button>
        )}

        {/* Header */}
        <div className="pt-8 px-6 text-center">
          {step !== 'success' && <StepIndicator currentStep={step} selectedTier={selectedTier} accentColor={accentColor} />}
          {renderHeader()}
        </div>

        {/* Body */}
        <div className="p-6">{renderBody()}</div>
      </div>
    </div>
  );
}
