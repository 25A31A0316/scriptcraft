import React, { useMemo } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';
import { Users, BookOpen, MessageSquare } from 'lucide-react';

interface CharacterTrackerProps {
  document: ScreenplayDocument;
  isOpen: boolean;
}

export const CharacterTracker: React.FC<CharacterTrackerProps> = ({
  document,
  isOpen,
}) => {
  // Aggregate character cues & dialogue counts
  const characterStats = useMemo(() => {
    const map = new Map<string, { count: number; name: string }>();

    for (const node of document.nodes) {
      if (node.type === 'character') {
        const cleanName = node.text.replace(/\(.*\)/, '').trim().toUpperCase();
        if (cleanName) {
          const current = map.get(cleanName) || { count: 0, name: cleanName };
          current.count += 1;
          map.set(cleanName, current);
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [document.nodes]);

  const totalLines = characterStats.reduce((sum, c) => sum + c.count, 0);

  if (!isOpen) return null;

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} color="var(--accent-gold)" />
          <span style={{ fontWeight: 600, fontSize: '13px', letterSpacing: '0.04em' }}>
            CAST & DIALOGUE
          </span>
        </div>
        <span
          style={{
            fontSize: '11px',
            backgroundColor: 'var(--bg-panel)',
            padding: '2px 8px',
            borderRadius: '12px',
            color: 'var(--ink-muted)',
          }}
        >
          {characterStats.length} {characterStats.length === 1 ? 'character' : 'characters'}
        </span>
      </div>

      {/* Character List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {characterStats.length === 0 ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'var(--ink-dim)',
              fontSize: '12px',
            }}
          >
            No speaking characters yet. Hit Tab to add a Character cue!
          </div>
        ) : (
          characterStats.map(c => {
            const percentage = totalLines > 0 ? Math.round((c.count / totalLines) * 100) : 0;
            return (
              <div
                key={c.name}
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-script)',
                      fontWeight: 700,
                      fontSize: '13px',
                      color: '#38bdf8',
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--ink-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MessageSquare size={11} />
                    {c.count} {c.count === 1 ? 'cue' : 'cues'}
                  </span>
                </div>

                {/* Dialogue Percentage Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent-gold)',
                      borderRadius: '2px',
                    }}
                  />
                </div>
              </div>
            );
          })
        )}

        {/* Quick Beat Sheet / Structure Guide for Beginners */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '12px',
            backgroundColor: 'var(--bg-app)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '6px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-gold)',
              fontSize: '11px',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            <BookOpen size={13} />
            <span>WRITER'S CHEAT SHEET</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--ink-dim)', lineHeight: 1.4 }}>
            • <b>Tab</b>: Switch element (Action → Character → Transition)<br />
            • <b>Enter</b>: Next logical screenplay element<br />
            • <b>Backspace</b> on empty: Reverts to Action
          </p>
        </div>
      </div>
    </aside>
  );
};
