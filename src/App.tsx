/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { Minus, Plus, Maximize, LayoutGrid } from 'lucide-react';
import { Toolbar } from './components/Toolbar';
import { StoryboardGrid } from './components/StoryboardGrid';
import { BookLayout } from './components/BookLayout';
import { useStore } from './store';

export default function App() {
  const shots = useStore(state => state.shots);
  const zoomLevel = useStore(state => state.zoomLevel);
  const setZoomLevel = useStore(state => state.setZoomLevel);
  const currentView = useStore(state => state.currentView);
  
  const { estimatedRuntime, totalWordCount } = useMemo(() => {
    let totalWords = 0;
    shots.forEach(shot => {
      // Strip HTML tags (like <br>, <div>) from the rich text description
      const text = shot.description.replace(/<[^>]*>?/gm, ' ');
      const words = text.split(/\s+/).filter(w => w.length > 0);
      totalWords += words.length;
    });
    // 120 words per minute (narrator style) -> 2 words per second.
    const totalSeconds = Math.ceil(totalWords / 2);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return {
      estimatedRuntime: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      totalWordCount: totalWords
    };
  }, [shots]);

  return (
    <div className="font-sans text-[#E0E0E0] h-[100dvh] w-full bg-[#0A0A0A] selection:bg-blue-900/50 flex flex-col overflow-hidden">
      <Toolbar />
      {currentView === 'storyboard' ? <StoryboardGrid /> : <BookLayout />}
      <footer className="bg-[#111] border-t border-[#222] px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-2 sm:gap-0">
        <div className="flex flex-wrap items-center gap-3 sm:space-x-4">
          <div className="text-[10px] sm:text-[11px] text-[#AAA] font-black tracking-widest uppercase flex items-center mr-2">SMOSTORY Tales</div>
          <div className="text-[9px] sm:text-[10px] text-[#666] uppercase tracking-tighter">Total Shots: <span className="text-[#AAA] font-bold">{shots.filter(s => s.image).length}</span></div>
          <div className="text-[9px] sm:text-[10px] text-[#666] uppercase tracking-tighter">Est. Runtime: <span className="text-[#AAA] font-bold">{estimatedRuntime}</span></div>
          <div className="text-[9px] sm:text-[10px] text-[#666] uppercase tracking-tighter">Word Count: <span className="text-[#AAA] font-bold">{totalWordCount}</span></div>
        </div>
        <div className="flex items-center gap-1">
           <button onClick={() => setZoomLevel(90)} className="text-[#666] hover:text-white p-1 transition-colors" title="Overview (90%)">
             <LayoutGrid size={14} />
           </button>
           <button onClick={() => setZoomLevel(120)} className="text-[#666] hover:text-white p-1 transition-colors mr-1" title="Full Width (120%)">
             <Maximize size={14} />
           </button>
           <div className="w-[1px] h-4 bg-[#333] mx-1"></div>
           <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="text-[#666] hover:text-white p-1 transition-colors" title="Zoom Out">
             <Minus size={14} />
           </button>
           <div className="text-[10px] text-[#888] font-mono w-[40px] text-center select-none">{zoomLevel}%</div>
           <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="text-[#666] hover:text-white p-1 transition-colors" title="Zoom In">
             <Plus size={14} />
           </button>
        </div>
      </footer>
    </div>
  );
}
