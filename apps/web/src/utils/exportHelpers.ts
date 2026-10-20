import { ScreenplayDocument } from '@screenplay/schema';

/**
 * Converts a canonical ScreenplayDocument to Fountain syntax string
 */
export function screenplayToFountain(doc: ScreenplayDocument): string {
  const lines: string[] = [];

  // Title Page
  if (doc.titlePage) {
    lines.push(`Title: ${doc.titlePage.title}`);
    if (doc.titlePage.credit) lines.push(`Credit: ${doc.titlePage.credit}`);
    if (doc.titlePage.author) lines.push(`Author: ${doc.titlePage.author}`);
    if (doc.titlePage.draftDate) lines.push(`Draft date: ${doc.titlePage.draftDate}`);
    if (doc.titlePage.contact) lines.push(`Contact: ${doc.titlePage.contact}`);
    lines.push('\n===\n');
  }

  // Script Nodes
  for (const node of doc.nodes) {
    const text = node.text || '';
    switch (node.type) {
      case 'scene_heading':
        lines.push(`\n${text.toUpperCase()}\n`);
        break;
      case 'action':
        lines.push(`\n${text}\n`);
        break;
      case 'character':
        lines.push(`\n${text.toUpperCase()}`);
        break;
      case 'parenthetical':
        lines.push(`${text.startsWith('(') ? text : `(${text})`}`);
        break;
      case 'dialogue':
        lines.push(`${text}`);
        break;
      case 'transition':
        lines.push(`\n> ${text.toUpperCase()}\n`);
        break;
      case 'shot':
        lines.push(`\n${text.toUpperCase()}\n`);
        break;
      default:
        lines.push(`\n${text}\n`);
        break;
    }
  }

  return lines.join('\n');
}

/**
 * Initiates a browser file download
 */
export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = filename;
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
