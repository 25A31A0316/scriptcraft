import React, { useState } from 'react';
import { ScreenplayDocument, ScreenplayNode } from '@screenplay/schema';
import {
  Columns2,
  X,
  Check,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

interface DualDialogueModalProps {
  document: ScreenplayDocument;
  isOpen: boolean;
  onClose: () => void;
  onInsertDualDialogue: (nodes: ScreenplayNode[]) => void;
}

export const DualDialogueModal: React.FC<DualDialogueModalProps> = ({
  document,
  isOpen,
  onClose,
  onInsertDualDialogue,
}) => {
  const [leftChar, setLeftChar] = useState('SURESH');
  const [leftParenthetical, setLeftParenthetical] = useState('(overlapping)');
  const [leftDialogue, setLeftDialogue] = useState('నేను చెప్పేది ఒక్కసారి విను!');

  const [rightChar, setRightChar] = useState('ANAND');
  const [rightParenthetical, setRightParenthetical] = useState('(cutting in)');
  const [rightDialogue, setRightDialogue] = useState('ఇంకేం వినడానికి లేదు, అంతా అయిపోయింది!');

  if (!isOpen) return null;

  const handleInsert = () => {
    const timestamp = Date.now();
    const newNodes: ScreenplayNode[] = [
      // Left Character Cue
      {
        id: `dual-char-left-${timestamp}`,
        type: 'character',
        text: leftChar.toUpperCase().trim(),
        metadata: {
          isDualDialogue: true,
          dualSide: 'left',
        },
      },
      // Left Parenthetical if provided
      ...(leftParenthetical.trim()
        ? [
            {
              id: `dual-par-left-${timestamp}`,
              type: 'parenthetical' as const,
              text: leftParenthetical.startsWith('(') ? leftParenthetical.trim() : `(${leftParenthetical.trim()})`,
              metadata: {
                isDualDialogue: true,
                dualSide: 'left' as const,
              },
            },
          ]
        : []),
      // Left Dialogue
      {
        id: `dual-dia-left-${timestamp}`,
        type: 'dialogue',
        text: leftDialogue.trim(),
        metadata: {
          isDualDialogue: true,
          dualSide: 'left',
        },
      },
      // Right Character Cue
      {
        id: `dual-char-right-${timestamp}`,
        type: 'character',
        text: rightChar.toUpperCase().trim(),
        metadata: {
          isDualDialogue: true,
          dualSide: 'right',
        },
      },
      // Right Parenthetical if provided
      ...(rightParenthetical.trim()
        ? [
            {
              id: `dual-par-right-${timestamp}`,
              type: 'parenthetical' as const,
              text: rightParenthetical.startsWith('(') ? rightParenthetical.trim() : `(${rightParenthetical.trim()})`,
              metadata: {
                isDualDialogue: true,
                dualSide: 'right' as const,
              },
            },
          ]
        : []),
      // Right Dialogue
      {
        id: `dual-dia-right-${timestamp}`,
        type: 'dialogue',
        text: rightDialogue.trim(),
        metadata: {
          isDualDialogue: true,
          dualSide: 'right',
        },
      },
    ];

    onInsertDualDialogue(newNodes);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 60,
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
          width: '740px',
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
            <Columns2 size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
              DUAL DIALOGUE CREATOR (SIMULTANEOUS SPEECH)
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

        {/* Form Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>
            Hollywood standard for two characters speaking simultaneously (e.g. heated arguments or overlapping crosstalk).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Left Column (Character A) */}
            <div
              style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Column 1 (Left Character)
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Character Name</label>
                <input
                  type="text"
                  value={leftChar}
                  onChange={e => setLeftChar(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: '#f8fafc',
                    fontFamily: 'var(--font-script)',
                    fontWeight: 700,
                    fontSize: '13px',
                    marginTop: '2px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Parenthetical (Optional)</label>
                <input
                  type="text"
                  value={leftParenthetical}
                  onChange={e => setLeftParenthetical(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: 'var(--ink-primary)',
                    fontFamily: 'var(--font-script)',
                    fontSize: '12px',
                    marginTop: '2px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Dialogue</label>
                <textarea
                  rows={3}
                  value={leftDialogue}
                  onChange={e => setLeftDialogue(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-script)',
                    fontSize: '13px',
                    marginTop: '2px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
            </div>

            {/* Right Column (Character B) */}
            <div
              style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Column 2 (Right Character)
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Character Name</label>
                <input
                  type="text"
                  value={rightChar}
                  onChange={e => setRightChar(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: '#f8fafc',
                    fontFamily: 'var(--font-script)',
                    fontWeight: 700,
                    fontSize: '13px',
                    marginTop: '2px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Parenthetical (Optional)</label>
                <input
                  type="text"
                  value={rightParenthetical}
                  onChange={e => setRightParenthetical(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: 'var(--ink-primary)',
                    fontFamily: 'var(--font-script)',
                    fontSize: '12px',
                    marginTop: '2px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Dialogue</label>
                <textarea
                  rows={3}
                  value={rightDialogue}
                  onChange={e => setRightDialogue(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-script)',
                    fontSize: '13px',
                    marginTop: '2px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Live Formatting Preview */}
          <div
            style={{
              marginTop: '1.5rem',
              backgroundColor: 'var(--bg-panel)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Preview on Screenplay Page
            </div>

            <div className="screenplay-dual-dialogue-container">
              <div className="screenplay-dual-column">
                <div className="screenplay-character" style={{ color: '#38bdf8' }}>{leftChar.toUpperCase()}</div>
                {leftParenthetical && <div className="screenplay-parenthetical">{leftParenthetical}</div>}
                <div className="screenplay-dialogue">{leftDialogue}</div>
              </div>

              <div className="screenplay-dual-column">
                <div className="screenplay-character" style={{ color: '#f59e0b' }}>{rightChar.toUpperCase()}</div>
                {rightParenthetical && <div className="screenplay-parenthetical">{rightParenthetical}</div>}
                <div className="screenplay-dialogue">{rightDialogue}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-app)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '8px 14px',
              color: 'var(--ink-muted)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!leftDialogue.trim() || !rightDialogue.trim()}
            style={{
              backgroundColor: 'var(--accent-amber)',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: leftDialogue.trim() && rightDialogue.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Check size={14} />
            <span>Insert Dual Dialogue into Script</span>
          </button>
        </div>
      </div>
    </div>
  );
};
