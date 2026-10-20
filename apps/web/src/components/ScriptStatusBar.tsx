import React, { useMemo } from 'react';
import { ScreenplayDocument, ScreenplayElementType } from '@screenplay/schema';
import { paginateScreenplay } from '@screenplay/formatting';
import { Timer, FileText, Globe } from 'lucide-react';

interface ScriptStatusBarProps {
  document: ScreenplayDocument;
  activeElement: ScreenplayElementType;
}

export const ScriptStatusBar: React.FC<ScriptStatusBarProps> = ({
  document,
  activeElement,
}) => {
  // Calculate approximate words and accurate page count
  const totalWords = useMemo(() => {
    return document.nodes.reduce((count, n) => {
      return count + (n.text.trim() ? n.text.trim().split(/\s+/).length : 0);
    }, 0);
  }, [document.nodes]);

  const pagination = useMemo(() => {
    return paginateScreenplay(document);
  }, [document]);

  const totalPages = pagination.totalPages;
  const estimatedMinutes = totalPages; // 1 page approx 1 minute

  const formatElementLabel = (type: ScreenplayElementType): string => {
    switch (type) {
      case 'scene_heading':
        return 'SCENE HEADING (Slugline)';
      case 'action':
        return 'ACTION';
      case 'character':
        return 'CHARACTER CUE';
      case 'dialogue':
        return 'DIALOGUE';
      case 'parenthetical':
        return 'PARENTHETICAL';
      case 'transition':
        return 'TRANSITION';
      case 'shot':
        return 'SHOT';
      default:
        return 'ACTION';
    }
  };

  return (
    <footer
      style={{
        height: '32px',
        backgroundColor: 'var(--bg-app)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        fontSize: '11px',
        color: 'var(--ink-muted)',
        userSelect: 'none',
      }}
    >
      {/* Left: Current Active Screenplay Element */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--ink-dim)' }}>ELEMENT:</span>
        <span
          style={{
            fontFamily: 'var(--font-script)',
            fontWeight: 700,
            color: 'var(--accent-gold)',
            backgroundColor: 'var(--bg-panel)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {formatElementLabel(activeElement)}
        </span>
        <span style={{ color: 'var(--ink-dim)' }}>(Tab to switch • Enter to advance)</span>
      </div>

      {/* Right: Screenplay stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FileText size={12} />
          <span>{totalPages} {totalPages === 1 ? 'Page' : 'Pages'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Timer size={12} />
          <span>~{estimatedMinutes} min screen time</span>
        </div>

        <div>
          <span>{totalWords} words</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
          <Globe size={12} />
          <span>UTF-8 / Unicode</span>
        </div>
      </div>
    </footer>
  );
};
