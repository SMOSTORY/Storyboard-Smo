import React, { useState } from 'react';
import { useStore } from '../store';
import { Undo2, Redo2, Trash2, Download, Upload, FileDown, Moon, Sun, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { exportPdf } from '../lib/export';

export function Toolbar() {
  const { undo, redo, past, future, clearState, importState, projectName, projectVersion, setProjectVersion } = useStore();
  const state = useStore();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleExportJson = () => {
    const data = {
      projectName: state.projectName,
      projectVersion: state.projectVersion,
      headerCenter: state.headerCenter,
      headerRight: state.headerRight,
      footerLeft: state.footerLeft,
      footerCenter: state.footerCenter,
      shots: state.shots,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data && data.shots) {
          importState(data);
        }
      } catch (err) {
        console.error('Failed to import JSON', err);
        alert('Invalid project file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportPdf = async (lightMode: boolean) => {
    setIsExportModalOpen(false);
    await exportPdf(projectName, lightMode);
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#222] bg-[#111] z-50 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">S</div>
          <h1 className="text-sm font-semibold tracking-wide uppercase opacity-90 flex items-center">
            Storyboard Pro 
            <span className="text-[#666] ml-2 font-mono">{projectVersion || 'v1.0.0'}</span>
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex bg-[#222] rounded p-1 space-x-1">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="px-3 py-1 text-xs hover:bg-[#333] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              Undo
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="px-3 py-1 text-xs hover:bg-[#333] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              Redo
            </button>
          </div>
          <div className="h-4 w-[1px] bg-[#333]"></div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="px-4 py-1.5 bg-[#222] hover:bg-red-500/20 border border-[#444] rounded text-xs font-medium transition-colors text-red-400 group flex items-center gap-1.5 shrink-0"
              title="Clear Board"
            >
              <Trash2 size={14} className="opacity-70 group-hover:opacity-100" />
              Clear
            </button>

            <label className="px-4 py-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded text-xs font-medium transition-colors cursor-pointer flex items-center text-[#E0E0E0] shrink-0 gap-1.5 group">
              <Upload size={14} className="opacity-70 group-hover:opacity-100" />
              Import JSON
              <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
            </label>
            
            <button
              onClick={handleExportJson}
              className="px-4 py-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded text-xs font-medium transition-colors text-[#E0E0E0] shrink-0 gap-1.5 flex items-center group"
            >
              <Download size={14} className="opacity-70 group-hover:opacity-100" />
              Export State
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors shadow-sm group flex items-center gap-1.5 shrink-0"
              title="Export PDF"
            >
              <FileDown size={14} />
              Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#333] rounded-lg shadow-2xl p-6 w-full max-w-md flex flex-col">
            <h2 className="text-lg font-bold text-white mb-2">Export PDF</h2>
            <p className="text-sm text-[#999] mb-6">
              Choose an export theme. The light version uses less ink and is optimized for printing on paper.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleExportPdf(true)}
                className="flex flex-col items-center justify-center p-4 border border-[#444] hover:border-blue-500 hover:bg-[#222] rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
                  <Sun size={24} />
                </div>
                <span className="text-sm font-bold text-white mb-1">Light (Print)</span>
                <span className="text-[10px] text-[#666] text-center">White background, saves ink</span>
              </button>

              <button
                onClick={() => handleExportPdf(false)}
                className="flex flex-col items-center justify-center p-4 border border-[#444] hover:border-blue-500 hover:bg-[#222] rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-[#111] text-slate-100 flex items-center justify-center border border-[#333] mb-3">
                  <Moon size={24} />
                </div>
                <span className="text-sm font-bold text-white mb-1">Dark (Screen)</span>
                <span className="text-[10px] text-[#666] text-center">Matches app theme, best for screens</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 bg-transparent hover:bg-[#2A2A2A] rounded text-sm text-[#E0E0E0] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#333] rounded-lg shadow-2xl p-6 w-full max-w-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Clear Storyboard?</h2>
            </div>
            <p className="text-sm text-[#999] mb-6">
              This action will delete all shots, descriptions, and settings. This action can be undone immediately, but cannot be recovered later if you reload.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 bg-transparent hover:bg-[#2A2A2A] rounded text-sm text-[#E0E0E0] transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearState();
                  setIsClearModalOpen(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm text-white font-semibold transition-colors"
              >
                Clear All Shots
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
