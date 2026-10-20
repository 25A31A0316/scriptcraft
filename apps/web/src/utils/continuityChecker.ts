import { ScreenplayDocument, ScreenplayNode } from '@screenplay/schema';

export interface ContinuityIssue {
  id: string;
  nodeId?: string;
  type: 'warning' | 'error' | 'info';
  category: 'slugline' | 'dialogue' | 'character' | 'structure';
  title: string;
  description: string;
  recommendation: string;
  sceneNumber?: string;
}

const COMMON_ENVIRONMENTS = ['INT.', 'EXT.', 'INT/EXT.', 'INT./EXT.', 'I/E.'];
const COMMON_TIMES_OF_DAY = [
  'DAY',
  'NIGHT',
  'DAWN',
  'DUSK',
  'CONTINUOUS',
  'LATER',
  'MOMENTS LATER',
  'SAME TIME',
  'SAME',
  'SUNSET',
  'SUNRISE',
  'EVENING',
  'MORNING',
  'AFTERNOON',
];

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function analyzeContinuity(doc: ScreenplayDocument): ContinuityIssue[] {
  const issues: ContinuityIssue[] = [];
  const nodes = doc.nodes || [];

  let currentSceneNumber = '1';
  let currentSceneHeading = '';
  let sceneIndex = 0;
  const characterCounts = new Map<string, number>();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nextNode: ScreenplayNode | undefined = nodes[i + 1];

    if (node.type === 'scene_heading') {
      sceneIndex++;
      currentSceneNumber = String(sceneIndex);
      currentSceneHeading = (node.text || '').toUpperCase().trim();

      // Check 1: Missing INT. or EXT.
      const hasValidEnv = COMMON_ENVIRONMENTS.some(env => currentSceneHeading.startsWith(env));
      if (!hasValidEnv) {
        issues.push({
          id: `slug-env-${node.id}`,
          nodeId: node.id,
          type: 'error',
          category: 'slugline',
          sceneNumber: currentSceneNumber,
          title: `Non-standard scene environment in Scene ${currentSceneNumber}`,
          description: `"${node.text}" does not begin with standard INT. or EXT.`,
          recommendation: `Begin with "INT." for interior or "EXT." for exterior locations so assistant directors can schedule lighting and equipment.`,
        });
      }

      // Check 2: Missing Time of Day (e.g. - DAY or - NIGHT)
      const hasTimeOfDay = COMMON_TIMES_OF_DAY.some(tod =>
        currentSceneHeading.includes(`- ${tod}`) || currentSceneHeading.includes(` - ${tod}`) || currentSceneHeading.endsWith(tod)
      );
      if (!hasTimeOfDay) {
        issues.push({
          id: `slug-tod-${node.id}`,
          nodeId: node.id,
          type: 'warning',
          category: 'slugline',
          sceneNumber: currentSceneNumber,
          title: `Missing time of day in Scene ${currentSceneNumber}`,
          description: `"${node.text}" has no specified time tag (e.g. - DAY, - NIGHT).`,
          recommendation: `Add a time indicator like "- DAY" or "- NIGHT" for cinematography call sheets and lighting breakdown.`,
        });
      }

      // Check 3: Empty Scene (Directly followed by another scene_heading)
      if (nextNode && nextNode.type === 'scene_heading') {
        issues.push({
          id: `empty-scene-${node.id}`,
          nodeId: node.id,
          type: 'warning',
          category: 'structure',
          sceneNumber: currentSceneNumber,
          title: `Empty Scene detected: Scene ${currentSceneNumber}`,
          description: `Scene ${currentSceneNumber} contains no action or dialogue before the next scene starts.`,
          recommendation: `Add a descriptive action line setting the scene or merge with adjacent scenes.`,
        });
      }
    } else if (node.type === 'character') {
      const charName = (node.text || '').trim().replace(/\(.*\)/, '').trim().toUpperCase();
      if (charName) {
        characterCounts.set(charName, (characterCounts.get(charName) || 0) + 1);
      }

      // Check 4: Orphaned Character Heading (no dialogue or parenthetical immediately following)
      if (!nextNode || (nextNode.type !== 'dialogue' && nextNode.type !== 'parenthetical')) {
        issues.push({
          id: `orphan-char-${node.id}`,
          nodeId: node.id,
          type: 'error',
          category: 'dialogue',
          sceneNumber: currentSceneNumber,
          title: `Orphaned Character Name: ${charName}`,
          description: `Character cue "${node.text}" is not followed by dialogue or parenthetical text.`,
          recommendation: `Add spoken dialogue or remove the isolated character element.`,
        });
      }
    } else if (node.type === 'parenthetical') {
      // Check 5: Orphaned Parenthetical (no dialogue immediately following)
      if (!nextNode || nextNode.type !== 'dialogue') {
        issues.push({
          id: `orphan-par-${node.id}`,
          nodeId: node.id,
          type: 'error',
          category: 'dialogue',
          sceneNumber: currentSceneNumber,
          title: `Orphaned Parenthetical in Scene ${currentSceneNumber}`,
          description: `Parenthetical "${node.text}" is not followed by spoken dialogue.`,
          recommendation: `Parentheticals should only exist immediately preceding the character's dialogue.`,
        });
      }
    }
  }

  // Check 6: Character name spelling inconsistencies / near-matches
  const characters = Array.from(characterCounts.keys());
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      const c1 = characters[i];
      const c2 = characters[j];
      if (c1.length > 3 && c2.length > 3) {
        const dist = levenshteinDistance(c1, c2);
        if (dist === 1 || dist === 2) {
          issues.push({
            id: `char-typo-${c1}-${c2}`,
            type: 'warning',
            category: 'character',
            title: `Potential Character Name Typo: "${c1}" vs "${c2}"`,
            description: `Found very similar character cues ("${c1}" [${characterCounts.get(c1)}x] and "${c2}" [${characterCounts.get(c2)}x]).`,
            recommendation: `Ensure spelling is consistent across the script to avoid splitting cast breakdown strips and dialogue records.`,
          });
        }
      }
    }
  }

  return issues;
}
