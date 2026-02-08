import { useEffect } from 'react';
import { Icon } from './Icon';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

export function VideoModal({ isOpen, onClose, videoSrc }: VideoModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      {/* Modal Content */}
      <div 
        className="relative z-10 w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close video"
        >
          <Icon name="close" className="text-white" />
        </button>
        
        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          <video
            src={videoSrc}
            controls
            autoPlay
            className="w-full h-full"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Video Title */}
        <div className="p-4 bg-slate-900">
          <h3 className="text-white font-semibold text-lg">Shohoj Hishab - Promotional Video</h3>
          <p className="text-slate-400 text-sm mt-1">সহজ হিসাব - ব্যবসার বিশ্বস্ত সঙ্গী</p>
        </div>
      </div>
    </div>
  );
}