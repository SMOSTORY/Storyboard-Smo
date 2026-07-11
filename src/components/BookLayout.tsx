import React, { useMemo } from 'react';
import { useStore } from '../store';
import { ArrowLeftRight, Image as ImageIcon } from 'lucide-react';

export function BookLayout() {
  const { shots, bookSettings, bookLayouts, setBookLayout, zoomLevel } = useStore();

  const pages = useMemo(() => {
    // For BookLayout, each shot is a double-page spread.
    return shots.map((shot, index) => {
      const layout = bookLayouts[shot.id] || 'image-left';
      return { shot, layout, pageNumber: (index * 2) + 1 };
    });
  }, [shots, bookLayouts]);

  return (
    <div className="flex flex-col items-center py-10 px-4 flex-1 bg-[#181818] overflow-y-auto w-full">
      <div 
        className="flex flex-col items-center gap-24"
        style={{ zoom: zoomLevel / 100 } as React.CSSProperties}
      >
        {pages.map(({ shot, layout, pageNumber }) => (
          <div key={shot.id} className="relative group flex flex-col items-center">
            {/* The Spread */}
            <div 
              className="book-page w-[1400px] flex bg-[#fdfdfd] shadow-2xl relative overflow-hidden text-black transition-all"
              style={{ aspectRatio: '594 / 210' }}
            >
              
              {/* Control Toggle - Only visible on hover */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#222]/90 backdrop-blur-sm border border-[#333] rounded-md shadow-2xl flex items-center overflow-hidden z-20">
                <button
                  onClick={() => setBookLayout(shot.id, layout === 'image-left' ? 'text-left' : 'image-left')}
                  className="px-6 py-4 text-sm font-medium text-[#E0E0E0] hover:bg-[#333] hover:text-white transition-colors flex items-center gap-3"
                  title="Swap Image and Text"
                >
                  <ArrowLeftRight size={18} />
                  <span>Swap Layout</span>
                </button>
              </div>

              {/* Center dividing line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black/5 z-10 pointer-events-none shadow-[0_0_20px_rgba(0,0,0,0.1)]"></div>

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
              <div className="absolute bottom-4 left-6 text-xs text-black/40 font-mono select-none pointer-events-none">
                {pageNumber}
              </div>
              <div className="absolute bottom-4 right-6 text-xs text-black/40 font-mono select-none pointer-events-none">
                {pageNumber + 1}
              </div>
            </div>
          </div>
        ))}
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
  const { updateShot, saveHistory } = useStore();

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
      <input 
        type="text"
        value={shot.sceneNumber || ''}
        onChange={(e) => updateShot(shot.id, { sceneNumber: e.target.value })}
        onBlur={() => saveHistory()}
        placeholder="Scene Title"
        className={`leading-none text-black font-bold bg-transparent border-none focus:outline-none w-full ${!shot.sceneNumber ? 'hidden group-hover:block focus:block placeholder:text-black/20' : ''}`}
        style={{
          fontFamily: `'${settings.headlineFont}', serif`,
          fontSize: `${settings.headlineSize}px`,
          marginBottom: `${settings.headlineMargin}px`,
        }}
      />

      <div className="flex-1 relative group/editor">
        {(!shot.description || shot.description === '<br>' || shot.description === '<div><br></div>' || shot.description.trim() === '') && (
          <div className="absolute inset-0 pointer-events-none text-black/20 italic opacity-50 group-hover/editor:opacity-100 transition-opacity"
            style={{
              fontFamily: `'${settings.bodyFont}', serif`,
              fontSize: `${settings.bodySize}px`,
              lineHeight: 1.6,
            }}
          >
            Click to type description...
          </div>
        )}
        <div 
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            updateShot(shot.id, { description: e.currentTarget.innerHTML });
            saveHistory();
          }}
          className="w-full h-full text-[#222] focus:outline-none"
          style={{
            fontFamily: `'${settings.bodyFont}', serif`,
            fontSize: `${settings.bodySize}px`,
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: shot.description }}
        />
      </div>
    </div>
  );
}
