/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { Toolbar } from './components/Toolbar';
import { StoryboardGrid } from './components/StoryboardGrid';
import { useStore } from './store';

export default function App() {
  const shots = useStore(state => state.shots);
  const projectVersion = useStore(state => state.projectVersion);
  const projectName = useStore(state => state.projectName);
  
  const estimatedRuntime = useMemo(() => {
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
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [shots]);

  return (
    <div className="font-sans text-[#E0E0E0] h-[100dvh] w-full bg-[#0A0A0A] selection:bg-blue-900/50 flex flex-col overflow-hidden">
      <Toolbar />
      <StoryboardGrid />
      <footer className="bg-[#111] border-t border-[#222] px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-2 sm:gap-0">
        <div className="flex items-center gap-3 sm:space-x-4">
          <div className="text-[9px] sm:text-[10px] text-[#666] uppercase tracking-tighter">Total Shots: <span className="text-[#AAA] font-bold">{shots.length}</span></div>
          <div className="text-[9px] sm:text-[10px] text-[#666] uppercase tracking-tighter">Est. Runtime: <span className="text-[#AAA] font-bold">{estimatedRuntime}</span></div>
          <div className="hidden sm:block text-[10px] text-[#666] uppercase tracking-tighter font-mono">Version: <span className="text-[#AAA] font-bold">{projectVersion || 'v1.0.0'}</span></div>
        </div>
        <div className="flex items-center">
           <div className="text-[9px] sm:text-[10px] text-[#555] font-mono uppercase truncate max-w-[150px] sm:max-w-xs">{projectName}</div>
        </div>
      </footer>
    </div>
  );
}
