import assert from 'node:assert';
import test from 'node:test';
import { getNextElementTypeOnEnter, getNextElementTypeOnTab } from './transitions';

test('Screenplay State Machine: Enter transitions', () => {
  // Scene heading -> Action
  assert.strictEqual(getNextElementTypeOnEnter('scene_heading', false), 'action');

  // Character -> Dialogue
  assert.strictEqual(getNextElementTypeOnEnter('character', false), 'dialogue');

  // Parenthetical -> Dialogue
  assert.strictEqual(getNextElementTypeOnEnter('parenthetical', false), 'dialogue');

  // Dialogue -> Action (when non-empty)
  assert.strictEqual(getNextElementTypeOnEnter('dialogue', false), 'action');

  // Transition -> Scene heading
  assert.strictEqual(getNextElementTypeOnEnter('transition', false), 'scene_heading');

  // Empty line transitions
  assert.strictEqual(getNextElementTypeOnEnter('dialogue', true), 'action');
  assert.strictEqual(getNextElementTypeOnEnter('character', true), 'action');
});

test('Screenplay State Machine: Tab transitions', () => {
  // Action + Tab -> Character
  assert.strictEqual(getNextElementTypeOnTab('action', false), 'character');

  // Character + Tab -> Transition
  assert.strictEqual(getNextElementTypeOnTab('character', false), 'transition');

  // Dialogue + Tab -> Parenthetical
  assert.strictEqual(getNextElementTypeOnTab('dialogue', false), 'parenthetical');

  // Reverse Tab: Dialogue + Shift-Tab -> Parenthetical
  assert.strictEqual(getNextElementTypeOnTab('dialogue', true), 'parenthetical');

  // Reverse Tab: Character + Shift-Tab -> Action
  assert.strictEqual(getNextElementTypeOnTab('character', true), 'action');
});
