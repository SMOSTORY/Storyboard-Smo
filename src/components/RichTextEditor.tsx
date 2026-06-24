import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store';
import { Bold, Italic, Underline, Eraser } from 'lucide-react';
import { cn } from '../lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { saveHistory, globalFontFamily, globalTextColor, globalFontSize } = useStore();
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
        setHasSelection(false);
        return;
      }
      
      // Check if selection is inside editor
      if (editorRef.current && editorRef.current.contains(selection.anchorNode)) {
        setHasSelection(true);
      } else {
        setHasSelection(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleBlur = () => {
    saveHistory();
  };

  const handleClearFormat = () => {
    // Standard clear format
    document.execCommand('removeFormat', false, '');
    
    // Sometimes pasted content has inline styles that removeFormat doesn't clear.
    // So we can also traverse the selection and strip styles.
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      const element = container.nodeType === Node.ELEMENT_NODE 
        ? container as HTMLElement 
        : container.parentElement;
        
      if (element && editorRef.current?.contains(element)) {
        // If they selected the whole editor or part of it, clean up spans
        const spans = element.querySelectorAll('span, font');
        spans.forEach(span => {
          if (selection.containsNode(span, true)) {
            span.removeAttribute('style');
            span.removeAttribute('class');
            span.removeAttribute('color');
            span.removeAttribute('size');
            span.removeAttribute('face');
          }
        });
        
        // Also clean the element itself if it's a span or p etc.
        if (element.tagName !== 'DIV' && element !== editorRef.current) {
          element.removeAttribute('style');
        }
      }
    }
    
    editorRef.current?.focus();
    handleInput();
  };

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className={cn("flex flex-col rounded overflow-hidden shadow-none group/editor relative", className)}>
      {hasSelection && (
        <div className="absolute top-0 right-0 z-20 bg-[#181818] border border-[#333] shadow-xl rounded flex items-center gap-1 p-0.5 animate-in fade-in zoom-in-95 duration-100 hide-in-export">
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
          <button
            onClick={handleClearFormat}
            className="p-1 hover:bg-[#333] rounded text-red-400 pointer-events-auto transition-colors"
            title="Clear Formatting"
          >
            <Eraser size={12} />
          </button>
        </div>
      )}
      <div className="relative flex-1 flex flex-col pt-1">
        {(!value || value === '<br>' || value === '<div><br></div>' || value.trim() === '') && (
          <div className="absolute top-2.5 left-1.5 pointer-events-none text-[#666] text-[9px] italic hide-in-export opacity-50 group-hover/editor:opacity-100 transition-opacity">
            Click to type description...
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-1 px-1.5 py-1.5 focus:outline-none min-h-[40px] overflow-y-auto border border-transparent hover:border-[#333] focus:border-[#444] rounded transition-colors relative z-10"
          style={{
            fontFamily: globalFontFamily || 'Roboto',
            color: globalTextColor || '#BBB',
            fontSize: globalFontSize || '11px',
          }}
        />
      </div>
    </div>
  );
}
