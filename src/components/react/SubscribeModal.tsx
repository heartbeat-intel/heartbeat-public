import { useState } from 'react';
import { Icon } from '@iconify/react';
import { PRICING_TIERS, EXCHANGE_API_URL } from '../../utils/constants';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  expertName?: string;
  accentColor?: string;
  expertId?: string;
}

export default function SubscribeModal({
  isOpen,
  onClose,
  expertName,
  accentColor = '#FB4C02',
  expertId,
}: SubscribeModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!expertId) {
      setError('Expert ID is missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${EXCHANGE_API_URL}/api/v1/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expert_id: expertId,
          plan: selectedTier,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create checkout session');
      }

      const { checkout_url } = await response.json();
      window.location.href = checkout_url;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedTier('yearly');
    setError(null);
    onClose();
  };

  const selectedPricing = PRICING_TIERS.find((t) => t.id === selectedTier);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl mx-4 max-w-lg w-full shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-hb-gray-3 hover:text-hb-black-1 transition-colors"
        >
          <Icon icon="mdi:close" width={24} />
        </button>

        {/* Header */}
        <div className="pt-8 pb-0 text-center px-6">
          <div
            className="inline-flex p-3 rounded-full mb-4"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon icon="mdi:crown" width={28} color={accentColor} />
          </div>
          <h2 className="text-2xl font-bold text-hb-black-1 tracking-tight">
            Subscribe to Premium Intel
          </h2>
          {expertName && (
            <p className="text-[15px] text-hb-gray-2 mt-2">
              Get full access to {expertName}'s curated intelligence
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-6 pt-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Pricing Tiers */}
          <div className="flex gap-4 mb-4">
            {PRICING_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left relative ${
                  selectedTier === tier.id
                    ? 'border-current'
                    : 'border-hb-gray-6 hover:border-current'
                }`}
                style={{
                  borderColor: selectedTier === tier.id ? accentColor : undefined,
                  backgroundColor: selectedTier === tier.id ? `${accentColor}08` : undefined,
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
                  <span className="font-semibold text-hb-black-1">{tier.name}</span>
                  {tier.savings && (
                    <span className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      {tier.savings}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-bold text-hb-black-1">${tier.price}</span>
                  <span className="text-sm text-hb-gray-3">{tier.period}</span>
                </div>
                {tier.id === 'yearly' && (
                  <span className="text-xs text-hb-gray-3">
                    ${tier.pricePerMonth.toFixed(2)}/month
                  </span>
                )}
              </button>
            ))}
          </div>

          <hr className="border-hb-gray-6 mb-4" />

          {/* Features */}
          <div className="space-y-2 mb-4 px-2">
            {selectedPricing?.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Icon icon="mdi:check-circle" width={18} color={accentColor} />
                <span className="text-sm text-hb-gray-1">{feature}</span>
              </div>
            ))}
          </div>

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full py-3 px-6 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70"
            style={{ backgroundColor: accentColor }}
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>Subscribe for ${selectedPricing?.price}{selectedPricing?.period}</span>
                <Icon icon="mdi:arrow-right" width={20} />
              </>
            )}
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1 mt-4 text-hb-gray-3">
            <Icon icon="mdi:lock" width={14} />
            <span className="text-xs">Secure checkout powered by Stripe. Cancel anytime.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
