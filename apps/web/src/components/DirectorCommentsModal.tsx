import React, { useState } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';
import {
  MessageSquare,
  CheckCircle2,
  Circle,
  Plus,
  X,
  Trash2,
  ArrowRight,
  Filter,
} from 'lucide-react';

export interface ScriptComment {
  id: string;
  sceneId: string;
  sceneHeading: string;
  author: string;
  role: 'Director' | 'Writer' | 'Producer' | 'Cinematographer';
  category: 'Direction' | 'Polish' | 'Camera' | 'Audio/Music' | 'General';
  text: string;
  resolved: boolean;
  createdAt: string;
}

interface DirectorCommentsModalProps {
  document: ScreenplayDocument;
  isOpen: boolean;
  onClose: () => void;
  onSelectScene?: (sceneId: string) => void;
}

export const DirectorCommentsModal: React.FC<DirectorCommentsModalProps> = ({
  document,
  isOpen,
  onClose,
  onSelectScene,
}) => {
  // Extract all scene headings for dropdown
  const scenes = document.nodes
    .filter(n => n.type === 'scene_heading')
    .map((n, idx) => ({
      id: n.id,
      number: String(idx + 1),
      heading: n.text || `Scene ${idx + 1}`,
    }));

  const [comments, setComments] = useState<ScriptComment[]>(() => {
    try {
      const saved = localStorage.getItem('scriptcraft_comments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'comm-1',
        sceneId: scenes[0]?.id || 'node-sc-1',
        sceneHeading: scenes[0]?.heading || 'INT. LIVING ROOM - NIGHT',
        author: 'Prasanth',
        role: 'Director',
        category: 'Camera',
        text: 'Macro slow dolly towards the antique bronze key on table as fan creaks.',
        resolved: false,
        createdAt: 'Oct 20, 2026, 8:40 PM',
      },
      {
        id: 'comm-2',
        sceneId: scenes[1]?.id || 'node-sc-2',
        sceneHeading: scenes[1]?.heading || 'EXT. BALCONY - CONTINUOUS',
        author: 'Anand',
        role: 'Cinematographer',
        category: 'Audio/Music',
        text: 'Layer low rumble of thunder right before rain hits the tin roof.',
        resolved: false,
        createdAt: 'Oct 20, 2026, 9:15 PM',
      },
    ];
  });

  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const [newText, setNewText] = useState('');
  const [newAuthor, setNewAuthor] = useState('Director');
  const [newRole, setNewRole] = useState<'Director' | 'Writer' | 'Producer' | 'Cinematographer'>('Director');
  const [newCategory, setNewCategory] = useState<'Direction' | 'Polish' | 'Camera' | 'Audio/Music' | 'General'>('Direction');
  const [selectedSceneId, setSelectedSceneId] = useState(scenes[0]?.id || '');

  const persistComments = (updated: ScriptComment[]) => {
    setComments(updated);
    try {
      localStorage.setItem('scriptcraft_comments', JSON.stringify(updated));
    } catch {}
  };

  if (!isOpen) return null;

  const handleAddComment = () => {
    if (!newText.trim()) return;
    const targetScene = scenes.find(s => s.id === selectedSceneId) || scenes[0];

    const newComm: ScriptComment = {
      id: `comm-${Date.now()}`,
      sceneId: targetScene?.id || '',
      sceneHeading: targetScene?.heading || 'General Script Note',
      author: newAuthor.trim() || 'Filmmaker',
      role: newRole,
      category: newCategory,
      text: newText.trim(),
      resolved: false,
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    persistComments([newComm, ...comments]);
    setNewText('');
  };

  const handleToggleResolve = (id: string) => {
    const updated = comments.map(c => (c.id === id ? { ...c, resolved: !c.resolved } : c));
    persistComments(updated);
  };

  const handleDeleteComment = (id: string) => {
    const updated = comments.filter(c => c.id !== id);
    persistComments(updated);
  };

  const handleJump = (sceneId: string) => {
    if (onSelectScene) {
      onSelectScene(sceneId);
    } else {
      window.dispatchEvent(new CustomEvent('jump-to-scene', { detail: { sceneId } }));
    }
    onClose();
  };

  const filteredComments = comments.filter(c => {
    if (filter === 'open') return !c.resolved;
    if (filter === 'resolved') return c.resolved;
    return true;
  });

  const categoryColors: Record<string, string> = {
    Direction: '#f59e0b',
    Polish: '#10b981',
    Camera: '#38bdf8',
    'Audio/Music': '#f43f5e',
    General: '#a855f7',
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
          width: '720px',
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
            <MessageSquare size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
              DIRECTOR STICKY NOTES & MARGIN COMMENTS
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Filter Tabs */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '6px',
                padding: '2px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() => setFilter('open')}
                style={{
                  backgroundColor: filter === 'open' ? 'var(--bg-panel)' : 'transparent',
                  color: filter === 'open' ? 'var(--accent-gold)' : 'var(--ink-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Open ({comments.filter(c => !c.resolved).length})
              </button>
              <button
                onClick={() => setFilter('resolved')}
                style={{
                  backgroundColor: filter === 'resolved' ? 'var(--bg-panel)' : 'transparent',
                  color: filter === 'resolved' ? 'var(--accent-gold)' : 'var(--ink-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Resolved ({comments.filter(c => c.resolved).length})
              </button>
              <button
                onClick={() => setFilter('all')}
                style={{
                  backgroundColor: filter === 'all' ? 'var(--bg-panel)' : 'transparent',
                  color: filter === 'all' ? 'var(--accent-gold)' : 'var(--ink-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                All ({comments.length})
              </button>
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
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Add New Note Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Add Note / Director Instruction
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <select
                value={selectedSceneId}
                onChange={e => setSelectedSceneId(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  color: '#f8fafc',
                  fontSize: '11px',
                  outline: 'none',
                }}
              >
                {scenes.map(s => (
                  <option key={s.id} value={s.id}>
                    #{s.number} - {s.heading}
                  </option>
                ))}
              </select>

              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as any)}
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  color: 'var(--accent-gold)',
                  fontSize: '11px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="Director">Director</option>
                <option value="Writer">Writer</option>
                <option value="Cinematographer">Cinematographer</option>
                <option value="Producer">Producer</option>
              </select>

              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  color: '#38bdf8',
                  fontSize: '11px',
                  outline: 'none',
                }}
              >
                <option value="Direction">Direction</option>
                <option value="Camera">Camera</option>
                <option value="Audio/Music">Audio/Music</option>
                <option value="Polish">Polish</option>
                <option value="General">General</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Type your notes or camera directions..."
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '8px 10px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newText.trim()}
                style={{
                  backgroundColor: 'var(--accent-amber)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 14px',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: newText.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} />
                <span>Post Note</span>
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredComments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-dim)', fontSize: '12px' }}>
                No {filter} notes found. Add a note above!
              </div>
            ) : (
              filteredComments.map(c => (
                <div
                  key={c.id}
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    opacity: c.resolved ? 0.6 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleResolve(c.id)}
                        title={c.resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: c.resolved ? '#10b981' : 'var(--ink-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {c.resolved ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </button>

                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: `${categoryColors[c.category]}22`,
                          color: categoryColors[c.category],
                          border: `1px solid ${categoryColors[c.category]}44`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {c.category}
                      </span>

                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                        {c.author} ({c.role})
                      </span>

                      <span style={{ fontSize: '11px', color: 'var(--ink-dim)' }}>• {c.createdAt}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {c.sceneId && (
                        <button
                          onClick={() => handleJump(c.sceneId)}
                          title="Jump to Scene in Script"
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            color: '#38bdf8',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>Jump</span>
                          <ArrowRight size={11} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        title="Delete Note"
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--ink-dim)',
                          cursor: 'pointer',
                          padding: '3px',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '13px',
                      color: c.resolved ? 'var(--ink-muted)' : '#f1f5f9',
                      lineHeight: 1.5,
                      textDecoration: c.resolved ? 'line-through' : 'none',
                    }}
                  >
                    {c.text}
                  </p>

                  <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontFamily: 'var(--font-script)' }}>
                    📍 Attached to {c.sceneHeading}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
