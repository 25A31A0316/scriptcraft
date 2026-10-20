import test from 'node:test';
import assert from 'node:assert';
import { validateScreenplayDocument, sanitizeScreenplayDocument } from './validation';
import { ScreenplayDocument } from './types';

test('Screenplay Schema Validation: Validates a canonical document', () => {
  const validDoc: ScreenplayDocument = {
    id: 'test-1',
    title: 'Valid Script',
    format: 'feature',
    titlePage: { title: 'VALID SCRIPT', author: 'Test' },
    nodes: [
      { id: 'n1', type: 'scene_heading', text: 'INT. OFFICE - DAY' },
      { id: 'n2', type: 'dialogue', text: 'Hello world.' },
    ],
    revision: { currentColor: 'white', version: 1, lockedSceneNumbers: false },
    language: { primary: 'en-US', direction: 'ltr' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = validateScreenplayDocument(validDoc);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

test('Screenplay Schema Validation: Rejects corrupted document without id or invalid types', () => {
  const invalidDoc = {
    title: 'Corrupted Script',
    format: 'invalid_format',
    nodes: [
      { id: '', type: 'non_existent_type', text: 123 },
    ],
  };

  const result = validateScreenplayDocument(invalidDoc);
  assert.strictEqual(result.valid, false);
  assert(result.errors.some(e => e.includes('Missing or invalid document "id"')));
  assert(result.errors.some(e => e.includes('Invalid format')));
  assert(result.errors.some(e => e.includes('invalid type')));
});

test('Screenplay Schema Sanitization: Safely repairs missing fields and IDs', () => {
  const partialDoc: any = {
    title: 'Draft Script',
    nodes: [
      { type: 'action', text: 'Action beats.' },
    ],
  };

  const sanitized = sanitizeScreenplayDocument(partialDoc);
  assert.strictEqual(sanitized.title, 'Draft Script');
  assert.strictEqual(sanitized.format, 'feature');
  assert.ok(sanitized.id.startsWith('doc-'));
  assert.strictEqual(sanitized.nodes.length, 1);
  assert.ok(sanitized.nodes[0].id.length > 0);
  assert.strictEqual(sanitized.nodes[0].type, 'action');
});
