import React, { useMemo } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';
import { Hash, Clock, Users, ArrowRight } from 'lucide-react';

interface BeatBoardProps {
  document: ScreenplayDocument;
  onSelectScene: (sceneId: string) => void;
}

export interface BeatCardData {
  id: string;
  sceneNumber: string;
  heading: string;
  environment: string;
  timeOfDay: string;
  characters: string[];
  summary: string;
  actLabel: string;
  actColor: string;
  estimatedPages: string;
}

export const BeatBoard: React.FC<BeatBoardProps> = ({
  document,
  onSelectScene,
}) => {
  // Parse scenes and their content to create beat cards
  const beatCards = useMemo(() => {
    const cards: BeatCardData[] = [];
    let currentScene: BeatCardData | null = null;
    let sceneIndex = 1;

    for (let i = 0; i < document.nodes.length; i++) {
      const node = document.nodes[i];
      if (!node) continue;

      if (node.type === 'scene_heading') {
        const text = node.text || 'UNTITLED SCENE';
        const num = node.metadata?.sceneNumber || String(sceneIndex++);

        // Assign Act based on scene position
        let actLabel = 'Act 1: Setup';
        let actColor = '#3b82f6'; // Blue
        if (sceneIndex > 5 && sceneIndex <= 15) {
          actLabel = 'Act 2A: Conflict';
          actColor = '#f59e0b'; // Gold
        } else if (sceneIndex > 15 && sceneIndex <= 25) {
          actLabel = 'Act 2B: Crisis';
          actColor = '#ec4899'; // Pink
        } else if (sceneIndex > 25) {
          actLabel = 'Act 3: Climax';
          actColor = '#10b981'; // Green
        }

        const isExt = text.includes('EXT.');
        const isNight = text.includes('NIGHT');

        currentScene = {
          id: node.id,
          sceneNumber: num,
          heading: text,
          environment: isExt ? 'EXT.' : 'INT.',
          timeOfDay: isNight ? 'NIGHT' : 'DAY',
          characters: [],
          summary: '',
          actLabel,
          actColor,
          estimatedPages: '1/2 page',
        };
        cards.push(currentScene);
      } else if (currentScene) {
        if (node.type === 'character') {
          const name = node.text.replace(/\(.*\)/, '').trim().toUpperCase();
          if (name && !currentScene.characters.includes(name)) {
            currentScene.characters.push(name);
          }
        } else if (node.type === 'action' && !currentScene.summary) {
          currentScene.summary = node.text.slice(0, 140) + (node.text.length > 140 ? '...' : '');
        }
      }
    }

    return cards;
  }, [document.nodes]);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#0a0c10',
        padding: '2rem',
        overflowY: 'auto',
        height: '100%',
        userSelect: 'none',
      }}
    >
      {/* Board Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto 2rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
            BEAT BOARD & INDEX CARDS
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
            Visual story structure. Click any card to jump directly to that scene in the screenplay editor.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              padding: '4px 10px',
              borderRadius: '6px',
              color: 'var(--ink-muted)',
            }}
          >
            {beatCards.length} {beatCards.length === 1 ? 'Scene Beat' : 'Scene Beats'}
          </span>
        </div>
      </div>

      {/* Grid of Index Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {beatCards.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '4rem 2rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-sidebar)',
              borderRadius: '8px',
              border: '1px dashed var(--border-subtle)',
              color: 'var(--ink-muted)',
            }}
          >
            No scene headings in the screenplay yet. Add an `INT.` or `EXT.` slugline to start generating beat cards!
          </div>
        ) : (
          beatCards.map(card => (
            <div
              key={card.id}
              onClick={() => onSelectScene(card.id)}
              style={{
                backgroundColor: 'var(--bg-sidebar)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '200px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = card.actColor;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              {/* Top: Scene Number & Act Badge */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-script)',
                      fontWeight: 700,
                      fontSize: '12px',
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <Hash size={12} />
                    {card.sceneNumber}
                  </span>

                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: card.actColor,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      border: `1px solid ${card.actColor}33`,
                    }}
                  >
                    {card.actLabel}
                  </span>
                </div>

                {/* Slugline */}
                <h3
                  style={{
                    fontFamily: 'var(--font-script)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#fbbf24',
                    marginBottom: '10px',
                    lineHeight: 1.4,
                  }}
                >
                  {card.heading}
                </h3>

                {/* Synopsis / Beat Note */}
                <p
                  style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    lineHeight: 1.5,
                    marginBottom: '12px',
                  }}
                >
                  {card.summary || 'No action summary written yet.'}
                </p>
              </div>

              {/* Bottom: Characters and Jump hint */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {card.characters.length > 0 ? (
                    card.characters.slice(0, 3).map(char => (
                      <span
                        key={char}
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-script)',
                          backgroundColor: 'var(--bg-panel)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          color: '#38bdf8',
                        }}
                      >
                        {char}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--ink-dim)' }}>
                      No characters
                    </span>
                  )}
                  {card.characters.length > 3 && (
                    <span style={{ fontSize: '10px', color: 'var(--ink-dim)' }}>
                      +{card.characters.length - 3}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--ink-muted)',
                  }}
                >
                  <span>Edit</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
