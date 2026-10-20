import assert from 'node:assert';
import test from 'node:test';
import {
  screenplayDocumentToTiptap,
  tiptapToScreenplayDocument,
} from './serializer';
import { ScreenplayDocument } from '@screenplay/schema';

test('Screenplay Serializer: Full Round-Trip Preservation', () => {
  const sampleDoc: ScreenplayDocument = {
    id: 'doc-123',
    title: 'Peka Medalu',
    format: 'feature',
    titlePage: {
      title: 'Peka Medalu',
      credit: 'written by',
      author: 'Prasanth',
      draftDate: 'October 2026',
    },
    nodes: [
      {
        id: 'node-1',
        type: 'scene_heading',
        text: 'INT. LIVING ROOM - NIGHT',
        metadata: {
          sceneNumber: '1',
          environment: 'INT.',
          location: 'LIVING ROOM',
          timeOfDay: 'NIGHT',
        },
      },
      {
        id: 'node-2',
        type: 'action',
        text: 'A fragile house of cards rests on the coffee table.',
      },
      {
        id: 'node-3',
        type: 'character',
        text: 'SURESH',
        metadata: {
          characterName: 'SURESH',
        },
      },
      {
        id: 'node-4',
        type: 'parenthetical',
        text: '(whispering in Telugu)',
      },
      {
        id: 'node-5',
        type: 'dialogue',
        text: 'ఈ ఇల్లు ఎక్కువ కాలం నిలబడదు.',
      },
    ],
    revision: {
      currentColor: 'white',
      version: 1,
      lockedSceneNumbers: false,
    },
    language: {
      primary: 'te-IN',
      direction: 'ltr',
    },
    createdAt: '2026-10-20T20:00:00Z',
    updatedAt: '2026-10-20T20:00:00Z',
  };

  // Convert to TipTap JSON
  const tiptapJson = screenplayDocumentToTiptap(sampleDoc);

  assert.strictEqual(tiptapJson.type, 'doc');
  assert.strictEqual(tiptapJson.content?.length, 5);
  assert.strictEqual(tiptapJson.content[0]?.type, 'scene_heading');
  assert.strictEqual(tiptapJson.content[0]?.content?.[0]?.text, 'INT. LIVING ROOM - NIGHT');
  assert.strictEqual(tiptapJson.content[4]?.type, 'dialogue');
  assert.strictEqual(tiptapJson.content[4]?.content?.[0]?.text, 'ఈ ఇల్లు ఎక్కువ కాలం నిలబడదు.');

  // Convert back to ScreenplayDocument
  const roundTripped = tiptapToScreenplayDocument(tiptapJson, sampleDoc);

  assert.strictEqual(roundTripped.title, 'Peka Medalu');
  assert.strictEqual(roundTripped.nodes.length, 5);
  assert.strictEqual(roundTripped.nodes[0]?.type, 'scene_heading');
  assert.strictEqual(roundTripped.nodes[0]?.text, 'INT. LIVING ROOM - NIGHT');
  assert.strictEqual(roundTripped.nodes[2]?.type, 'character');
  assert.strictEqual(roundTripped.nodes[2]?.text, 'SURESH');
  assert.strictEqual(roundTripped.nodes[4]?.type, 'dialogue');
  assert.strictEqual(roundTripped.nodes[4]?.text, 'ఈ ఇల్లు ఎక్కువ కాలం నిలబడదు.');
});
