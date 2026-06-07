import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PreviewModeProps {
  onClose: () => void;
  initialIndex?: number;
}

export function PreviewMode({ onClose, initialIndex = 0 }: PreviewModeProps) {
  const { shots, globalFontFamily, globalTextColor, globalFontSize } = useStore();
  const validShots = shots;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(prev + 1, validShots.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, validShots.length]);

  if (shots.length === 0) return null;

  const currentShot = validShots[currentIndex];
  // Strip HTML from description for preview
  const descriptionText = currentShot.description.replace(/<[^>]*>?/gm, ' ').trim();

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col justify-center items-center">
      {/* Top Bar Navigation */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full transition-all z-50"
      >
        <X size={24} />
      </button>

      {/* Shot Number Indicator */}
      <div className="absolute top-6 left-6 text-white/40 text-sm font-mono tracking-widest z-50">
        [{currentIndex + 1} / {validShots.length}]
      </div>

      {/* Image Area */}
      <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden group">
        
        {/* Navigation Buttons */}
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
          className={`absolute left-4 p-4 text-white/30 hover:text-white transition-colors z-50 ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronLeft size={48} />
        </button>

        <button 
          onClick={() => setCurrentIndex(prev => Math.min(prev + 1, validShots.length - 1))}
          className={`absolute right-4 p-4 text-white/30 hover:text-white transition-colors z-50 ${currentIndex === validShots.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronRight size={48} />
        </button>

        {currentShot.image ? (
          <img 
            src={currentShot.image} 
            alt={`Shot ${currentIndex + 1}`} 
            className="w-full h-full object-contain pointer-events-none" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 uppercase tracking-widest text-xl">
            No Image
          </div>
        )}
      </div>

      {/* Description Area */}
      {descriptionText && (
        <div className="absolute bottom-12 left-0 right-0 flex justify-center z-50 px-12 pointer-events-none">
          <div 
            className="max-w-3xl text-center bg-black/60 backdrop-blur-md px-8 py-4 rounded-xl shadow-2xl"
            style={{
              fontFamily: globalFontFamily || 'Roboto',
              color: globalTextColor || '#BBB',
              fontSize: '18px', // A bit larger for preview mode
              lineHeight: 1.5,
            }}
          >
            {descriptionText}
          </div>
        </div>
      )}
    </div>
  );
}
