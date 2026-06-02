import React, { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImagePlus, GripVertical, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import { Shot, ShotType } from '../types';
import { useStore } from '../store';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '../lib/utils';

interface ShotCardProps {
  key?: string | number;
  shot: Shot;
  index: number;
}

const SHOT_TYPES: ShotType[] = ['ECU', 'CU', 'MS', 'LS', 'ELS'];

export function ShotCard({ shot, index }: ShotCardProps) {
  const { updateShot, deleteShot, addShot, saveHistory } = useStore();
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          saveHistory();
          updateShot(shot.id, { image: dataUrl });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    // Prevent drag from intercepting standard clicks
    fileInputRef.current?.click();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-[#1E1E1E] border border-[#333] rounded-sm p-2 flex flex-col relative group transition-opacity",
        isDragging && "opacity-50 border-blue-400 z-10"
      )}
    >
      {/* Header overlay for dragging action */}
      <div 
        className="absolute top-2 right-2 z-20 p-1.5 bg-[#181818] hover:bg-[#2A2A2A] border border-[#333] hover:border-[#555] text-[#888] hover:text-[#E0E0E0] rounded cursor-grab active:cursor-grabbing shadow-lg opacity-0 group-hover:opacity-100 transition-colors hide-in-export"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={13} />
      </div>

      <div className="absolute top-9 right-2 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity hide-in-export">
        <button 
          onClick={(e) => { e.stopPropagation(); addShot(index + 1); }}
          className="p-1.5 bg-[#181818] hover:bg-[#2A2A2A] border border-[#333] hover:border-[#555] text-[#888] hover:text-[#E0E0E0] rounded shadow-lg transition-colors pointer-events-auto"
          title="Add shot after"
        >
          <Plus size={13} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); deleteShot(shot.id); }}
          className="p-1.5 bg-[#181818] hover:bg-[#2A2A2A] border border-[#333] hover:border-[#555] text-[#888] hover:text-red-400 rounded shadow-lg transition-colors pointer-events-auto"
          title="Delete shot"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-mono font-bold bg-[#222] text-[#888] px-1.5 rounded text-center inline-block py-0.5 min-w-[60px]">
          SHOT {String(index + 1).padStart(2, '0')}
        </span>
        <input
          type="text"
          placeholder="SCENE LABEL"
          value={shot.sceneNumber}
          onChange={(e) => updateShot(shot.id, { sceneNumber: e.target.value })}
          onBlur={() => saveHistory()}
          className="text-[10px] font-semibold opacity-60 italic text-right bg-transparent border-none focus:outline-none focus:opacity-100 text-white placeholder:text-[#666] w-full ml-2"
        />
      </div>

      {/* Image Area */}
      <div 
        className={cn(
          "flex-1 min-h-[100px] bg-[#0F0F0F] rounded mb-1.5 flex flex-col items-center justify-center relative group/image cursor-pointer overflow-hidden",
          shot.image ? "border border-transparent" : "border border-dashed border-[#444]"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleImageClick}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          accept="image/*"
          onChange={handleImageUpload} 
        />
        {shot.image ? (
          <img src={shot.image} alt={`Shot ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" loading="eager" decoding="sync" />
        ) : (
          <div className="text-[10px] text-[#555] font-medium uppercase text-center leading-tight hide-in-export">
            Drag & Drop Image
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors pointer-events-none" />
      </div>

      <div className="mb-1 flex-1 flex flex-col min-h-[50px] mt-1">
        <RichTextEditor
          value={shot.description}
          onChange={(val) => updateShot(shot.id, { description: val })}
          className="flex-1 text-[9px] leading-tight text-[#BBB] bg-transparent border-none shadow-none"
        />
      </div>

      {/* Metadata Toggle */}
      <button 
        onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
        className="flex items-center justify-center gap-1 text-[9px] text-[#666] hover:text-[#999] py-0.5 mt-auto uppercase tracking-wider font-semibold hide-in-export"
      >
        {isMetadataExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        <span>{isMetadataExpanded ? 'Hide Details' : 'Show Details'}</span>
      </button>

      {/* Professional Metadata */}
      {isMetadataExpanded && (
        <div className="grid grid-cols-2 gap-1 mt-1 border-t border-[#333] pt-1.5">
          <div className="flex flex-col">
            <label className="text-[8px] text-[#666] uppercase">Shot Type</label>
            <select 
              value={shot.metadata.shotType}
              onChange={(e) => {
                updateShot(shot.id, { 
                  metadata: { ...shot.metadata, shotType: e.target.value as ShotType } 
                });
                saveHistory();
              }}
              className="bg-[#111] border border-[#333] rounded px-1 py-0.5 text-[#999] outline-none mt-0.5 w-full text-[9px]"
            >
              <option value="">- Select -</option>
              {SHOT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[8px] text-[#666] uppercase">Focal Length</label>
            <input 
              type="text" 
              placeholder="e.g. 50mm"
              value={shot.metadata.focalLength}
              onChange={(e) => updateShot(shot.id, { metadata: { ...shot.metadata, focalLength: e.target.value } })}
              onBlur={() => saveHistory()}
              className="bg-[#111] border border-[#333] rounded px-1 py-0.5 text-[#999] outline-none mt-0.5 w-full text-[9px]"
            />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-[8px] text-[#666] uppercase">Camera Movement</label>
            <input 
              type="text" 
              placeholder="e.g. Pan, Tilt, Dolly"
              value={shot.metadata.cameraMovement}
              onChange={(e) => updateShot(shot.id, { metadata: { ...shot.metadata, cameraMovement: e.target.value } })}
              onBlur={() => saveHistory()}
              className="bg-[#111] border border-[#333] rounded px-1 py-0.5 text-[#999] outline-none mt-0.5 w-full text-[9px]"
            />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-[8px] text-[#666] uppercase">Dialogue / Notes</label>
            <textarea 
              rows={2}
              placeholder="Actor lines, SFX..."
              value={shot.metadata.dialogue}
              onChange={(e) => updateShot(shot.id, { metadata: { ...shot.metadata, dialogue: e.target.value } })}
              onBlur={() => saveHistory()}
              className="bg-[#111] border border-[#333] rounded px-1 py-0.5 text-[#999] outline-none mt-0.5 w-full text-[9px] resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
