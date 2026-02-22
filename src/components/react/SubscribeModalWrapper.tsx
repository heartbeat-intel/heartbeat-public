import { useState, useEffect } from 'react';
import SubscribeModal from './SubscribeModal';

interface ModalState {
  isOpen: boolean;
  publisherId?: string;
  publisherName?: string;
  publisherColor?: string;
}

export default function SubscribeModalWrapper() {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  useEffect(() => {
    const handleOpen = (event: CustomEvent<{ publisherId: string; publisherName: string; publisherColor: string }>) => {
      setModalState({
        isOpen: true,
        publisherId: event.detail.publisherId,
        publisherName: event.detail.publisherName,
        publisherColor: event.detail.publisherColor,
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
      accentColor={modalState.publisherColor}
    />
  );
}
