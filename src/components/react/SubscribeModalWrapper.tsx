import { useState, useEffect } from 'react';
import SubscribeModal from './SubscribeModal';

interface ModalState {
  isOpen: boolean;
  expertId?: string;
  expertName?: string;
  expertColor?: string;
}

export default function SubscribeModalWrapper() {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  useEffect(() => {
    const handleOpen = (event: CustomEvent<{ expertId: string; expertName: string; expertColor: string }>) => {
      setModalState({
        isOpen: true,
        expertId: event.detail.expertId,
        expertName: event.detail.expertName,
        expertColor: event.detail.expertColor,
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
      expertId={modalState.expertId}
      expertName={modalState.expertName}
      accentColor={modalState.expertColor}
    />
  );
}
