import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { PRICING_TIERS } from '../../utils/constants';

const API_BASE = import.meta.env.PUBLIC_EXCHANGE_API_URL || '';

type Step = 'pricing' | 'email' | 'verify-code';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  publisherName?: string;
  accentColor?: string;
  publisherId?: string;
}

export default function SubscribeModal({
  isOpen,
  onClose,
  publisherName,
  accentColor = '#FB4C02',
  publisherId,
}: SubscribeModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>('yearly');
  const [step, setStep] = useState<Step>('pricing');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'verify-code' && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [step]);

  const selectedPricing = PRICING_TIERS.find((t) => t.id === selectedTier);

  const handleContinue = () => {
    if (!publisherId) {
      setError('Publisher ID is missing. Please refresh and try again.');
      return;
    }
    setError(null);
    setStep('email');
  };

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!publisherId) {
      setError('Publisher ID is missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/subscribe-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, publisher_id: publisherId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to send verification code');
      }

      const data = await response.json();
      setStep('verify-code');

      if (data.dev_code) {
        setCode(data.dev_code);
        setTimeout(() => handleVerifyCode(data.dev_code), 200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (codeOverride?: string) => {
    const verifyCode = codeOverride || code;
    if (!verifyCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/subscribe-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verifyCode }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Invalid or expired code');
      }

      const { access_token } = await response.json();
      localStorage.setItem('exchange_access_token', access_token);

      const checkoutResponse = await fetch(`${API_BASE}/api/v1/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          publisher_id: publisherId,
          price_type: selectedTier,
        }),
      });

      if (!checkoutResponse.ok) {
        const err = await checkoutResponse.json();
        throw new Error(err.detail || 'Failed to create checkout session');
      }

      const { checkout_url } = await checkoutResponse.json();
      window.location.href = checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === 'verify-code') {
      setCode('');
      setStep('email');
    } else if (step === 'email') {
      setStep('pricing');
    }
  };

  const handleClose = () => {
    setStep('pricing');
    setEmail('');
    setCode('');
    setError(null);
    setSelectedTier('yearly');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-hb-black-2 rounded-2xl mx-4 max-w-lg w-full shadow-xl border border-white/10">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <Icon icon="mdi:close" width={24} />
        </button>

        {/* Back button */}
        {step !== 'pricing' && (
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 text-white/30 hover:text-white transition-colors"
          >
            <Icon icon="mdi:arrow-left" width={24} />
          </button>
        )}

        {/* Header */}
        <div className="pt-8 pb-0 text-center px-6">
          <div
            className="inline-flex p-3 rounded-full mb-4"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon
              icon={step === 'email' ? 'mdi:email-outline' : step === 'verify-code' ? 'mdi:shield-check-outline' : 'mdi:crown'}
              width={28}
              color={accentColor}
            />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {step === 'email' ? 'Continue with Email' : step === 'verify-code' ? 'Enter Verification Code' : 'Subscribe to Premium Intel'}
          </h2>
          <p className="text-[15px] text-white/40 mt-2">
            {step === 'email'
              ? "We'll send you a verification code"
              : step === 'verify-code'
                ? `Check your inbox for ${email}`
                : publisherName
                  ? `Get full access to ${publisherName}'s curated intelligence`
                  : ''}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 pt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/15 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* PRICING STEP */}
          {step === 'pricing' && (
            <>
              <div className="flex gap-4 mb-4">
                {PRICING_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all text-left relative ${
                      selectedTier === tier.id ? 'border-current' : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      borderColor: selectedTier === tier.id ? accentColor : undefined,
                      backgroundColor: selectedTier === tier.id ? `${accentColor}10` : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {tier.popular && (
                      <span
                        className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-semibold text-white rounded-full"
                        style={{ backgroundColor: accentColor }}
                      >
                        BEST VALUE
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{tier.name}</span>
                      {tier.savings && (
                        <span className="text-[10px] font-medium bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full">
                          {tier.savings}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[28px] font-bold text-white">${tier.price}</span>
                      <span className="text-sm text-white/30">{tier.period}</span>
                    </div>
                    {tier.id === 'yearly' && (
                      <span className="text-xs text-white/30">${tier.pricePerMonth.toFixed(2)}/month</span>
                    )}
                  </button>
                ))}
              </div>

              <hr className="border-white/10 mb-4" />

              <div className="space-y-2 mb-4 px-2">
                {selectedPricing?.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Icon icon="mdi:check-circle" width={18} color={accentColor} />
                    <span className="text-sm text-white/60">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-3 px-6 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                Subscribe for ${selectedPricing?.price}{selectedPricing?.period}
                <Icon icon="mdi:arrow-right" width={20} />
              </button>

              <div className="flex items-center justify-center gap-1 mt-4 text-white/20">
                <Icon icon="mdi:lock" width={14} />
                <span className="text-xs">Secure checkout powered by Stripe. Cancel anytime.</span>
              </div>
            </>
          )}

          {/* EMAIL STEP */}
          {step === 'email' && (
            <>
              {selectedPricing && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-white/60">{selectedPricing.name} plan</span>
                  <span className="text-sm font-semibold text-white">${selectedPricing.price}{selectedPricing.period}</span>
                </div>
              )}

              <label className="block text-sm text-white/60 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                placeholder="you@example.com"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                autoFocus
              />

              <button
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full mt-4 py-3 px-6 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{ backgroundColor: accentColor }}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
                {!isLoading && <Icon icon="mdi:arrow-right" width={20} />}
              </button>
            </>
          )}

          {/* VERIFY CODE STEP */}
          {step === 'verify-code' && (
            <>
              {selectedPricing && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-white/60">{selectedPricing.name} plan</span>
                  <span className="text-sm font-semibold text-white">${selectedPricing.price}{selectedPricing.period}</span>
                </div>
              )}

              <label className="block text-sm text-white/60 mb-2">Verification Code</label>
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/20 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-white/30"
              />

              <button
                onClick={() => handleVerifyCode()}
                disabled={isLoading}
                className="w-full mt-4 py-3 px-6 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{ backgroundColor: accentColor }}
              >
                {isLoading ? 'Verifying...' : 'Verify & Subscribe'}
                {!isLoading && <Icon icon="mdi:arrow-right" width={20} />}
              </button>

              <button
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full mt-2 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Resend code
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
