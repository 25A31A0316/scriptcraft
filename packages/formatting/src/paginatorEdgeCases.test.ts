import test from 'node:test';
import assert from 'node:assert';
import { paginateScreenplay } from './paginator';
import { ScreenplayDocument } from '@screenplay/schema';

test('Screenplay Pagination: Orphan character protection pushes cue to next page if dialogue cannot fit', () => {
  // If character cue occurs with <= 2 lines remaining, character cue moves to page 2
  const nodes = [];
  for (let i = 0; i < 26; i++) {
    nodes.push({
      id: `act-${i}`,
      type: 'action' as const,
      text: 'Action line setting the scene.',
    });
  }

  // At this point line count is ~52 on Page 1
  nodes.push({
    id: 'char-isolated',
    type: 'character' as const,
    text: 'VIKTOR',
  });
  nodes.push({
    id: 'dia-isolated',
    type: 'dialogue' as const,
    text: 'Short line.',
  });

  const doc: ScreenplayDocument = {
    id: 'test-orphan-char',
    title: 'Orphan Character Test',
    format: 'feature',
    titlePage: { title: 'TEST', author: 'Writer' },
    nodes,
    revision: { currentColor: 'white', version: 1, lockedSceneNumbers: false },
    language: { primary: 'en-US', direction: 'ltr' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = paginateScreenplay(doc);
  assert.ok(result.totalPages >= 2);

  // VIKTOR should be pushed to Page 2 to prevent being isolated at page bottom
  const charPage = result.nodePageMap['char-isolated'];
  assert.strictEqual(charPage, 2, 'Character cue should move to page 2 to prevent orphan at page bottom');
});

test('Screenplay Pagination: Orphan heading protection breaks slugline before page boundary', () => {
  // If only 1 or 2 lines remain, a scene heading must not be stranded alone at the bottom
  const nodes = [];
  for (let i = 0; i < 26; i++) {
    nodes.push({
      id: `act-pad-${i}`,
      type: 'action' as const,
      text: 'Action line setting the scene.',
    });
  }

  nodes.push({ id: 'sc-2', type: 'scene_heading' as const, text: 'EXT. STREET - NIGHT' });
  nodes.push({ id: 'ac-target', type: 'action' as const, text: 'Cars speed past under the rain.' });

  const doc: ScreenplayDocument = {
    id: 'test-orphan-heading',
    title: 'Orphan Heading Test',
    format: 'feature',
    titlePage: { title: 'TEST', author: 'Writer' },
    nodes,
    revision: { currentColor: 'white', version: 1, lockedSceneNumbers: false },
    language: { primary: 'en-US', direction: 'ltr' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = paginateScreenplay(doc);
  assert.ok(result.totalPages >= 2);

  // The second scene heading should be placed on Page 2, not stranded at the very bottom of Page 1
  const sc2Page = result.nodePageMap['sc-2'];
  assert.strictEqual(sc2Page, 2, 'Orphaned scene heading should break to page 2');
});
