import { JSONContent } from '@tiptap/core';
import { v4 as uuidv4 } from 'uuid';
import {
  ScreenplayDocument,
  ScreenplayNode,
  ScreenplayElementType,
} from '@screenplay/schema';

/**
 * Serializes a TipTap document JSON tree to a canonical ScreenplayDocument model
 */
export function tiptapToScreenplayDocument(
  tiptapJson: JSONContent,
  baseDoc?: Partial<ScreenplayDocument>
): ScreenplayDocument {
  const nodes: ScreenplayNode[] = [];
  const rawNodes = tiptapJson.content || [];

  for (const raw of rawNodes) {
    const type = (raw.type || 'action') as ScreenplayElementType;
    const attrs = raw.attrs || {};
    const textContent = (raw.content || [])
      .map(child => child.text || '')
      .join('');

    nodes.push({
      id: attrs.id || uuidv4(),
      type,
      text: textContent,
      metadata: attrs,
    });
  }

  const now = new Date().toISOString();

  return {
    id: baseDoc?.id || uuidv4(),
    title: baseDoc?.title || 'Untitled Screenplay',
    format: baseDoc?.format || 'feature',
    titlePage: baseDoc?.titlePage || {
      title: baseDoc?.title || 'Untitled Screenplay',
      credit: 'written by',
      author: 'Unknown Author',
    },
    nodes,
    revision: baseDoc?.revision || {
      currentColor: 'white',
      version: 1,
      lockedSceneNumbers: false,
    },
    language: baseDoc?.language || {
      primary: 'en-US',
      direction: 'ltr',
    },
    createdAt: baseDoc?.createdAt || now,
    updatedAt: now,
  };
}

/**
 * Deserializes a canonical ScreenplayDocument into TipTap JSON Content
 */
export function screenplayDocumentToTiptap(
  doc: ScreenplayDocument
): JSONContent {
  const content: JSONContent[] = doc.nodes.map((node: ScreenplayNode) => {
    return {
      type: node.type,
      attrs: {
        id: node.id,
        ...(node.metadata || {}),
      },
      content: node.text
        ? [
            {
              type: 'text',
              text: node.text,
            },
          ]
        : [],
    };
  });

  return {
    type: 'doc',
    content: content.length > 0 ? content : [
      {
        type: 'scene_heading',
        attrs: { id: uuidv4() },
        content: [{ type: 'text', text: 'INT. UNTITLED SCENE - DAY' }],
      },
      {
        type: 'action',
        attrs: { id: uuidv4() },
      },
    ],
  };
}
