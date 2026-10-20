import React, { useState } from 'react';
import { ScreenplayDocument, RevisionColor } from '@screenplay/schema';
import {
  Palette,
  Lock,
  Unlock,
  History,
  RotateCcw,
  Check,
  X,
  Bookmark,
} from 'lucide-react';

export const REVISION_DRAFTS: { color: RevisionColor; label: string; hex: string; bg: string }[] = [
  { color: 'white', label: 'White (Production 1st)', hex: '#f8fafc', bg: '#334155' },
  { color: 'blue', label: 'Blue Revision (1st)', hex: '#60a5fa', bg: '#1e3a8a' },
  { color: 'pink', label: 'Pink Revision (2nd)', hex: '#f472b6', bg: '#831843' },
  { color: 'yellow', label: 'Yellow Revision (3rd)', hex: '#facc15', bg: '#713f12' },
  { color: 'green', label: 'Green Revision (4th)', hex: '#4ade80', bg: '#14532d' },
  { color: 'goldenrod', label: 'Goldenrod Revision (5th)', hex: '#fb923c', bg: '#7c2d12' },
  { color: 'buff', label: 'Buff Revision (6th)', hex: '#fbbf24', bg: '#78350f' },
  { color: 'salmon', label: 'Salmon Revision (7th)', hex: '#fda4af', bg: '#881337' },
  { color: 'cherry', label: 'Cherry Revision (8th)', hex: '#f43f5e', bg: '#4c0519' },
];

interface RevisionManagerProps {
  document: ScreenplayDocument;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRevision: (updatedDoc: ScreenplayDocument) => void;
}

export const RevisionManager: React.FC<RevisionManagerProps> = ({
  document,
  isOpen,
  onClose,
  onUpdateRevision,
}) => {
  const [snapshotName, setSnapshotName] = useState('');
  const [localHistory, setLocalHistory] = useState<
    { id: string; name: string; date: string; doc: ScreenplayDocument }[]
  >(() => {
    try {
      const saved = localStorage.getItem('scriptcraft_named_revisions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  const currentRevisionColor = document.revision?.currentColor || 'white';
  const isLocked = document.revision?.lockedSceneNumbers || false;

  const handleSelectColor = (color: RevisionColor) => {
    const updated: ScreenplayDocument = {
      ...document,
      revision: {
        ...document.revision,
        currentColor: color,
        version: (document.revision?.version || 1) + 1,
      },
    };
    onUpdateRevision(updated);
  };

  const handleToggleLock = () => {
    const updated: ScreenplayDocument = {
      ...document,
      revision: {
        ...document.revision,
        lockedSceneNumbers: !isLocked,
      },
    };
    onUpdateRevision(updated);
  };

  const handleCreateNamedSnapshot = () => {
    if (!snapshotName.trim()) return;
    const newEntry = {
      id: `snap-${Date.now()}`,
      name: snapshotName.trim(),
      date: new Date().toLocaleString(),
      doc: JSON.parse(JSON.stringify(document)),
    };
    const updated = [newEntry, ...localHistory];
    setLocalHistory(updated);
    localStorage.setItem('scriptcraft_named_revisions', JSON.stringify(updated));
    setSnapshotName('');
  };

  const handleRestoreSnapshot = (savedDoc: ScreenplayDocument) => {
    if (confirm(`Restore revision "${savedDoc.title}"? Your current draft will be safely backed up.`)) {
      onUpdateRevision(savedDoc);
      onClose();
    }
  };

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
          width: '560px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
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
            <Palette size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
              PRODUCTION REVISION DRAFTS & HISTORY
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

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Section 1: Revision Draft Color */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Current Production Draft Color (Hollywood Standard)
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {REVISION_DRAFTS.map(draft => {
                const isSelected = currentRevisionColor === draft.color;
                return (
                  <button
                    key={draft.color}
                    onClick={() => handleSelectColor(draft.color)}
                    style={{
                      backgroundColor: isSelected ? draft.bg : 'var(--bg-panel)',
                      border: isSelected ? `2px solid ${draft.hex}` : '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: draft.hex,
                        boxShadow: `0 0 8px ${draft.hex}66`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#ffffff' : 'var(--ink-primary)',
                      }}
                    >
                      {draft.label.split(' ')[0]}
                    </span>
                    {isSelected && <Check size={12} color="#ffffff" style={{ marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Locked Scene Numbers */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isLocked ? <Lock size={15} color="#f59e0b" /> : <Unlock size={15} color="var(--ink-muted)" />}
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                  Lock Scene Numbers (Shooting Script)
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--ink-dim)', marginTop: '2px' }}>
                When locked, new scenes inserted receive alphanumeric IDs (e.g. Scene 1A, 1B).
              </p>
            </div>

            <button
              onClick={handleToggleLock}
              style={{
                backgroundColor: isLocked ? 'var(--accent-amber)' : 'var(--bg-panel)',
                color: isLocked ? '#000000' : 'var(--ink-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>

          {/* Section 3: Save Named Snapshot */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Create Milestone Snapshot
            </label>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. First Polish with Director notes..."
                value={snapshotName}
                onChange={e => setSnapshotName(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: 'var(--ink-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCreateNamedSnapshot}
                disabled={!snapshotName.trim()}
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  color: snapshotName.trim() ? 'var(--accent-gold)' : 'var(--ink-dim)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: snapshotName.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Bookmark size={13} />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Section 4: Named Snapshots History List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <History size={14} color="var(--accent-gold)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                Saved Milestone Versions ({localHistory.length})
              </span>
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              {localHistory.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--ink-dim)', fontSize: '12px' }}>
                  No named milestones saved yet. Use the field above to bookmark a draft!
                </div>
              ) : (
                localHistory.map(item => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      marginBottom: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-dim)' }}>
                        {item.date} • {item.doc.nodes?.length || 0} blocks
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreSnapshot(item.doc)}
                      title="Restore this revision"
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        color: '#38bdf8',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <RotateCcw size={11} />
                      <span>Restore</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
