
import React, { useEffect } from 'react';
import XCircleIcon from './icons/XCircleIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, imageUrl }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="relative max-w-full max-h-full" 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 sm:-top-5 sm:-right-12 text-white/70 hover:text-white transition-colors"
          title="关闭"
        >
          <XCircleIcon className="w-10 h-10" />
        </button>
        <img src={imageUrl} alt="Enlarged view" className="block max-w-[90vw] max-h-[90vh] object-contain" />
      </div>
    </div>
  );
};

export default Modal;
