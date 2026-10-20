import { ScreenplayElementType } from './types';

/**
 * Screenplay Element Navigation State Machine
 * Defines standard Hollywood keyboard behavior for Enter, Tab, and Shift+Tab.
 */

/**
 * Determines default element type created when pressing 'Enter' at the end of a line.
 */
export function getNextElementTypeOnEnter(
  currentType: ScreenplayElementType,
  isEmpty: boolean
): ScreenplayElementType {
  if (isEmpty) {
    // Pressing enter on an empty line cycles to action or slugline
    switch (currentType) {
      case 'character':
      case 'dialogue':
      case 'parenthetical':
        return 'action';
      default:
        return 'action';
    }
  }

  switch (currentType) {
    case 'scene_heading':
      return 'action';
    case 'action':
      return 'action';
    case 'character':
      return 'dialogue';
    case 'parenthetical':
      return 'dialogue';
    case 'dialogue':
      // Enter after dialogue defaults to Action, or user can hit Tab to jump to character
      return 'action';
    case 'transition':
      return 'scene_heading';
    case 'shot':
      return 'action';
    case 'general':
      return 'action';
    default:
      return 'action';
  }
}

/**
 * Determines the target element type when pressing 'Tab' on a line.
 */
export function getNextElementTypeOnTab(
  currentType: ScreenplayElementType,
  isShiftTab = false
): ScreenplayElementType {
  if (isShiftTab) {
    // Reverse cycle
    switch (currentType) {
      case 'dialogue':
        return 'parenthetical';
      case 'parenthetical':
        return 'character';
      case 'character':
        return 'action';
      case 'transition':
        return 'character';
      case 'action':
        return 'scene_heading';
      case 'scene_heading':
        return 'transition';
      default:
        return 'action';
    }
  }

  // Forward Tab cycle
  switch (currentType) {
    case 'action':
      // Hitting Tab in Action transforms into Character
      return 'character';
    case 'character':
      // Hitting Tab on Character transforms into Transition or Parenthetical
      return 'transition';
    case 'dialogue':
      // Hitting Tab in Dialogue creates or transforms to Parenthetical
      return 'parenthetical';
    case 'parenthetical':
      return 'dialogue';
    case 'transition':
      return 'scene_heading';
    case 'scene_heading':
      return 'action';
    default:
      return 'character';
  }
}
