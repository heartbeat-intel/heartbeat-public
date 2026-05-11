import { useState, useEffect } from 'react';
import SubscribeModal from './SubscribeModal';

interface ModalState {
  isOpen: boolean;
  publisherId?: string;
  publisherName?: string;
  publisherLogoUrl?: string | null;
  publisherColor?: string;
  monthlyPriceCents?: number;
  yearlyPriceCents?: number;
  billingOptions?: string;
}

interface OpenDetail {
  publisherId: string;
  publisherName: string;
  publisherLogoUrl?: string | null;
  publisherColor: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  billingOptions?: string;
}

export default function SubscribeModalWrapper() {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  useEffect(() => {
    const handleOpen = (event: CustomEvent<OpenDetail>) => {
      setModalState({
        isOpen: true,
        publisherId: event.detail.publisherId,
        publisherName: event.detail.publisherName,
        publisherLogoUrl: event.detail.publisherLogoUrl ?? null,
        publisherColor: event.detail.publisherColor,
        monthlyPriceCents: event.detail.monthlyPriceCents,
        yearlyPriceCents: event.detail.yearlyPriceCents,
        billingOptions: event.detail.billingOptions,
      });
    };

    window.addEventListener('openSubscribeModal', handleOpen as EventListener);
    return () => window.removeEventListener('openSubscribeModal', handleOpen as EventListener);
  }, []);

  const handleClose = () => {
    setModalState({ isOpen: false });
  };

  return (
    <SubscribeModal
      isOpen={modalState.isOpen}
      onClose={handleClose}
      publisherId={modalState.publisherId}
      publisherName={modalState.publisherName}
      publisherLogoUrl={modalState.publisherLogoUrl}
      accentColor={modalState.publisherColor}
      monthlyPriceCents={modalState.monthlyPriceCents}
      yearlyPriceCents={modalState.yearlyPriceCents}
      billingOptions={modalState.billingOptions}
    />
  );
}
