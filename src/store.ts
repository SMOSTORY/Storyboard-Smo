import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import { Shot, StoryboardState } from './types';

// Custom storage object for idb-keyval
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null; // idb-keyval returns T | undefined, Zustand expects string | null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface State extends StoryboardState {
  past: StoryboardState[];
  future: StoryboardState[];
}

export interface StoryboardActions {
  saveHistory: () => void;
  setProjectName: (name: string) => void;
  setProjectVersion: (version: string) => void;
  setHeaderCenter: (text: string) => void;
  setHeaderRight: (text: string) => void;
  setFooterLeft: (text: string) => void;
  setFooterCenter: (text: string) => void;
  setGlobalFontFamily: (font: string) => void;
  setGlobalTextColor: (color: string) => void;
  setGlobalFontSize: (size: string) => void;
  
  addShot: (index: number) => void;
  addPage: () => void;
  deletePage: (pageIndex: number) => void;
  updateShot: (id: string, updates: Partial<Shot>) => void;
  deleteShot: (id: string) => void;
  reorderShots: (startIndex: number, endIndex: number) => void;
  
  importState: (state: StoryboardState) => void;
  clearState: () => void;

  undo: () => void;
  redo: () => void;
}

type Store = State & StoryboardActions;

export const createEmptyShot = (): Shot => ({
  id: uuidv4(),
  image: null,
  sceneNumber: '',
  description: '',
  metadata: {
    shotType: '',
    cameraMovement: '',
    focalLength: '',
    dialogue: '',
  },
});

const defaultState: StoryboardState = {
  projectName: 'Project Name',
  projectVersion: 'v1.0.0',
  headerCenter: '',
  headerRight: '',
  footerLeft: '',
  footerCenter: '',
  globalFontFamily: 'Roboto',
  globalTextColor: '#BBBBBB',
  globalFontSize: '11px',
  shots: Array.from({ length: 8 }).map(createEmptyShot),
};

const extractState = (state: State): StoryboardState => ({
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
});

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...defaultState,
      past: [],
      future: [],

      saveHistory: () => {
        const current = extractState(get());
        set((state) => ({
          past: [...state.past.slice(-49), current], // Keep 50 states
          future: [],
        }));
      },

      setProjectName: (projectName) => set({ projectName }),
      setProjectVersion: (projectVersion) => set({ projectVersion }),
      setHeaderCenter: (headerCenter) => set({ headerCenter }),
      setHeaderRight: (headerRight) => set({ headerRight }),
      setFooterLeft: (footerLeft) => set({ footerLeft }),
      setFooterCenter: (footerCenter) => set({ footerCenter }),
      setGlobalFontFamily: (globalFontFamily) => set({ globalFontFamily }),
      setGlobalTextColor: (globalTextColor) => set({ globalTextColor }),
      setGlobalFontSize: (globalFontSize) => set({ globalFontSize }),

      addShot: (index) => {
        get().saveHistory();
        set((state) => {
          const newShots = [...state.shots];
          newShots.splice(index, 0, createEmptyShot());
          return { shots: newShots };
        });
      },

      addPage: () => {
        get().saveHistory();
        set((state) => {
          const newShots = [...state.shots, ...Array.from({ length: 8 }).map(createEmptyShot)];
          return { shots: newShots };
        });
      },

      deletePage: (pageIndex) => {
        get().saveHistory();
        set((state) => {
          const newShots = [...state.shots];
          newShots.splice(pageIndex * 8, 8);
          // ensure at least one shot exists so we don't have empty board sometimes, but if empty, map to 8 shots
          if (newShots.length === 0) {
            newShots.push(...Array.from({ length: 8 }).map(createEmptyShot));
          }
          return { shots: newShots };
        });
      },

      updateShot: (id, updates) => {
        set((state) => ({
          shots: state.shots.map((shot) => (shot.id === id ? { ...shot, ...updates } : shot)),
        }));
      },

      deleteShot: (id) => {
        get().saveHistory();
        set((state) => ({
          shots: state.shots.filter((shot) => shot.id !== id),
        }));
      },

      reorderShots: (startIndex, endIndex) => {
        get().saveHistory();
        set((state) => {
          const result = Array.from(state.shots);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { shots: result };
        });
      },

      importState: (newState) => {
        get().saveHistory();
        set({ ...newState });
      },

      clearState: () => {
        get().saveHistory();
        set({ ...defaultState, shots: Array.from({ length: 8 }).map(createEmptyShot) });
      },

      undo: () => {
        const state = get();
        if (state.past.length === 0) return;
        
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);
        const current = extractState(state);
        
        set({
          ...previous,
          past: newPast,
          future: [current, ...state.future],
        });
      },

      redo: () => {
        const state = get();
        if (state.future.length === 0) return;
        
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        const current = extractState(state);
        
        set({
          ...next,
          past: [...state.past, current],
          future: newFuture,
        });
      },
    }),
    {
      name: 'storyboard-storage',
      storage: createJSONStorage(() => storage),
      // Don't persist undo/redo stacks
      partialize: (state) => extractState(state),
    }
  )
);
