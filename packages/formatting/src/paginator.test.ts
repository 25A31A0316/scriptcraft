import assert from 'node:assert';
import test from 'node:test';
import { paginateScreenplay, wrapText } from './paginator';
import { ScreenplayDocument } from '@screenplay/schema';

test('Screenplay Pagination: Wrap text calculation', () => {
  const text = 'This is a test of the line wrapping utility to see if it correctly breaks words without hyphenating.';
  const wrapped = wrapText(text, 30);
  assert.ok(wrapped.length > 1);
  for (const line of wrapped) {
    assert.ok(line.length <= 30);
  }
});

test('Screenplay Pagination: Dialogue split with (MORE) and (CONT\'D)', () => {
  // Create a doc that fills up to line 52 with action, then a long dialogue
  const nodes = [];
  // 50 lines of action
  for (let i = 0; i < 25; i++) {
    nodes.push({
      id: `act-${i}`,
      type: 'action' as const,
      text: 'Action line setting the scene.',
    });
  }

  // Character + Dialogue that won't fully fit on Page 1
  nodes.push({
    id: 'char-1',
    type: 'character' as const,
    text: 'SURESH',
  });
  nodes.push({
    id: 'dia-1',
    type: 'dialogue' as const,
    text: 'This is a very long speech. We need to test whether the engine splits the dialogue across page breaks. It should append MORE at the bottom of the first page and begin the next page with character name followed by CONT\'D.',
  });

  const doc: ScreenplayDocument = {
    id: 'test-doc',
    title: 'Test Split',
    format: 'feature',
    titlePage: { title: 'Test', credit: 'by', author: 'Author' },
    nodes,
    revision: { currentColor: 'white', version: 1, lockedSceneNumbers: false },
    language: { primary: 'en-US', direction: 'ltr' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = paginateScreenplay(doc);

  assert.ok(result.totalPages >= 2);
  const page1 = result.pages[0];
  const page2 = result.pages[1];

  assert.ok(page1);
  assert.ok(page2);

  // Check that Page 1 ends or contains (MORE)
  const hasMore = page1.lines.some(l => l.text === '(MORE)');
  assert.strictEqual(hasMore, true);

  // Check that Page 2 begins with SURESH (CONT'D)
  const hasContd = page2.lines.some(l => l.text.includes("SURESH (CONT'D)"));
  assert.strictEqual(hasContd, true);
});
