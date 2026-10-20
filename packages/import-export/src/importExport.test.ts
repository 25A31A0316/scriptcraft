import assert from 'node:assert';
import test from 'node:test';
import { parseFountain, generateFountain } from './fountain';
import { parseFinalDraftXml, generateFinalDraftXml } from './finalDraft';
import { ScreenplayDocument } from '@screenplay/schema';

test('Fountain: Bidirectional Round-Trip', () => {
  const fountainSource = `Title: Peka Medalu
Author: Prasanth
Credit: Written by

===

INT. LIVING ROOM - NIGHT

A house of cards stands fragile on the table.

SURESH
(whispering)
ఈ ఇల్లు కూలిపోతుంది.

> CUT TO:
`;

  const doc = parseFountain(fountainSource);

  assert.strictEqual(doc.title, 'Peka Medalu');
  assert.strictEqual(doc.titlePage.author, 'Prasanth');
  assert.strictEqual(doc.nodes.length, 6);
  assert.strictEqual(doc.nodes[0]?.type, 'scene_heading');
  assert.strictEqual(doc.nodes[0]?.text, 'INT. LIVING ROOM - NIGHT');
  assert.strictEqual(doc.nodes[1]?.type, 'action');
  assert.strictEqual(doc.nodes[2]?.type, 'character');
  assert.strictEqual(doc.nodes[2]?.text, 'SURESH');
  assert.strictEqual(doc.nodes[3]?.type, 'parenthetical');
  assert.strictEqual(doc.nodes[3]?.text, '(whispering)');
  assert.strictEqual(doc.nodes[4]?.type, 'dialogue');
  assert.strictEqual(doc.nodes[4]?.text, 'ఈ ఇల్లు కూలిపోతుంది.');
  assert.strictEqual(doc.nodes[5]?.type, 'transition');

  // Generate Fountain
  const regenerated = generateFountain(doc);
  assert.ok(regenerated.includes('INT. LIVING ROOM - NIGHT'));
  assert.ok(regenerated.includes('ఈ ఇల్లు కూలిపోతుంది.'));
});

test('Final Draft XML (.fdx): Bidirectional Round-Trip', () => {
  const originalDoc: ScreenplayDocument = {
    id: 'doc-fdx',
    title: 'Final Draft Test',
    format: 'feature',
    titlePage: { title: 'FDX TEST', credit: 'by', author: 'Writer' },
    nodes: [
      { id: '1', type: 'scene_heading', text: 'INT. CAFE - DAY' },
      { id: '2', type: 'action', text: 'Coffee steams in a porcelain mug.' },
      { id: '3', type: 'character', text: 'ANNA' },
      { id: '4', type: 'dialogue', text: 'Are you ready?' },
      { id: '5', type: 'transition', text: 'FADE OUT.' },
    ],
    revision: { currentColor: 'white', version: 1, lockedSceneNumbers: false },
    language: { primary: 'en-US', direction: 'ltr' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const fdxXml = generateFinalDraftXml(originalDoc);
  assert.ok(fdxXml.includes('<FinalDraft DocumentType="Script"'));
  assert.ok(fdxXml.includes('<Paragraph Type="Scene Heading">'));
  assert.ok(fdxXml.includes('INT. CAFE - DAY'));
  assert.ok(fdxXml.includes('<Paragraph Type="Character">'));

  // Parse back
  const parsedDoc = parseFinalDraftXml(fdxXml);
  assert.strictEqual(parsedDoc.nodes.length, 5);
  assert.strictEqual(parsedDoc.nodes[0]?.type, 'scene_heading');
  assert.strictEqual(parsedDoc.nodes[0]?.text, 'INT. CAFE - DAY');
  assert.strictEqual(parsedDoc.nodes[2]?.type, 'character');
  assert.strictEqual(parsedDoc.nodes[2]?.text, 'ANNA');
  assert.strictEqual(parsedDoc.nodes[3]?.type, 'dialogue');
  assert.strictEqual(parsedDoc.nodes[3]?.text, 'Are you ready?');
});
