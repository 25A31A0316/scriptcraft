import { ScreenplayDocument, ScreenplayElementType } from '@screenplay/schema';

export const LINES_PER_PAGE = 54;

export interface PaginatedLine {
  nodeId: string;
  type: ScreenplayElementType;
  text: string;
  pageNumber: number;
  lineOnPage: number;
  isSplitMore?: boolean;
  isSplitContd?: boolean;
}

export interface ScreenplayPage {
  pageNumber: number;
  lines: PaginatedLine[];
}

export interface ScreenplayPaginationResult {
  totalPages: number;
  pages: ScreenplayPage[];
  nodePageMap: Record<string, number>;
}

/**
 * Wraps text into lines based on maximum character width
 */
export function wrapText(text: string, maxChars: number): string[] {
  if (!text.trim()) return [''];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxChars) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Calculates page boundaries and handles dialogue splitting across pages
 */
export function paginateScreenplay(doc: ScreenplayDocument): ScreenplayPaginationResult {
  const pages: ScreenplayPage[] = [];
  const nodePageMap: Record<string, number> = {};

  let currentPageNumber = 1;
  let currentLines: PaginatedLine[] = [];
  let currentLineOnPage = 1;

  const pushLine = (
    nodeId: string,
    type: ScreenplayElementType,
    text: string,
    extra?: { isSplitMore?: boolean; isSplitContd?: boolean }
  ) => {
    if (currentLineOnPage > LINES_PER_PAGE) {
      pages.push({
        pageNumber: currentPageNumber,
        lines: currentLines,
      });
      currentPageNumber++;
      currentLines = [];
      currentLineOnPage = 1;
    }

    currentLines.push({
      nodeId,
      type,
      text,
      pageNumber: currentPageNumber,
      lineOnPage: currentLineOnPage,
      ...extra,
    });

    nodePageMap[nodeId] = currentPageNumber;
    currentLineOnPage++;
  };

  const getRemainingLinesOnPage = () => LINES_PER_PAGE - currentLineOnPage + 1;

  for (let i = 0; i < doc.nodes.length; i++) {
    const node = doc.nodes[i];
    if (!node) continue;

    const rawText = node.text || '';

    switch (node.type) {
      case 'scene_heading': {
        // Scene heading requires 2 lines before + 1 heading line + 1 line after
        // If remaining lines < 3, break to next page to prevent orphan slugline
        if (getRemainingLinesOnPage() < 3 && currentLines.length > 0) {
          pages.push({
            pageNumber: currentPageNumber,
            lines: currentLines,
          });
          currentPageNumber++;
          currentLines = [];
          currentLineOnPage = 1;
        }

        // Blank lines before
        if (currentLines.length > 0) {
          pushLine(node.id, 'general', '');
        }

        const wrapped = wrapText(rawText.toUpperCase(), 60);
        for (const line of wrapped) {
          pushLine(node.id, 'scene_heading', line);
        }
        pushLine(node.id, 'general', '');
        break;
      }

      case 'action': {
        const wrapped = wrapText(rawText, 60);
        for (const line of wrapped) {
          pushLine(node.id, 'action', line);
        }
        pushLine(node.id, 'general', '');
        break;
      }

      case 'character': {
        // Orphan protection: Character cue must have at least 1 line of dialogue
        // on the same page. If only 1 line remains, push character to next page.
        if (getRemainingLinesOnPage() <= 2) {
          pages.push({
            pageNumber: currentPageNumber,
            lines: currentLines,
          });
          currentPageNumber++;
          currentLines = [];
          currentLineOnPage = 1;
        }

        pushLine(node.id, 'character', rawText.toUpperCase());
        break;
      }

      case 'parenthetical': {
        const clean = rawText.startsWith('(') ? rawText : `(${rawText})`;
        const wrapped = wrapText(clean, 25);
        for (const line of wrapped) {
          pushLine(node.id, 'parenthetical', line);
        }
        break;
      }

      case 'dialogue': {
        const wrapped = wrapText(rawText, 35);
        const remaining = getRemainingLinesOnPage();

        if (wrapped.length > remaining && remaining >= 2) {
          // Dialogue splits across page break!
          // Put what fits on current page, append (MORE)
          const fitCount = remaining - 1; // Leave 1 line for (MORE)
          for (let j = 0; j < fitCount; j++) {
            pushLine(node.id, 'dialogue', wrapped[j] || '');
          }
          pushLine(node.id, 'parenthetical', '(MORE)', { isSplitMore: true });

          // Next page starts
          pages.push({
            pageNumber: currentPageNumber,
            lines: currentLines,
          });
          currentPageNumber++;
          currentLines = [];
          currentLineOnPage = 1;

          // Find preceding character name
          let charName = 'CHARACTER';
          for (let k = i - 1; k >= 0; k--) {
            if (doc.nodes[k]?.type === 'character') {
              charName = doc.nodes[k]?.text.toUpperCase().replace(/\(.*\)/, '').trim() || 'CHARACTER';
              break;
            }
          }

          // Top of next page: CHARACTER (CONT'D)
          pushLine(node.id, 'character', `${charName} (CONT'D)`, { isSplitContd: true });

          // Remaining lines of dialogue
          for (let j = fitCount; j < wrapped.length; j++) {
            pushLine(node.id, 'dialogue', wrapped[j] || '');
          }
        } else {
          for (const line of wrapped) {
            pushLine(node.id, 'dialogue', line);
          }
        }
        pushLine(node.id, 'general', '');
        break;
      }

      case 'transition': {
        if (getRemainingLinesOnPage() < 2) {
          pages.push({
            pageNumber: currentPageNumber,
            lines: currentLines,
          });
          currentPageNumber++;
          currentLines = [];
          currentLineOnPage = 1;
        }
        pushLine(node.id, 'transition', rawText.toUpperCase());
        pushLine(node.id, 'general', '');
        break;
      }

      default: {
        const wrapped = wrapText(rawText, 60);
        for (const line of wrapped) {
          pushLine(node.id, node.type, line);
        }
        break;
      }
    }
  }

  // Push final page if it has lines
  if (currentLines.length > 0) {
    pages.push({
      pageNumber: currentPageNumber,
      lines: currentLines,
    });
  }

  return {
    totalPages: Math.max(1, pages.length),
    pages,
    nodePageMap,
  };
}
