import { useMemo } from 'react';
import { useStore } from '../store';
import { ShotCard } from './ShotCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Shot } from '../types';

export function StoryboardGrid() {
  const { 
    shots, 
    reorderShots, 
    projectName, setProjectName,
    headerCenter, setHeaderCenter,
    headerRight, setHeaderRight,
    footerLeft, setFooterLeft,
    footerCenter, setFooterCenter,
    saveHistory,
    addPage
  } = useStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = shots.findIndex((s) => s.id === active.id);
      const newIndex = shots.findIndex((s) => s.id === over.id);
      reorderShots(oldIndex, newIndex);
    }
  };

  const pages = useMemo(() => {
    const SHOTS_PER_PAGE = 8;
    const pageCount = Math.max(1, Math.ceil(shots.length / SHOTS_PER_PAGE));
    const result: Shot[][] = [];
    
    for (let i = 0; i < pageCount; i++) {
        result.push(shots.slice(i * SHOTS_PER_PAGE, (i + 1) * SHOTS_PER_PAGE));
    }
    
    // Ensure last page has enough space or is just rendered as-is
    return result;
  }, [shots]);

  return (
    <div className="flex flex-col items-center gap-12 py-10 px-4 flex-1 bg-[#181818] overflow-y-auto w-full">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={shots.map(s => s.id)}
          strategy={rectSortingStrategy}
        >
          {pages.map((pageShots, pageIndex) => (
            <div 
              key={`page-${pageIndex}`}
              className="board-page bg-[#252525] shadow-2xl border border-[#333] w-full max-w-[1122px] aspect-[1.414] shrink-0 flex flex-col p-6 relative overflow-hidden"
              // DIN A4 width/height: 297mm x 210mm. Aspect is 1.414.
            >
              {/* PAGE HEADER */}
              <div className="grid grid-cols-3 gap-4 border-b border-[#444] pb-4 mb-4 shrink-0">
                <div>
                  <input 
                    type="text" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onBlur={() => saveHistory()}
                    placeholder="Project Name"
                    className="bg-transparent border-none text-sm font-semibold text-white focus:outline-none w-full underline decoration-[#444] placeholder:text-[#666]"
                  />
                </div>
                <div className="text-center">
                  <input 
                    type="text" 
                    value={headerCenter}
                    onChange={(e) => setHeaderCenter(e.target.value)}
                    onBlur={() => saveHistory()}
                    placeholder="Header Center"
                    className="bg-transparent border-none text-sm text-center font-semibold text-white focus:outline-none w-full opacity-80 placeholder:text-[#666]"
                  />
                </div>
                <div className="text-right">
                  <input 
                    type="text" 
                    value={headerRight}
                    onChange={(e) => setHeaderRight(e.target.value)}
                    onBlur={() => saveHistory()}
                    placeholder="Header Right"
                    className="bg-transparent border-none text-sm text-right font-semibold text-white focus:outline-none w-full opacity-80 placeholder:text-[#666]"
                  />
                </div>
              </div>

              {/* GRID */}
              <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-2 gap-3">
                {pageShots.map((shot) => {
                  const globalIndex = shots.findIndex(s => s.id === shot.id);
                  return (
                    <ShotCard
                      key={shot.id}
                      shot={shot}
                      index={globalIndex}
                    />
                  );
                })}
                
                {/* Empty placeholders for the rest of the page if incomplete */}
                {Array.from({ length: 8 - pageShots.length }).map((_, i) => (
                  <button 
                    key={`empty-${i}`} 
                    onClick={() => {
                      const newIndex = (pageIndex * 8) + pageShots.length + i;
                      useStore.getState().addShot(newIndex);
                    }}
                    className="bg-[#1E1E1E] border border-[#333] hover:border-[#555] opacity-40 hover:opacity-100 rounded-sm p-2 flex flex-col transition-all cursor-pointer text-left"
                  >
                     <div className="text-[10px] font-mono text-[#888]">SHOT --</div>
                     <div className="flex-1 flex items-center justify-center text-[24px] text-[#555] hover:text-[#E0E0E0] transition-colors">+</div>
                  </button>
                ))}
              </div>

              {/* PAGE FOOTER */}
              <div className="grid grid-cols-3 gap-4 border-t border-[#444] pt-4 mt-4 shrink-0">
                <div className="flex items-center">
                  <input 
                    type="text" 
                    value={footerLeft}
                    onChange={(e) => setFooterLeft(e.target.value)}
                    onBlur={() => saveHistory()}
                    placeholder="Footer Left"
                    className="bg-transparent border-none text-[9px] font-semibold text-white focus:outline-none outline-none placeholder:text-[#666] w-full bg-transparent"
                  />
                </div>
                <div className="text-center flex items-center justify-center">
                  <input 
                    type="text" 
                    value={footerCenter}
                    onChange={(e) => setFooterCenter(e.target.value)}
                    onBlur={() => saveHistory()}
                    placeholder="Footer Center"
                    className="bg-transparent border-none text-[9px] text-center font-semibold text-white focus:outline-none outline-none placeholder:text-[#666] w-full max-w-[150px] bg-transparent"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-[#888] uppercase">PAGE {pageIndex + 1} / {pages.length}</span>
                </div>
              </div>
            </div>
          ))}
        </SortableContext>
      </DndContext>
      
      <button 
        onClick={addPage}
        className="mb-10 px-8 py-3 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-sm font-bold text-white transition-colors hide-in-export shadow-lg"
      >
        + Add Page
      </button>
    </div>
  );
}
