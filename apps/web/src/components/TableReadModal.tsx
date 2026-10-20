import React, { useState, useEffect, useRef } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  X,
  Maximize2,
  Minimize2,
  Users,
  Settings2,
  Type,
} from 'lucide-react';

interface TableReadModalProps {
  document: ScreenplayDocument;
  isOpen: boolean;
  onClose: () => void;
}

export const TableReadModal: React.FC<TableReadModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('ALL');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1); // 1 = normal, 2 = fast, 3 = very fast
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Extract all characters
  const characters = Array.from(
    new Set(
      document.nodes
        .filter(n => n.type === 'character')
        .map(n => n.text.replace(/\(.*\)/, '').trim().toUpperCase())
        .filter(Boolean)
    )
  );

  // Auto-scroll logic
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let lastTime = performance.now();

    const scrollStep = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (scrollContainerRef.current) {
        // Pixels per millisecond based on speed
        const speedPixelsPerSecond = scrollSpeed * 28;
        scrollContainerRef.current.scrollTop += (speedPixelsPerSecond * delta) / 1000;
      }

      animationFrameRef.current = requestAnimationFrame(scrollStep);
    };

    animationFrameRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, scrollSpeed]);

  // Keyboard shortcut: Spacebar toggles Play/Pause
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fontSizes = {
    normal: { script: '14px', action: '14px', char: '15px' },
    large: { script: '18px', action: '18px', char: '19px' },
    huge: { script: '24px', action: '22px', char: '25px' },
  };

  const handleResetScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setIsPlaying(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a0a0c',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top Teleprompter Controls Bar */}
      <div
        style={{
          height: '60px',
          backgroundColor: '#121217',
          borderBottom: '1px solid #26262e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={18} color="var(--accent-gold)" />
            <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em', color: '#f8fafc' }}>
              TABLE READ & TELEPROMPTER
            </span>
          </div>

          {/* Character Focus Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '1rem' }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Focus Actor:</span>
            <select
              value={selectedCharacter}
              onChange={e => setSelectedCharacter(e.target.value)}
              style={{
                backgroundColor: '#1e1e26',
                border: '1px solid #363644',
                borderRadius: '4px',
                padding: '4px 8px',
                color: selectedCharacter === 'ALL' ? '#f8fafc' : 'var(--accent-gold)',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="ALL">All Characters (Full Cast)</option>
              {characters.map(c => (
                <option key={c} value={c}>
                  Highlight {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Play / Pause & Speed Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              backgroundColor: isPlaying ? '#ef4444' : 'var(--accent-amber)',
              color: '#000000',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="#000" />}
            <span>{isPlaying ? 'PAUSE (Space)' : 'START AUTO-SCROLL'}</span>
          </button>

          <button
            onClick={handleResetScroll}
            title="Reset to Top"
            style={{
              backgroundColor: '#1e1e26',
              border: '1px solid #363644',
              borderRadius: '4px',
              padding: '6px 8px',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RotateCcw size={14} />
          </button>

          {/* Speed Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1e1e26',
              border: '1px solid #363644',
              borderRadius: '4px',
              padding: '2px',
            }}
          >
            {[0.75, 1, 1.5, 2, 3].map(speed => (
              <button
                key={speed}
                onClick={() => setScrollSpeed(speed)}
                style={{
                  backgroundColor: scrollSpeed === speed ? 'var(--accent-gold)' : 'transparent',
                  color: scrollSpeed === speed ? '#000000' : 'var(--ink-muted)',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Font Size Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1e1e26',
              border: '1px solid #363644',
              borderRadius: '4px',
              padding: '2px',
            }}
          >
            {(['normal', 'large', 'huge'] as const).map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                style={{
                  backgroundColor: fontSize === size ? '#38bdf8' : 'transparent',
                  color: fontSize === size ? '#000000' : 'var(--ink-muted)',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Right Close Button */}
        <div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1e1e26',
              border: '1px solid #363644',
              borderRadius: '6px',
              padding: '6px 12px',
              color: 'var(--ink-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
            }}
          >
            <X size={14} />
            <span>Exit Rehearsal (ESC)</span>
          </button>
        </div>
      </div>

      {/* Main Teleprompter Read-Through Surface */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4rem 1rem 12rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '840px',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {document.nodes.map(node => {
            if (node.type === 'scene_heading') {
              return (
                <div
                  key={node.id}
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderLeft: '4px solid var(--accent-gold)',
                    borderRadius: '4px',
                    padding: '12px 18px',
                    margin: '2rem 0 1rem 0',
                    fontFamily: 'var(--font-script)',
                    fontSize: fontSizes[fontSize].char,
                    fontWeight: 700,
                    color: 'var(--accent-gold)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {node.text}
                </div>
              );
            }

            if (node.type === 'action') {
              return (
                <div
                  key={node.id}
                  style={{
                    fontFamily: 'var(--font-script)',
                    fontSize: fontSizes[fontSize].action,
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    padding: '0 1rem',
                  }}
                >
                  {node.text}
                </div>
              );
            }

            if (node.type === 'character') {
              const charName = node.text.replace(/\(.*\)/, '').trim().toUpperCase();
              const isFocused = selectedCharacter === 'ALL' || selectedCharacter === charName;

              return (
                <div
                  key={node.id}
                  style={{
                    fontFamily: 'var(--font-script)',
                    fontSize: fontSizes[fontSize].char,
                    fontWeight: 800,
                    color: isFocused ? '#38bdf8' : '#475569',
                    letterSpacing: '0.08em',
                    marginTop: '1.25rem',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {node.text}
                </div>
              );
            }

            if (node.type === 'parenthetical') {
              return (
                <div
                  key={node.id}
                  style={{
                    fontFamily: 'var(--font-script)',
                    fontSize: fontSizes[fontSize].script,
                    fontStyle: 'italic',
                    color: '#64748b',
                    textAlign: 'center',
                  }}
                >
                  {node.text}
                </div>
              );
            }

            if (node.type === 'dialogue') {
              // Find the preceding character
              const nodeIdx = document.nodes.indexOf(node);
              let prevChar = '';
              for (let i = nodeIdx - 1; i >= 0; i--) {
                if (document.nodes[i].type === 'character') {
                  prevChar = document.nodes[i].text.replace(/\(.*\)/, '').trim().toUpperCase();
                  break;
                }
              }

              const isFocused = selectedCharacter === 'ALL' || selectedCharacter === prevChar;

              return (
                <div
                  key={node.id}
                  style={{
                    fontFamily: 'var(--font-script)',
                    fontSize: fontSizes[fontSize].script,
                    color: isFocused ? '#ffffff' : '#475569',
                    backgroundColor:
                      isFocused && selectedCharacter !== 'ALL'
                        ? 'rgba(56, 189, 248, 0.08)'
                        : 'transparent',
                    borderLeft:
                      isFocused && selectedCharacter !== 'ALL'
                        ? '3px solid #38bdf8'
                        : '3px solid transparent',
                    padding: isFocused && selectedCharacter !== 'ALL' ? '8px 16px' : '0 3rem',
                    borderRadius: '4px',
                    textAlign: 'left',
                    lineHeight: 1.6,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {node.text}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};
