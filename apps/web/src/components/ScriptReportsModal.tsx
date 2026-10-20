import React, { useMemo } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';
import { paginateScreenplay } from '@screenplay/formatting';
import {
  BarChart3,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface ScriptReportsModalProps {
  document: ScreenplayDocument;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Formats a raw line count into Hollywood eighths of a page (e.g. "3/8", "1 4/8")
 */
function formatEighths(lines: number): string {
  const eighths = Math.max(1, Math.round((lines / 54) * 8));
  const fullPages = Math.floor(eighths / 8);
  const remEighths = eighths % 8;

  if (fullPages === 0) {
    return `${remEighths}/8 pgs`;
  } else if (remEighths === 0) {
    return `${fullPages} pgs`;
  }
  return `${fullPages} ${remEighths}/8 pgs`;
}

export const ScriptReportsModal: React.FC<ScriptReportsModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const pagination = useMemo(() => paginateScreenplay(document), [document]);

  // Analyze Scene Lengths in Eighths
  const sceneReports = useMemo(() => {
    const list: { id: string; sceneNumber: string; heading: string; lines: number; eighths: string }[] = [];
    let currentHeading = '';
    let currentId = '';
    let currentLines = 0;
    let idx = 1;

    for (const node of document.nodes) {
      if (node.type === 'scene_heading') {
        if (currentHeading) {
          list.push({
            id: currentId,
            sceneNumber: String(idx++),
            heading: currentHeading,
            lines: currentLines,
            eighths: formatEighths(currentLines),
          });
        }
        currentHeading = node.text || 'UNTITLED SCENE';
        currentId = node.id;
        currentLines = 3; // slugline + blank lines
      } else {
        const textLen = (node.text || '').length;
        const estimatedLines = Math.max(1, Math.ceil(textLen / 50));
        currentLines += estimatedLines;
      }
    }

    if (currentHeading) {
      list.push({
        id: currentId,
        sceneNumber: String(idx),
        heading: currentHeading,
        lines: currentLines,
        eighths: formatEighths(currentLines),
      });
    }

    return list;
  }, [document.nodes]);

  // Monologue Detector (Dialogue blocks with >= 6 lines or > 200 characters)
  const monologues = useMemo(() => {
    const found: { character: string; text: string; length: number }[] = [];
    let lastCharacter = 'CHARACTER';

    for (const node of document.nodes) {
      if (node.type === 'character') {
        lastCharacter = node.text.replace(/\(.*\)/, '').trim().toUpperCase();
      } else if (node.type === 'dialogue') {
        const text = node.text || '';
        const lines = Math.ceil(text.length / 35);
        if (lines >= 5 || text.length >= 180) {
          found.push({
            character: lastCharacter,
            text,
            length: lines,
          });
        }
      }
    }
    return found;
  }, [document.nodes]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          width: '680px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
              SCENE PAGE-COUNT (EIGHTHS) & SCRIPT REPORTS
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Summary Box */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>TOTAL PAGES</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {pagination.totalPages} pgs
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>TOTAL SCENES</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8' }}>
                {sceneReports.length} scenes
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>EXTENDED SPEECHES</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#f472b6' }}>
                {monologues.length} monologues
              </div>
            </div>
          </div>

          {/* Section 1: Scene Lengths in Eighths */}
          <div style={{ marginBottom: '2rem' }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              Scene Length Breakdown (in Eighths of a Page)
            </h4>

            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--ink-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>SCENE #</th>
                    <th style={{ padding: '8px 12px' }}>SLUGLINE</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>PAGE FRACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {sceneReports.map(sc => (
                    <tr key={sc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'var(--font-script)', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        #{sc.sceneNumber}
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'var(--font-script)', color: '#f1f5f9' }}>
                        {sc.heading}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                        {sc.eighths}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Monologue / Long Speech Detector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <AlertCircle size={14} color="#f472b6" />
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                Monologue / Long Speech Analysis ({monologues.length})
              </h4>
            </div>

            {monologues.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--ink-dim)', fontSize: '12px', border: '1px dashed var(--border-subtle)', borderRadius: '6px' }}>
                No speeches exceeding 5 lines detected. Dialogue pacing is balanced.
              </div>
            ) : (
              monologues.map((m, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-script)', fontWeight: 700, color: '#38bdf8', fontSize: '12px' }}>
                      {m.character}
                    </span>
                    <span style={{ fontSize: '11px', color: '#f472b6' }}>
                      ~{m.length} lines (~{Math.round(m.length * 1.5)} seconds)
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-script)', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.4 }}>
                    "{m.text}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
