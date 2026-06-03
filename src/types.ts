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

export interface StoryboardState {
  projectName: string;
  projectVersion: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  globalFontFamily: string;
  globalTextColor: string;
  globalFontSize: string;
  shots: Shot[];
}
