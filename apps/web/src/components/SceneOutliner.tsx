import React, { useState, useMemo } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';
import { Film, Search, Hash } from 'lucide-react';

interface SceneOutlinerProps {
  document: ScreenplayDocument;
  isOpen: boolean;
  onToggle: () => void;
}

export const SceneOutliner: React.FC<SceneOutlinerProps> = ({
  document,
  isOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all scene headings from nodes
  const scenes = useMemo(() => {
    let sceneIndex = 1;
    return document.nodes
      .filter(n => n.type === 'scene_heading')
      .map(node => {
        const text = node.text || 'UNTITLED SCENE';
        const num = (node.metadata as any)?.sceneNumber || String(sceneIndex++);
        return {
          id: node.id,
          text,
          number: num,
        };
      });
  }, [document.nodes]);

  const filteredScenes = useMemo(() => {
    if (!searchQuery.trim()) return scenes;
    const q = searchQuery.toLowerCase();
    return scenes.filter(s => s.text.toLowerCase().includes(q) || s.number.includes(q));
  }, [scenes, searchQuery]);

  const handleSceneClick = (sceneId: string) => {
    window.dispatchEvent(
      new CustomEvent('jump-to-scene', {
        detail: { sceneId },
      })
    );
  };

  if (!isOpen) return null;

  return (
    <aside
      style={{
        width: '280px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
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
          <Film size={18} color="var(--accent-gold)" />
          <span style={{ fontWeight: 600, fontSize: '13px', letterSpacing: '0.04em' }}>
            SCENE OUTLINE
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
          {scenes.length} {scenes.length === 1 ? 'scene' : 'scenes'}
        </span>
      </div>

      {/* Search Input */}
      <div style={{ padding: '0.75rem 1rem' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={14}
            color="var(--ink-dim)"
            style={{ position: 'absolute', left: '10px' }}
          />
          <input
            type="text"
            placeholder="Filter scenes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 10px 6px 30px',
              color: 'var(--ink-primary)',
              fontSize: '12px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Scene List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.25rem 0.5rem' }}>
        {filteredScenes.length === 0 ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'var(--ink-dim)',
              fontSize: '12px',
            }}
          >
            No scenes found
          </div>
        ) : (
          filteredScenes.map(scene => (
            <button
              key={scene.id}
              onClick={() => handleSceneClick(scene.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                color: 'var(--ink-primary)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: 'var(--accent-gold)',
                  fontFamily: 'var(--font-script)',
                  fontWeight: 700,
                  marginTop: '1px',
                }}
              >
                <Hash size={11} style={{ marginRight: '1px' }} />
                {scene.number}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-script)',
                  lineHeight: '1.4',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#e2e8f0',
                }}
              >
                {scene.text}
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
};
