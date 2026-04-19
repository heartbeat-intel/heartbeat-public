import { useState } from 'react';
import SubscribeModal from './SubscribeModal';

interface SubscribeButtonWithModalProps {
  publisherId?: string;
  publisherName?: string;
  publisherColor?: string;
  monthlyPriceCents?: number;
  yearlyPriceCents?: number;
  label?: string;
  className?: string;
  showArrow?: boolean;
  testId?: string;
}

export default function SubscribeButtonWithModal({
  publisherId,
  publisherName,
  publisherColor = '#FB4C02',
  monthlyPriceCents,
  yearlyPriceCents,
  label = 'Subscribe to Intel',
  className = 'w-full py-2.5 px-4 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90',
  showArrow = true,
  testId = 'subscribe-button',
}: SubscribeButtonWithModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-testid={testId}
        className={className}
        style={{ backgroundColor: publisherColor }}
        onClick={() => setIsOpen(true)}
      >
        {label}
        {showArrow && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      <SubscribeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        publisherId={publisherId}
        publisherName={publisherName}
        accentColor={publisherColor}
        monthlyPriceCents={monthlyPriceCents}
        yearlyPriceCents={yearlyPriceCents}
      />
    </>
  );
}
