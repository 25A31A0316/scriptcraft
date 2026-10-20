import test from 'node:test';
import assert from 'node:assert';
import { ScreenplayDocument } from '@screenplay/schema';

// Mock localStorage in node environment
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
  get length() {
    return Object.keys(mockStorage).length;
  },
  key: (i: number) => Object.keys(mockStorage)[i] || null,
} as any;

import { storageManager } from './storageManager';

test('StorageManager: Creates, saves and loads document from storage', async () => {
  const newDoc = await storageManager.createDocument('Test ScriptCraft Feature', 'feature');
  assert.ok(newDoc.id.startsWith('scriptcraft-'));
  assert.strictEqual(newDoc.title, 'Test ScriptCraft Feature');
  assert.strictEqual(newDoc.format, 'feature');

  // Verify it can be loaded
  const loaded = await storageManager.loadDocument(newDoc.id);
  assert.ok(loaded);
  assert.strictEqual(loaded?.id, newDoc.id);
  assert.strictEqual(loaded?.title, 'Test ScriptCraft Feature');
});

test('StorageManager: Duplicates a screenplay with new stable ID and copy title', async () => {
  const original = await storageManager.createDocument('Original Master', 'feature');
  const duplicate = await storageManager.duplicateDocument(original.id);

  assert.notStrictEqual(duplicate.id, original.id);
  assert.strictEqual(duplicate.title, 'Original Master (Copy)');
  assert.strictEqual(duplicate.nodes.length, original.nodes.length);
  assert.notStrictEqual(duplicate.nodes[0]?.id, original.nodes[0]?.id);
});

test('StorageManager: Renames a screenplay and updates metadata', async () => {
  const doc = await storageManager.createDocument('Draft A', 'feature');
  await storageManager.renameDocument(doc.id, 'Draft Final Polish');

  const updated = await storageManager.loadDocument(doc.id);
  assert.strictEqual(updated?.title, 'Draft Final Polish');
  assert.strictEqual(updated?.titlePage.title, 'DRAFT FINAL POLISH');
});

test('StorageManager: Emergency flush synchronously backs up active document', () => {
  const emergencyDoc: ScreenplayDocument = {
    id: 'emergency-doc-999',
    title: 'Emergency Script',
    format: 'feature',
    titlePage: { title: 'EMERGENCY', author: 'Writer' },
    nodes: [{ id: 'n1', type: 'scene_heading', text: 'INT. BUNKER - NIGHT' }],
    revision: { currentColor: 'white', version: 1, lockedSceneNumbers: false },
    language: { primary: 'en-US', direction: 'ltr' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storageManager.flushSync(emergencyDoc);
  const raw = localStorage.getItem('scriptcraft_emergency_backup');
  assert.ok(raw);
  const parsed = JSON.parse(raw!);
  assert.strictEqual(parsed.id, 'emergency-doc-999');
  assert.strictEqual(parsed.title, 'Emergency Script');
});
