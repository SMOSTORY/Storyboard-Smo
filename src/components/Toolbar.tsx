import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Undo2, Redo2, Trash2, Download, Upload, FileDown, Moon, Sun, AlertTriangle, Settings2, X, Type } from 'lucide-react';
import { format } from 'date-fns';
import { exportPdf } from '../lib/export';

export function Toolbar() {
  const { undo, redo, past, future, clearState, importState, projectName } = useStore();
  const state = useStore();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isDocActionsModalOpen, setIsDocActionsModalOpen] = useState(false);
  const [isEditorSettingsModalOpen, setIsEditorSettingsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    const data = {
      projectName: state.projectName,
      projectVersion: state.projectVersion,
      headerCenter: state.headerCenter,
      headerRight: state.headerRight,
      footerLeft: state.footerLeft,
      footerCenter: state.footerCenter,
      globalFontFamily: state.globalFontFamily,
      globalTextColor: state.globalTextColor,
      globalFontSize: state.globalFontSize,
      shots: state.shots,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsDocActionsModalOpen(false);
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
    setIsDocActionsModalOpen(false);
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
            STORYBOARD SMO
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
              onClick={() => setIsDocActionsModalOpen(true)}
              className="px-4 py-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded text-xs font-medium transition-colors text-[#E0E0E0] group flex items-center gap-1.5 shrink-0"
            >
              <Settings2 size={14} className="opacity-70 group-hover:opacity-100" />
              Document Actions
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

      {/* Document Actions Modal */}
      {isDocActionsModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#333] rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Document Actions</h2>
              <button 
                onClick={() => setIsDocActionsModalOpen(false)}
                className="text-[#666] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-2">
              <button
                onClick={handleExportJson}
                className="w-full text-left p-3 hover:bg-[#222] rounded flex items-start gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded bg-[#2A2A2A] group-hover:bg-[#333] flex items-center justify-center shrink-0 transition-colors">
                  <Download size={16} className="text-[#E0E0E0]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white mb-0.5">Save File</div>
                  <div className="text-xs text-[#999]">Export to a editable JSON file</div>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left p-3 hover:bg-[#222] rounded flex items-start gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded bg-[#2A2A2A] group-hover:bg-[#333] flex items-center justify-center shrink-0 transition-colors">
                  <Upload size={16} className="text-[#E0E0E0]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white mb-0.5">Import File</div>
                  <div className="text-xs text-[#999]">Load an exported JSON file</div>
                </div>
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleImportJson} 
              />

              <div className="h-[1px] bg-[#333] mx-2 my-1"></div>

              <button
                onClick={() => {
                  setIsDocActionsModalOpen(false);
                  setIsEditorSettingsModalOpen(true);
                }}
                className="w-full text-left p-3 hover:bg-[#222] rounded flex items-start gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded bg-[#2A2A2A] group-hover:bg-[#333] flex items-center justify-center shrink-0 transition-colors">
                  <Type size={16} className="text-[#E0E0E0]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white mb-0.5">Editor Settings</div>
                  <div className="text-xs text-[#999]">Change font family, size and color</div>
                </div>
              </button>

              <div className="h-[1px] bg-[#333] mx-2 my-1"></div>

              <button
                onClick={() => {
                  setIsDocActionsModalOpen(false);
                  setIsClearModalOpen(true);
                }}
                className="w-full text-left p-3 hover:bg-red-500/10 rounded flex items-start gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center shrink-0 transition-colors">
                  <Trash2 size={16} className="text-red-400 group-hover:text-red-300" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-400 group-hover:text-red-300 mb-0.5">Clear Board</div>
                  <div className="text-xs text-red-400/70 group-hover:text-red-400/90">Wipe all shots and text</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Editor Settings Modal */}
      {isEditorSettingsModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#333] rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Editor Settings</h2>
              <button 
                onClick={() => setIsEditorSettingsModalOpen(false)}
                className="text-[#666] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white">Font Family</label>
                <select
                  value={state.globalFontFamily || 'Roboto'}
                  onChange={(e) => state.setGlobalFontFamily(e.target.value)}
                  className="bg-[#222] border border-[#555] rounded px-3 py-2 text-sm text-[#E0E0E0] outline-none hover:border-[#666] transition-colors appearance-none cursor-pointer"
                >
                  <option value="Roboto">Roboto</option>
                  <option value="Inter">Inter</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white">Font Size</label>
                <select
                  value={state.globalFontSize || '11px'}
                  onChange={(e) => state.setGlobalFontSize(e.target.value)}
                  className="bg-[#222] border border-[#555] rounded px-3 py-2 text-sm text-[#E0E0E0] outline-none hover:border-[#666] transition-colors appearance-none cursor-pointer"
                >
                  <option value="9px">9px (Small)</option>
                  <option value="10px">10px (Normal)</option>
                  <option value="11px">11px (Default)</option>
                  <option value="12px">12px (Large)</option>
                  <option value="13px">13px (Extra Large)</option>
                  <option value="14px">14px (Huge)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white">Text Color</label>
                <div className="flex items-center gap-3 bg-[#222] border border-[#555] rounded px-3 py-1.5 focus-within:border-[#777] transition-colors">
                  <input
                    type="color"
                    value={state.globalTextColor || '#bbbbbb'}
                    onChange={(e) => state.setGlobalTextColor(e.target.value)}
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent shrink-0"
                  />
                  <span className="text-sm text-[#E0E0E0] font-mono uppercase">{state.globalTextColor || '#BBBBBB'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#333] flex justify-end">
              <button
                onClick={() => setIsEditorSettingsModalOpen(false)}
                className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded text-sm font-semibold text-white transition-colors border border-[#444]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
