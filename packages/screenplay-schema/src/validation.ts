import { ScreenplayDocument, ScreenplayElementType } from './types';

const VALID_ELEMENT_TYPES: Set<string> = new Set([
  'scene_heading',
  'action',
  'character',
  'parenthetical',
  'dialogue',
  'transition',
  'shot',
  'general',
]);

const VALID_FORMATS: Set<string> = new Set([
  'feature',
  'tv_half_hour',
  'tv_one_hour',
  'short_film',
  'stageplay',
]);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates whether an unknown object conforms to the ScreenplayDocument schema.
 * Rejects corrupt, malicious, or malformed data before loading into the application.
 */
export function validateScreenplayDocument(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Document must be a non-null JSON object'] };
  }

  const doc = data as Record<string, unknown>;

  if (typeof doc.id !== 'string' || !doc.id.trim()) {
    errors.push('Missing or invalid document "id" (must be a non-empty string)');
  }

  if (typeof doc.title !== 'string' || !doc.title.trim()) {
    errors.push('Missing or invalid document "title" (must be a non-empty string)');
  }

  if (typeof doc.format !== 'string' || !VALID_FORMATS.has(doc.format)) {
    errors.push(`Invalid format "${doc.format}". Must be one of: ${Array.from(VALID_FORMATS).join(', ')}`);
  }

  if (!Array.isArray(doc.nodes)) {
    errors.push('Document "nodes" must be an array');
  } else {
    doc.nodes.forEach((node: unknown, index: number) => {
      if (!node || typeof node !== 'object') {
        errors.push(`Node at index ${index} must be an object`);
        return;
      }
      const n = node as Record<string, unknown>;
      if (typeof n.id !== 'string' || !n.id.trim()) {
        errors.push(`Node at index ${index} is missing a valid "id"`);
      }
      if (typeof n.type !== 'string' || !VALID_ELEMENT_TYPES.has(n.type)) {
        errors.push(`Node at index ${index} has invalid type "${n.type}"`);
      }
      if (typeof n.text !== 'string') {
        errors.push(`Node at index ${index} text must be a string`);
      }
    });
  }

  if (doc.revision && typeof doc.revision === 'object') {
    const rev = doc.revision as Record<string, unknown>;
    if (typeof rev.version !== 'number' && typeof rev.version !== 'undefined') {
      errors.push('Revision "version" must be a number');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes and normalizes an incoming screenplay document, repairing minor issues if possible.
 */
export function sanitizeScreenplayDocument(doc: ScreenplayDocument): ScreenplayDocument {
  return {
    ...doc,
    id: doc.id || `doc-${Date.now()}`,
    title: (doc.title || 'Untitled Screenplay').trim(),
    format: VALID_FORMATS.has(doc.format) ? doc.format : 'feature',
    titlePage: {
      title: (doc.titlePage?.title || doc.title || 'UNTITLED').toUpperCase(),
      credit: doc.titlePage?.credit || 'Written by',
      author: doc.titlePage?.author || 'Unknown',
      draftDate: doc.titlePage?.draftDate || new Date().toLocaleDateString(),
      contact: doc.titlePage?.contact || '',
    },
    nodes: Array.isArray(doc.nodes)
      ? doc.nodes.map((node, idx) => ({
          id: node.id || `node-${idx}-${Math.random().toString(36).slice(2, 7)}`,
          type: VALID_ELEMENT_TYPES.has(node.type) ? node.type : ('action' as ScreenplayElementType),
          text: typeof node.text === 'string' ? node.text : '',
          metadata: node.metadata || {},
        }))
      : [],
    revision: {
      currentColor: doc.revision?.currentColor || 'white',
      version: typeof doc.revision?.version === 'number' ? doc.revision.version : 1,
      lockedSceneNumbers: !!doc.revision?.lockedSceneNumbers,
    },
    language: {
      primary: doc.language?.primary || 'en-US',
      secondary: doc.language?.secondary,
      direction: doc.language?.direction || 'ltr',
    },
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
