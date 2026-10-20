import { v4 as uuidv4 } from 'uuid';
import { ScreenplayDocument, ScreenplayNode, ScreenplayElementType } from '@screenplay/schema';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function unescapeXml(safe: string): string {
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Generates industry-standard Final Draft XML (.fdx) format
 */
export function generateFinalDraftXml(doc: ScreenplayDocument): string {
  const typeMap: Record<ScreenplayElementType, string> = {
    scene_heading: 'Scene Heading',
    action: 'Action',
    character: 'Character',
    parenthetical: 'Parenthetical',
    dialogue: 'Dialogue',
    transition: 'Transition',
    shot: 'Shot',
    general: 'General',
  };

  const paragraphsXml: string[] = [];

  for (const node of doc.nodes) {
    const fdxType = typeMap[node.type] || 'Action';
    const textContent = escapeXml(node.text || '');

    paragraphsXml.push(`    <Paragraph Type="${fdxType}">
      <Text>${textContent}</Text>
    </Paragraph>`);
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>
${paragraphsXml.join('\n')}
  </Content>
  <HeaderAndFooter>
    <Header>
      <Paragraph Alignment="Right">
        <Text></Text>
      </Paragraph>
    </Header>
  </HeaderAndFooter>
</FinalDraft>`;
}

/**
 * Parses Final Draft XML (.fdx) format into a canonical ScreenplayDocument
 */
export function parseFinalDraftXml(xmlContent: string): ScreenplayDocument {
  const nodes: ScreenplayNode[] = [];

  // Match all <Paragraph Type="..."> ... <Text>...</Text> </Paragraph> blocks
  const paragraphRegex = /<Paragraph\s+Type="([^"]+)">([\s\S]*?)<\/Paragraph>/gi;
  let match: RegExpExecArray | null;

  const reverseTypeMap: Record<string, ScreenplayElementType> = {
    'scene heading': 'scene_heading',
    action: 'action',
    character: 'character',
    parenthetical: 'parenthetical',
    dialogue: 'dialogue',
    transition: 'transition',
    shot: 'shot',
    general: 'general',
  };

  while ((match = paragraphRegex.exec(xmlContent)) !== null) {
    const rawType = (match[1] || 'Action').toLowerCase();
    const innerContent = match[2] || '';

    // Extract all text inside <Text>...</Text> tags
    const textMatches = innerContent.match(/<Text[^>]*>([\s\S]*?)<\/Text>/gi) || [];
    const textParts = textMatches.map(t => {
      const stripped = t.replace(/<[^>]+>/g, '');
      return unescapeXml(stripped);
    });

    const fullText = textParts.join('').trim();
    if (fullText) {
      const mappedType = reverseTypeMap[rawType] || 'action';
      nodes.push({
        id: uuidv4(),
        type: mappedType,
        text: mappedType === 'scene_heading' || mappedType === 'character' || mappedType === 'transition'
          ? fullText.toUpperCase()
          : fullText,
      });
    }
  }

  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    title: 'Imported Final Draft Script',
    format: 'feature',
    titlePage: {
      title: 'UNTITLED',
      credit: 'Written by',
      author: 'Unknown',
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
