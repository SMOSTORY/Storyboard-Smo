import { useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Bold, Italic, Underline } from 'lucide-react';
import { cn } from '../lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { saveHistory } = useStore();

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleBlur = () => {
    saveHistory();
  };

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className={cn("flex flex-col rounded overflow-hidden shadow-none group/editor", className)}>
      <div className="flex items-center gap-1 p-0.5 opacity-50 hover:opacity-100 transition-opacity hide-in-export">
        <button
          onClick={() => exec('bold')}
          className="p-1 hover:bg-[#333] rounded text-[#E0E0E0] pointer-events-auto transition-colors"
          title="Bold"
        >
          <Bold size={12} />
        </button>
        <button
          onClick={() => exec('italic')}
          className="p-1 hover:bg-[#333] rounded text-[#E0E0E0] pointer-events-auto transition-colors"
          title="Italic"
        >
          <Italic size={12} />
        </button>
        <button
          onClick={() => exec('underline')}
          className="p-1 hover:bg-[#333] rounded text-[#E0E0E0] pointer-events-auto transition-colors"
          title="Underline"
        >
          <Underline size={12} />
        </button>
        <div className="w-px h-3 bg-[#444] mx-0.5" />
        <select 
          onChange={(e) => exec('fontName', e.target.value)}
          className="text-[10px] bg-transparent text-[#E0E0E0] outline-none pointer-events-auto cursor-pointer"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times</option>
          <option value="Courier New">Courier</option>
        </select>
        <div className="w-px h-3 bg-[#444] mx-0.5" />
        <input 
          type="color" 
          onChange={(e) => exec('foreColor', e.target.value)}
          className="w-4 h-4 p-0 border-0 pointer-events-auto cursor-pointer bg-transparent rounded"
          title="Text Color"
        />
      </div>
      <div className="relative flex-1 flex flex-col">
        {(!value || value === '<br>' || value === '<div><br></div>' || value.trim() === '') && (
          <div className="absolute top-1.5 left-1.5 pointer-events-none text-[#666] text-[9px] italic hide-in-export opacity-50 group-hover/editor:opacity-100 transition-opacity">
            Click to type description...
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleBlur}
          className="flex-1 px-1.5 py-1.5 focus:outline-none min-h-[40px] text-[#BBB] overflow-y-auto border border-transparent hover:border-[#333] focus:border-[#444] rounded transition-colors relative z-10"
        />
      </div>
    </div>
  );
}
