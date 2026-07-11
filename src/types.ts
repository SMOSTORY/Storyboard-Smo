export type ShotType = 'ECU' | 'CU' | 'MS' | 'LS' | 'ELS' | '';

export interface ShotMetadata {
  shotType: ShotType;
  cameraMovement: string;
  focalLength: string;
  dialogue: string;
}

export interface Shot {
  id: string;
  image: string | null;
  sceneNumber: string;
  description: string;
  metadata: ShotMetadata;
}

export interface BookSettings {
  headlineFont: string;
  bodyFont: string;
  paddingTop: number;
  paddingBottom: number;
  textPaddingCenterPercent: number;
  textPaddingEdgePercent: number;
  headlineMargin: number;
  headlineSize: number;
  bodySize: number;
}

export type ViewMode = 'storyboard' | 'book';

export interface StoryboardState {
  projectName: string;
  projectVersion: string;
  zoomLevel: number;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  globalFontFamily: string;
  globalTextColor: string;
  globalFontSize: string;
  shots: Shot[];
  currentView: ViewMode;
  bookSettings: BookSettings;
  bookLayouts: Record<string, 'image-left' | 'text-left'>;
}
