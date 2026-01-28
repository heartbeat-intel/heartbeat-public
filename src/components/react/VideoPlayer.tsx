import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface VideoPlayerProps {
  videoId?: string;
}

export default function VideoPlayer({ videoId = 'Ym9tZDJoFYI' }: VideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openVideo = () => {
    setIsOpen(true);
    // Request fullscreen
    document.documentElement.requestFullscreen?.();
  };

  const closeVideo = () => {
    setIsOpen(false);
    // Exit fullscreen
    document.exitFullscreen?.();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeVideo();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isOpen]);

  return (
    <>
      {/* Watch Demo Button - rendered inline where the component is placed */}
      <button
        onClick={openVideo}
        className="flex items-center gap-2 px-4 py-2 text-sm text-hb-gray-1 hover:text-hb-black-1 hover:bg-hb-gray-7 rounded-lg transition-colors"
      >
        <Icon icon="octicon:play-24" width={16} />
        Watch Demo
      </button>

      {/* Fullscreen Video Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <button
            onClick={closeVideo}
            className="absolute top-4 right-4 z-10 text-white hover:text-hb-gray-4 transition-colors"
          >
            <Icon icon="mdi:close" width={32} />
          </button>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
            title="Promo video"
          />
        </div>
      )}
    </>
  );
}
