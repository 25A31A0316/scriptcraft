import { v4 as uuidv4 } from 'uuid';
import { ScreenplayDocument, ScreenplayNode } from '@screenplay/schema';

/**
 * Parses raw Fountain text into a canonical ScreenplayDocument
 */
export function parseFountain(fountainText: string): ScreenplayDocument {
  const lines = fountainText.replace(/\r\n/g, '\n').split('\n');
  const nodes: ScreenplayNode[] = [];

  let title = 'Untitled Screenplay';
  let author = 'Unknown';
  let credit = 'Written by';
  let draftDate = '';
  let contact = '';

  let inTitlePage = true;
  let i = 0;

  // 1. Parse Title Page metadata until blank line or "==="
  while (i < lines.length && inTitlePage) {
    const line = lines[i]?.trim() || '';
    if (line === '===' || line === '') {
      inTitlePage = false;
      i++;
      break;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim().toLowerCase();
      const val = line.slice(colonIdx + 1).trim();

      if (key === 'title') title = val.replace(/\*/g, '');
      else if (key === 'author' || key === 'authors') author = val;
      else if (key === 'credit') credit = val;
      else if (key === 'draft date') draftDate = val;
      else if (key === 'contact') contact = val;
    }
    i++;
  }

  // 2. Parse Screenplay body
  let lastWasCharacter = false;

  while (i < lines.length) {
    const rawLine = lines[i] || '';
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed === '===') {
      lastWasCharacter = false;
      i++;
      continue;
    }

    // SCENE HEADING
    // e.g. "INT. ", "EXT. ", "INT./EXT. ", or starting with "."
    const isSlugline =
      trimmed.startsWith('INT.') ||
      trimmed.startsWith('EXT.') ||
      trimmed.startsWith('INT./EXT.') ||
      trimmed.startsWith('EXT./INT.') ||
      trimmed.startsWith('I/E.') ||
      trimmed.startsWith('.');

    if (isSlugline) {
      const cleanText = trimmed.startsWith('.') ? trimmed.slice(1).trim() : trimmed;
      nodes.push({
        id: uuidv4(),
        type: 'scene_heading',
        text: cleanText.toUpperCase(),
      });
      lastWasCharacter = false;
      i++;
      continue;
    }

    // TRANSITION
    // e.g. starts with "> " or ends with "TO:"
    if (trimmed.startsWith('>') || (trimmed.endsWith('TO:') && trimmed === trimmed.toUpperCase())) {
      const cleanText = trimmed.startsWith('>') ? trimmed.slice(1).trim() : trimmed;
      nodes.push({
        id: uuidv4(),
        type: 'transition',
        text: cleanText.toUpperCase(),
      });
      lastWasCharacter = false;
      i++;
      continue;
    }

    // PARENTHETICAL
    // e.g. "(whispering)"
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      nodes.push({
        id: uuidv4(),
        type: 'parenthetical',
        text: trimmed,
      });
      lastWasCharacter = true; // Retain character state so next line is dialogue
      i++;
      continue;
    }

    // CHARACTER CUE
    // All caps, not preceded by character, short, or starting with "@"
    const isCharacter =
      trimmed.startsWith('@') ||
      (!lastWasCharacter &&
        trimmed === trimmed.toUpperCase() &&
        trimmed.length <= 40 &&
        !trimmed.includes('.') &&
        !trimmed.endsWith(':'));

    if (isCharacter) {
      const cleanName = trimmed.startsWith('@') ? trimmed.slice(1).trim() : trimmed;
      nodes.push({
        id: uuidv4(),
        type: 'character',
        text: cleanName.toUpperCase(),
      });
      lastWasCharacter = true;
      i++;
      continue;
    }

    // DIALOGUE (if immediately following character or parenthetical)
    if (lastWasCharacter) {
      nodes.push({
        id: uuidv4(),
        type: 'dialogue',
        text: trimmed,
      });
      i++;
      continue;
    }

    // Otherwise: ACTION
    nodes.push({
      id: uuidv4(),
      type: 'action',
      text: trimmed,
    });
    lastWasCharacter = false;
    i++;
  }

  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    title,
    format: 'feature',
    titlePage: {
      title: title.toUpperCase(),
      credit,
      author,
      draftDate,
      contact,
    },
    nodes,
    revision: {
      currentColor: 'white',
      version: 1,
      lockedSceneNumbers: false,
    },
    language: {
      primary: 'en-US',
      direction: 'ltr',
    },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Generates valid Fountain string from a canonical ScreenplayDocument
 */
export function generateFountain(doc: ScreenplayDocument): string {
  const parts: string[] = [];

  // Title Page
  if (doc.titlePage) {
    if (doc.titlePage.title) parts.push(`Title: ${doc.titlePage.title}`);
    if (doc.titlePage.credit) parts.push(`Credit: ${doc.titlePage.credit}`);
    if (doc.titlePage.author) parts.push(`Author: ${doc.titlePage.author}`);
    if (doc.titlePage.draftDate) parts.push(`Draft date: ${doc.titlePage.draftDate}`);
    if (doc.titlePage.contact) parts.push(`Contact: ${doc.titlePage.contact}`);
    parts.push('\n===\n');
  }

  for (const node of doc.nodes) {
    const text = node.text || '';
    switch (node.type) {
      case 'scene_heading':
        parts.push(`\n${text.toUpperCase()}\n`);
        break;
      case 'action':
        parts.push(`\n${text}\n`);
        break;
      case 'character':
        parts.push(`\n${text.toUpperCase()}`);
        break;
      case 'parenthetical':
        parts.push(`${text.startsWith('(') ? text : `(${text})`}`);
        break;
      case 'dialogue':
        parts.push(`${text}`);
        break;
      case 'transition':
        parts.push(`\n> ${text.toUpperCase()}\n`);
        break;
      case 'shot':
        parts.push(`\n${text.toUpperCase()}\n`);
        break;
      default:
        parts.push(`\n${text}\n`);
        break;
    }
  }

  return parts.join('\n');
}
