import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Undo2, Redo2, Trash2, Download, Upload, FileDown, Moon, Sun, AlertTriangle, Settings, Settings2, X, Type, Play, Menu, File, Plus, Info, LayoutTemplate, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { exportPdf } from '../lib/export';
import { PreviewMode } from './PreviewMode';
import { PreviewBookMode } from './PreviewBookMode';
import { motion, AnimatePresence } from 'motion/react';

export function Toolbar() {
  const { undo, redo, past, future, clearState, importState, projectName, projectVersion } = useStore();
  const state = useStore();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isDocActionsModalOpen, setIsDocActionsModalOpen] = useState(false);
  const [isEditorSettingsModalOpen, setIsEditorSettingsModalOpen] = useState(false);
  const [isBookSettingsModalOpen, setIsBookSettingsModalOpen] = useState(false);
  const [isAppInfoModalOpen, setIsAppInfoModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewBookOpen, setIsPreviewBookOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [previewStartIndex, setPreviewStartIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setIsFileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleExportJson();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  const handlePreviewClick = () => {
    const pages = document.querySelectorAll('.board-page');
    let visiblePageIndex = 0;
    
    for (let i = 0; i < pages.length; i++) {
      const rect = pages[i].getBoundingClientRect();
      // If the top of the page is within the top half of the screen, or it spans across the middle
      if ((rect.top >= -rect.height / 2 && rect.top < window.innerHeight / 2) || 
          (rect.top < 0 && rect.bottom > window.innerHeight / 2)) {
        visiblePageIndex = i;
        break;
      }
    }
    
    setPreviewStartIndex(Math.min(visiblePageIndex * 8, state.shots.length - 1));
    setIsPreviewOpen(true);
  };

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
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#222] bg-[#111] z-50 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-[#333] rounded flex items-center justify-center font-medium text-[#AAA] text-[11px] shrink-0">S</div>
            <h1 className="text-[9px] font-black tracking-widest text-[#777] uppercase flex items-center mt-0.5 leading-[1.1]">
              <span className="flex flex-col text-left">
                <span>Story</span>
                <span>board</span>
                <span>SMO</span>
              </span>
            </h1>
          </div>

          <div className="relative" ref={fileMenuRef}>
            <button 
              onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm border ${isFileMenuOpen ? 'bg-[#222] text-white border-[#444]' : 'bg-[#181818] text-[#E0E0E0] hover:bg-[#222] hover:text-white border-[#333]'}`}
            >
              <File size={16} />
              <span>File</span>
            </button>
            {isFileMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#181818] border border-[#333] rounded-md shadow-2xl py-2 z-[110]">
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false);
                    setIsClearModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 sm:py-2 text-sm text-[#E0E0E0] hover:bg-[#222] hover:text-white flex items-center gap-3"
                >
                  <Plus size={18} className="text-[#AAA]" />
                  <span>New</span>
                </button>
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left px-4 py-3 sm:py-2 text-sm text-[#E0E0E0] hover:bg-[#222] hover:text-white flex items-center gap-3"
                >
                  <Upload size={18} className="text-[#AAA]" />
                  <span>Import</span>
                </button>
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false);
                    handleExportJson();
                  }}
                  className="w-full text-left px-4 py-3 sm:py-2 text-sm text-[#E0E0E0] hover:bg-[#222] hover:text-white flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <Download size={18} className="text-[#AAA]" />
                    <span>Save & Download</span>
                  </div>
                  <span className="text-[#666] text-xs">⌘S</span>
                </button>
                <div className="h-[1px] bg-[#333] my-2 mx-2" />
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false);
                    setIsExportModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 sm:py-2 text-sm text-[#E0E0E0] hover:bg-[#222] hover:text-white flex items-center gap-3"
                >
                  <FileDown size={18} className="text-[#AAA]" />
                  <span>Export as PDF</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {state.currentView === 'storyboard' && (
              <button
                onClick={handlePreviewClick}
                className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm border bg-[#181818] text-[#E0E0E0] hover:bg-[#222] hover:text-white border-[#333]"
                title="Preview Storyboard"
              >
                <Play size={16} />
                <span>Preview Storyboard</span>
              </button>
            )}
            {state.currentView === 'book' && (
              <button
                onClick={() => {
                  setIsPreviewBookOpen(true);
                }}
                className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm border bg-[#181818] text-[#E0E0E0] hover:bg-[#222] hover:text-white border-[#333]"
                title="Preview Book"
              >
                <BookOpen size={16} />
                <span>Preview Book</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-[#222] rounded p-1 space-x-1">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="p-1.5 text-xs hover:bg-[#333] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="p-1.5 text-xs hover:bg-[#333] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
          </div>

          {/* Mobile Menu Toggle (now always visible) */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-[#E0E0E0] hover:bg-[#222] hover:text-white rounded transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <input 
        ref={fileInputRef}
        type="file" 
        accept=".json" 
        className="hidden" 
        onChange={handleImportJson} 
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[280px] bg-[#0F1115] h-full shadow-2xl border-l border-[#1F2228] text-[#A1A1AA] flex flex-col pt-6"
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: "'Pliant', sans-serif" }}
            >
              <div className="flex flex-col py-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    state.setCurrentView('storyboard');
                  }}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-[#1A1D24] hover:text-white text-[17px] transition-colors w-full text-left ${state.currentView === 'storyboard' ? 'text-white bg-[#1A1D24]' : ''}`}
                >
                  <LayoutTemplate size={20} className="stroke-[1.5]" />
                  <span>Storyboard</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    state.setCurrentView('book');
                  }}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-[#1A1D24] hover:text-white text-[17px] transition-colors w-full text-left ${state.currentView === 'book' ? 'text-white bg-[#1A1D24]' : ''}`}
                >
                  <BookOpen size={20} className="stroke-[1.5]" />
                  <span>Page Layout</span>
                </button>
                <div className="h-[1px] bg-[#1F2228] mx-6 my-2"></div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsDocActionsModalOpen(true);
                  }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#1A1D24] hover:text-white text-[17px] transition-colors w-full text-left"
                >
                  <Settings size={20} className="stroke-[1.5]" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAppInfoModalOpen(true);
                  }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#1A1D24] hover:text-white text-[17px] transition-colors w-full text-left"
                >
                  <Info size={20} className="stroke-[1.5]" />
                  <span>App Info</span>
                </button>
              </div>

              <div className="mt-auto p-6 border-t border-[#1F2228]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#222] rounded-xl flex items-center justify-center font-black text-white text-lg shadow-inner">S</div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold leading-tight tracking-wide text-[15px]">STORYBOARD</span>
                    <span className="text-white font-bold leading-tight tracking-wide text-[15px]">SMO</span>
                  </div>
                </div>
                <p className="text-sm text-[#888] leading-relaxed">
                  A modern, offline-first storyboard creator. Design shots, organize scenes, and export directly to PDF.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Actions Modal */}
      {isDocActionsModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#333] rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Settings</h2>
              <button 
                onClick={() => setIsDocActionsModalOpen(false)}
                className="text-[#666] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-2">
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
                  setIsBookSettingsModalOpen(true);
                }}
                className="w-full text-left p-3 hover:bg-[#222] rounded flex items-start gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded bg-[#2A2A2A] group-hover:bg-[#333] flex items-center justify-center shrink-0 transition-colors">
                  <BookOpen size={16} className="text-[#E0E0E0]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white mb-0.5">Book Settings</div>
                  <div className="text-xs text-[#999]">Change page layout typography & spacing</div>
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

      {/* Book Settings Modal */}
      {isBookSettingsModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#333] rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Book Settings</h2>
              <button 
                onClick={() => setIsBookSettingsModalOpen(false)}
                className="text-[#666] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white">Headline Font</label>
                  <select
                    value={state.bookSettings.headlineFont}
                    onChange={(e) => state.setBookSettings({ headlineFont: e.target.value })}
                    className="bg-[#222] border border-[#555] rounded px-3 py-2 text-sm text-[#E0E0E0] outline-none hover:border-[#666]"
                  >
                    <option value="Uncial Antiqua">Uncial Antiqua</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Inter">Inter</option>
                    <option value="Caudex">Caudex</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white">Body Font</label>
                  <select
                    value={state.bookSettings.bodyFont}
                    onChange={(e) => state.setBookSettings({ bodyFont: e.target.value })}
                    className="bg-[#222] border border-[#555] rounded px-3 py-2 text-sm text-[#E0E0E0] outline-none hover:border-[#666]"
                  >
                    <option value="Caudex">Caudex</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Inter">Inter</option>
                    <option value="Uncial Antiqua">Uncial Antiqua</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white flex justify-between">
                  <span>Headline Size</span>
                  <span className="text-[#888] font-mono">{state.bookSettings.headlineSize}px</span>
                </label>
                <input
                  type="range" min="16" max="72"
                  value={state.bookSettings.headlineSize}
                  onChange={(e) => state.setBookSettings({ headlineSize: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white flex justify-between">
                  <span>Body Size</span>
                  <span className="text-[#888] font-mono">{state.bookSettings.bodySize}px</span>
                </label>
                <input
                  type="range" min="10" max="36"
                  value={state.bookSettings.bodySize}
                  onChange={(e) => state.setBookSettings({ bodySize: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white flex justify-between">
                  <span>Top Padding</span>
                  <span className="text-[#888] font-mono">{state.bookSettings.paddingTop}px</span>
                </label>
                <input
                  type="range" min="0" max="160"
                  value={state.bookSettings.paddingTop}
                  onChange={(e) => state.setBookSettings({ paddingTop: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white flex justify-between">
                  <span>Bottom Padding</span>
                  <span className="text-[#888] font-mono">{state.bookSettings.paddingBottom}px</span>
                </label>
                <input
                  type="range" min="0" max="160"
                  value={state.bookSettings.paddingBottom}
                  onChange={(e) => state.setBookSettings({ paddingBottom: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white flex justify-between">
                  <span>Text Padding (to center) (%)</span>
                  <span className="text-[#888] font-mono">{state.bookSettings.textPaddingCenterPercent}%</span>
                </label>
                <input
                  type="range" min="0" max="50"
                  value={state.bookSettings.textPaddingCenterPercent}
                  onChange={(e) => state.setBookSettings({ textPaddingCenterPercent: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white flex justify-between">
                  <span>Text Padding (to edge) (%)</span>
                  <span className="text-[#888] font-mono">{state.bookSettings.textPaddingEdgePercent}%</span>
                </label>
                <input
                  type="range" min="0" max="50"
                  value={state.bookSettings.textPaddingEdgePercent}
                  onChange={(e) => state.setBookSettings({ textPaddingEdgePercent: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white flex justify-between">
                  <span>Headline Margin Bottom</span>
                  <span className="text-[#888] font-mono">{state.bookSettings.headlineMargin}px</span>
                </label>
                <input
                  type="range" min="0" max="100"
                  value={state.bookSettings.headlineMargin}
                  onChange={(e) => state.setBookSettings({ headlineMargin: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#333] flex justify-end shrink-0">
              <button
                onClick={() => setIsBookSettingsModalOpen(false)}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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

      {/* App Info Modal */}
      {isAppInfoModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#333] rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">App Info</h2>
              <button 
                onClick={() => setIsAppInfoModalOpen(false)}
                className="text-[#666] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-[#222] rounded-xl flex items-center justify-center font-black text-white text-xl shadow-inner shrink-0">S</div>
                <div className="flex flex-col">
                  <span className="text-white font-bold leading-tight tracking-wide text-[16px]">STORYBOARD</span>
                  <span className="text-white font-bold leading-tight tracking-wide text-[16px]">SMO</span>
                </div>
              </div>
              <p className="text-sm text-[#888] leading-relaxed">
                A modern, offline-first storyboard creator. Design shots, organize scenes, and export directly to PDF.
              </p>
              
              <div className="mt-2">
                <a 
                  href="https://github.com/SMOSTORY/Storyboard-Smo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors break-all"
                >
                  https://github.com/SMOSTORY/Storyboard-Smo
                </a>
              </div>

              <div className="mt-4 pt-4 border-t border-[#333] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#666] uppercase tracking-wider">APP VERSION</span>
                <span className="text-xs font-mono bg-[#222] text-[#AAA] px-2 py-1 rounded">26.06.01</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPreviewOpen && (
        <PreviewMode onClose={() => setIsPreviewOpen(false)} initialIndex={previewStartIndex} />
      )}
      {isPreviewBookOpen && (
        <PreviewBookMode onClose={() => setIsPreviewBookOpen(false)} initialIndex={previewStartIndex} />
      )}
    </>
  );
}
