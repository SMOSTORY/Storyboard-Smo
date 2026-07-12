import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PreviewBookModeProps {
  onClose: () => void;
  initialIndex?: number;
}

export function PreviewBookMode({ onClose, initialIndex = 0 }: PreviewBookModeProps) {
  const { shots, bookSettings, bookLayouts } = useStore();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const pages = useMemo(() => {
    return shots.map((shot, index) => {
      const layout = bookLayouts[shot.id] || 'image-left';
      return { shot, layout, pageNumber: (index * 2) + 1 };
    });
  }, [shots, bookLayouts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(prev + 1, pages.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, pages.length]);

  if (pages.length === 0) return null;

  const currentSpread = pages[currentIndex];
  const { shot, layout, pageNumber } = currentSpread;

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col justify-center items-center">
      {/* Top Bar Navigation */}
      <button 
        onClick={onClose}
        className="absolute top-6 left-6 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full transition-all z-50"
      >
        <X size={24} />
      </button>

      {/* The Book Area */}
      <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden group px-12 py-12">
        
        {/* Navigation Buttons */}
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
          className={`absolute left-4 p-4 text-white/30 hover:text-white transition-colors z-50 ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronLeft size={48} />
        </button>

        <button 
          onClick={() => setCurrentIndex(prev => Math.min(prev + 1, pages.length - 1))}
          className={`absolute right-4 p-4 text-white/30 hover:text-white transition-colors z-50 ${currentIndex === pages.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronRight size={48} />
        </button>

        {/* The Spread */}
        <div 
          className="w-full max-w-[2000px] flex bg-[#fdfdfd] shadow-2xl relative overflow-hidden text-black transition-all"
          style={{ aspectRatio: '594 / 210' }}
        >
          {/* Center dividing line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black/10 z-10 pointer-events-none shadow-[0_0_20px_rgba(0,0,0,0.1)]"></div>

          {layout === 'image-left' ? (
            <>
              <ImagePanel shot={shot} />
              <TextPanel shot={shot} settings={bookSettings} isLeftPage={false} />
            </>
          ) : (
            <>
              <TextPanel shot={shot} settings={bookSettings} isLeftPage={true} />
              <ImagePanel shot={shot} />
            </>
          )}
          
          {/* Page Numbers */}
          <div className="absolute bottom-6 left-8 text-sm text-black/40 font-mono select-none pointer-events-none">
            {pageNumber}
          </div>
          <div className="absolute bottom-6 right-8 text-sm text-black/40 font-mono select-none pointer-events-none">
            {pageNumber + 1}
          </div>
        </div>

      </div>
    </div>
  );
}

function ImagePanel({ shot }: { shot: any }) {
  return (
    <div className="w-1/2 h-full bg-[#111] flex items-center justify-center relative shrink-0">
      {shot.image ? (
        <img src={shot.image} alt="Scene" className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center text-[#555] gap-4">
          <ImageIcon size={48} />
          <span className="text-sm font-medium uppercase tracking-widest">No Image</span>
        </div>
      )}
    </div>
  );
}

function TextPanel({ shot, settings, isLeftPage }: { shot: any, settings: any, isLeftPage: boolean }) {
  return (
    <div 
      className="w-1/2 h-full flex flex-col relative shrink-0 bg-[#fbfbfb]"
      style={{
        paddingTop: `${settings.paddingTop}px`,
        paddingBottom: `${settings.paddingBottom}px`,
        paddingLeft: isLeftPage ? `${settings.textPaddingEdgePercent}%` : `${settings.textPaddingCenterPercent}%`,
        paddingRight: isLeftPage ? `${settings.textPaddingCenterPercent}%` : `${settings.textPaddingEdgePercent}%`,
      }}
    >
      {shot.sceneNumber && (
        <h2 
          className="leading-none text-black font-bold"
          style={{
            fontFamily: `'${settings.headlineFont}', serif`,
            fontSize: `${settings.headlineSize}px`,
            marginBottom: `${settings.headlineMargin}px`,
          }}
        >
          {shot.sceneNumber}
        </h2>
      )}

      <div 
        className="flex-1 text-[#222]"
        style={{
          fontFamily: `'${settings.bodyFont}', serif`,
          fontSize: `${settings.bodySize}px`,
          lineHeight: 1.6,
        }}
        dangerouslySetInnerHTML={{ __html: shot.description || '<i>*No description provided for this scene.*</i>' }}
      />
    </div>
  );
}
