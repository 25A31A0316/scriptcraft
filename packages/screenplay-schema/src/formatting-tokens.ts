import { ScreenplayElementType } from './types';

/**
 * Standard Hollywood Screenplay Geometry (US Letter & A4)
 * Based on monospaced Courier 12pt (10 characters per horizontal inch, 6 lines per vertical inch).
 */
export interface ElementFormattingRules {
  /** Indentation in inches from the 1.5" script left margin */
  leftIndentInches: number;
  /** Maximum line width in inches */
  widthInches: number;
  /** Text transformation */
  textTransform: 'uppercase' | 'none';
  /** Text alignment */
  textAlign: 'left' | 'center' | 'right';
  /** Margin top in lines (where 1 line = 12pt / 1em) */
  linesBefore: number;
  /** Margin bottom in lines */
  linesAfter: number;
}

/**
 * Industry Standard Formatting Specs
 */
export const STANDARD_SCREENPLAY_FORMATTING: Record<ScreenplayElementType, ElementFormattingRules> = {
  scene_heading: {
    leftIndentInches: 0.0,     // 1.5" from left edge of paper
    widthInches: 6.0,          // ~60 characters max
    textTransform: 'uppercase',
    textAlign: 'left',
    linesBefore: 2,            // 2 blank lines (or double space) before a new scene
    linesAfter: 1,
  },
  action: {
    leftIndentInches: 0.0,     // 1.5" from left edge
    widthInches: 6.0,          // ~60 characters max
    textTransform: 'none',
    textAlign: 'left',
    linesBefore: 1,
    linesAfter: 0,
  },
  character: {
    leftIndentInches: 2.2,     // 3.7" from left edge of paper
    widthInches: 3.8,
    textTransform: 'uppercase',
    textAlign: 'left',
    linesBefore: 1,
    linesAfter: 0,
  },
  parenthetical: {
    leftIndentInches: 1.6,     // 3.1" from left edge of paper
    widthInches: 2.5,          // ~25 characters max
    textTransform: 'none',
    textAlign: 'left',
    linesBefore: 0,
    linesAfter: 0,
  },
  dialogue: {
    leftIndentInches: 1.0,     // 2.5" from left edge of paper
    widthInches: 3.5,          // ~35 characters max
    textTransform: 'none',
    textAlign: 'left',
    linesBefore: 0,
    linesAfter: 1,
  },
  transition: {
    leftIndentInches: 4.0,     // Right-aligned near 5.5" - 6.0"
    widthInches: 2.0,
    textTransform: 'uppercase',
    textAlign: 'right',
    linesBefore: 1,
    linesAfter: 1,
  },
  shot: {
    leftIndentInches: 0.0,
    widthInches: 6.0,
    textTransform: 'uppercase',
    textAlign: 'left',
    linesBefore: 1,
    linesAfter: 0,
  },
  general: {
    leftIndentInches: 0.0,
    widthInches: 6.0,
    textTransform: 'none',
    textAlign: 'left',
    linesBefore: 1,
    linesAfter: 0,
  },
};
