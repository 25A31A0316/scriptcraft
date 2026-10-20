/**
 * Canonical Screenplay Element Types
 */
export type ScreenplayElementType =
  | 'scene_heading'   // Slugline: INT. COFFEE SHOP - DAY
  | 'action'          // Narrative description
  | 'character'       // Speaking cue in uppercase
  | 'parenthetical'   // Actor instruction: (whispering)
  | 'dialogue'        // Spoken dialogue
  | 'transition'      // Scene transition: CUT TO:
  | 'shot'            // Camera angle / shot cue: CLOSE ON
  | 'general';        // General notes / unformatted text

/**
 * Standard Production Revision Draft Colors
 */
export type RevisionColor =
  | 'white'      // First Production Draft
  | 'blue'       // Revision 1
  | 'pink'       // Revision 2
  | 'yellow'     // Revision 3
  | 'green'      // Revision 4
  | 'goldenrod'  // Revision 5
  | 'buff'       // Revision 6
  | 'salmon'     // Revision 7
  | 'cherry';    // Revision 8

/**
 * Slugline Environment
 */
export type SceneEnvironment = 'INT.' | 'EXT.' | 'INT./EXT.' | 'EXT./INT.' | 'I/E';

/**
 * Standard Time of Day
 */
export type TimeOfDay =
  | 'DAY'
  | 'NIGHT'
  | 'DUSK'
  | 'DAWN'
  | 'CONTINUOUS'
  | 'LATER'
  | 'MOMENTS LATER'
  | 'SAME TIME'
  | string;

/**
 * Node Metadata Attributes
 */
export interface SceneHeadingMetadata {
  sceneNumber?: string;
  sceneId: string;
  environment: SceneEnvironment;
  location: string;
  timeOfDay: TimeOfDay;
  isOmitted?: boolean;
  isLocked?: boolean;
}

export interface CharacterMetadata {
  characterId: string;
  characterName: string;
  extension?: string;        // e.g. "(V.O.)", "(O.S.)", "(CONT'D)"
  isDualDialogue?: boolean;
  dualSide?: 'left' | 'right';
}

export interface DialogueMetadata {
  characterId?: string;
  isDualDialogue?: boolean;
  dualSide?: 'left' | 'right';
}

export interface GeneralNodeMetadata {
  revisionColor?: RevisionColor;
  revisionVersion?: number;
  isLocked?: boolean;
  notes?: string[];
  customClasses?: string[];
}

export type NodeMetadata =
  | SceneHeadingMetadata
  | CharacterMetadata
  | DialogueMetadata
  | GeneralNodeMetadata
  | Record<string, unknown>;

/**
 * The Canonical Screenplay Node
 * Every line/block in the script has an immutable, stable ID.
 */
export interface ScreenplayNode {
  id: string;                      // Stable UUID
  type: ScreenplayElementType;
  text: string;                    // Raw text or Unicode string
  metadata?: NodeMetadata;
}

/**
 * Title Page Specification
 */
export interface ScreenplayTitlePage {
  title: string;
  credit?: string;                 // "written by", "screenplay by"
  author: string;
  source?: string;                 // "Based on...", "Story by..."
  draftDate?: string;
  contact?: string;
  notes?: string;
  copyright?: string;
}

/**
 * Screenplay Format Profile
 */
export type ScreenplayFormatProfile =
  | 'feature'
  | 'tv_half_hour'
  | 'tv_one_hour'
  | 'short_film'
  | 'stageplay';

/**
 * Canonical Screenplay Document Model
 */
export interface ScreenplayDocument {
  id: string;                      // Document UUID
  title: string;
  format: ScreenplayFormatProfile;
  titlePage: ScreenplayTitlePage;
  nodes: ScreenplayNode[];
  revision: {
    currentColor: RevisionColor;
    version: number;
    lockedSceneNumbers: boolean;
  };
  language: {
    primary: string;               // e.g. "en-US", "te-IN"
    secondary?: string;
    direction: 'ltr' | 'rtl';
  };
  createdAt: string;               // ISO 8601
  updatedAt: string;               // ISO 8601
}
