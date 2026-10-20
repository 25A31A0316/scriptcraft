import React from 'react';
import { ScreenplayDocument } from '@screenplay/schema';
import { SaveStatus } from '../hooks/useScreenplayPersistence';
import {
  Clapperboard,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  PanelLeft,
  PanelRight,
  FileText,
  Printer,
  Wifi,
  Users,
  LayoutGrid,
  FileSpreadsheet,
  Palette,
  BarChart3,
  ShieldAlert,
  Sparkles,
  Volume2,
  Columns2,
  MessageSquare,
  Sun,
  Moon,
} from 'lucide-react';

interface ScriptTopBarProps {
  document: ScreenplayDocument;
  saveStatus: SaveStatus;
  lastSavedAt: Date;
  cloudStatus?: 'connected' | 'connecting' | 'disconnected';
  peerCount?: number;
  viewMode: 'editor' | 'beatboard' | 'breakdown';
  onViewModeChange: (mode: 'editor' | 'beatboard' | 'breakdown') => void;
  onOpenRevisions: () => void;
  onOpenReports: () => void;
  onOpenContinuity: () => void;
  onOpenAssistant: () => void;
  onOpenTableRead: () => void;
  onOpenTitlePage: () => void;
  onOpenDualDialogue: () => void;
  onOpenComments: () => void;
  theme: 'obsidian' | 'classic' | 'slate';
  onThemeChange: (theme: 'obsidian' | 'classic' | 'slate') => void;
  onTitleChange: (newTitle: string) => void;
  outlineOpen: boolean;
  onToggleOutline: () => void;
  characterOpen: boolean;
  onToggleCharacter: () => void;
  onExportFountain: () => void;
  onExportFDX: () => void;
  onExportJSON: () => void;
  onPrintPDF: () => void;
  onImportScript: (file: File) => void;
}

export const ScriptTopBar: React.FC<ScriptTopBarProps> = ({
  document,
  saveStatus,
  lastSavedAt,
  cloudStatus = 'connected',
  peerCount = 0,
  viewMode,
  onViewModeChange,
  onOpenRevisions,
  onOpenReports,
  onOpenContinuity,
  onOpenAssistant,
  onOpenTableRead,
  onOpenTitlePage,
  onOpenDualDialogue,
  onOpenComments,
  theme,
  onThemeChange,
  onTitleChange,
  outlineOpen,
  onToggleOutline,
  characterOpen,
  onToggleCharacter,
  onExportFountain,
  onExportFDX,
  onExportJSON,
  onPrintPDF,
  onImportScript,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportScript(file);
      e.target.value = '';
    }
  };

  return (
    <header
      style={{
        height: '56px',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        userSelect: 'none',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".fountain,.fdx,.json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {/* Left: Branding & Outline toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onToggleOutline}
          title="Toggle Scene Outline"
          style={{
            backgroundColor: outlineOpen ? 'var(--bg-panel)' : 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px',
            color: outlineOpen ? 'var(--accent-gold)' : 'var(--ink-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <PanelLeft size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              backgroundColor: 'var(--accent-amber)',
              color: '#000',
              padding: '4px 6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Clapperboard size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.04em' }}>
            SCRIPTCRAFT
          </span>
        </div>

        {/* Script Title (Editable) */}
        <div style={{ marginLeft: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="text"
            value={document.title}
            onChange={e => onTitleChange(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              borderRadius: '4px',
              padding: '4px 8px',
              color: 'var(--ink-primary)',
              fontSize: '13px',
              fontWeight: 600,
              outline: 'none',
              maxWidth: '180px',
            }}
            onFocus={e => (e.target.style.border = '1px solid var(--border-active)')}
            onBlur={e => (e.target.style.border = '1px solid transparent')}
          />
        </div>
      </div>

      {/* Center: View Switcher (Script Editor vs Beat Board vs Breakdown) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '2px',
          gap: '2px',
        }}
      >
        <button
          onClick={() => onViewModeChange('editor')}
          style={{
            backgroundColor: viewMode === 'editor' ? 'var(--bg-panel)' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            color: viewMode === 'editor' ? 'var(--accent-gold)' : 'var(--ink-muted)',
            fontWeight: viewMode === 'editor' ? 600 : 400,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <FileText size={13} />
          <span>Script</span>
        </button>

        <button
          onClick={() => onViewModeChange('beatboard')}
          style={{
            backgroundColor: viewMode === 'beatboard' ? 'var(--bg-panel)' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            color: viewMode === 'beatboard' ? 'var(--accent-gold)' : 'var(--ink-muted)',
            fontWeight: viewMode === 'beatboard' ? 600 : 400,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <LayoutGrid size={13} />
          <span>Beat Board</span>
        </button>

        <button
          onClick={() => onViewModeChange('breakdown')}
          style={{
            backgroundColor: viewMode === 'breakdown' ? 'var(--bg-panel)' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            color: viewMode === 'breakdown' ? 'var(--accent-gold)' : 'var(--ink-muted)',
            fontWeight: viewMode === 'breakdown' ? 600 : 400,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <FileSpreadsheet size={13} />
          <span>Breakdown</span>
        </button>
      </div>

      {/* Center: Save / Sync Status & Collaboration Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {saveStatus === 'saving' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--accent-gold)',
            }}
          >
            <Clock size={12} className="animate-spin" />
            <span>Saving locally...</span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--status-green)',
            }}
          >
            <CheckCircle2 size={13} />
            <span>
              Saved ({lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </span>
          </div>
        )}

        {/* Cloud & Collaboration Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            backgroundColor: 'var(--bg-panel)',
            padding: '3px 8px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            color: cloudStatus === 'connected' ? '#38bdf8' : 'var(--ink-dim)',
          }}
        >
          <Wifi size={12} />
          <span>{cloudStatus === 'connected' ? 'Cloud Synced' : 'Offline'}</span>
          {peerCount > 0 && (
            <span
              style={{
                marginLeft: '4px',
                paddingLeft: '6px',
                borderLeft: '1px solid var(--border-subtle)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Users size={11} />
              {peerCount} online
            </span>
          )}
        </div>
      </div>

      {/* Right: Revision, Reports, Import, Export triggers & Sidebars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Revisions Draft Button */}
        <button
          onClick={onOpenRevisions}
          title="Production Revision Draft & History"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--ink-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor:
                document.revision?.currentColor === 'blue'
                  ? '#60a5fa'
                  : document.revision?.currentColor === 'pink'
                  ? '#f472b6'
                  : document.revision?.currentColor === 'yellow'
                  ? '#facc15'
                  : document.revision?.currentColor === 'green'
                  ? '#4ade80'
                  : '#f8fafc',
            }}
          />
          <span style={{ textTransform: 'capitalize' }}>
            {document.revision?.currentColor || 'White'} Draft
          </span>
        </button>

        {/* Script Reports Button */}
        <button
          onClick={onOpenReports}
          title="Scene Lengths (Eighths) & Dialogue Analytics"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--ink-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <BarChart3 size={14} color="var(--accent-gold)" />
          <span>Reports</span>
        </button>

        {/* Script Continuity & Format Audit Button */}
        <button
          onClick={onOpenContinuity}
          title="Audit Sluglines, Character Cues & Pacing"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--ink-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ShieldAlert size={14} color="#f59e0b" />
          <span>Continuity</span>
        </button>

        {/* Filmmaker AI Assistant Button */}
        <button
          onClick={onOpenAssistant}
          title="Creative Assistant: Loglines, Subtext, Action Punch-Up"
          style={{
            backgroundColor: 'rgba(217, 119, 6, 0.15)',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--accent-gold)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={14} />
          <span>AI Assist</span>
        </button>

        {/* Table Read & Teleprompter Button */}
        <button
          onClick={onOpenTableRead}
          title="Actor Rehearsal & Teleprompter Table Read"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: '#38bdf8',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Volume2 size={14} />
          <span>Rehearse</span>
        </button>

        {/* Hollywood Title Page Button */}
        <button
          onClick={onOpenTitlePage}
          title="Hollywood Title Page Designer & Watermark"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--ink-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FileText size={14} color="var(--accent-gold)" />
          <span>Cover</span>
        </button>

        {/* Dual Dialogue Simultaneous Speech Button */}
        <button
          onClick={onOpenDualDialogue}
          title="Dual Dialogue (Simultaneous Speech)"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: '#34d399',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Columns2 size={14} />
          <span>Dual</span>
        </button>

        {/* Director Sticky Notes & Comments Button */}
        <button
          onClick={onOpenComments}
          title="Director Sticky Notes & Margin Comments"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: '#a78bfa',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <MessageSquare size={14} />
          <span>Notes</span>
        </button>

        {/* Studio Theme Switcher */}
        <button
          onClick={() => {
            const nextTheme = theme === 'obsidian' ? 'classic' : theme === 'classic' ? 'slate' : 'obsidian';
            onThemeChange(nextTheme);
          }}
          title={`Active Theme: ${theme.toUpperCase()} (Click to toggle Obsidian / Classic Paper / Slate)`}
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--accent-gold)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {theme === 'classic' ? <Sun size={14} /> : <Moon size={14} />}
          <span style={{ textTransform: 'capitalize' }}>{theme}</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import Screenplay (.fountain, .fdx, .json)"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--ink-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Upload size={14} color="var(--accent-gold)" />
          <span>Import</span>
        </button>

        <button
          onClick={onExportFountain}
          title="Export to Fountain (.fountain)"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--ink-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FileText size={14} color="var(--accent-gold)" />
          <span>Fountain</span>
        </button>

        <button
          onClick={onExportFDX}
          title="Export to Final Draft XML (.fdx)"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--ink-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FileText size={14} color="#38bdf8" />
          <span>FDX</span>
        </button>

        <button
          onClick={onExportJSON}
          title="Download Backup JSON"
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--ink-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Download size={14} />
          <span>Backup</span>
        </button>

        <button
          onClick={onPrintPDF}
          title="Print or Export PDF"
          style={{
            backgroundColor: 'var(--accent-amber)',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#000',
            fontWeight: 600,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Printer size={14} />
          <span>Print / PDF</span>
        </button>

        <button
          onClick={onToggleCharacter}
          title="Toggle Cast & Beats"
          style={{
            backgroundColor: characterOpen ? 'var(--bg-panel)' : 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px',
            color: characterOpen ? 'var(--accent-gold)' : 'var(--ink-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '4px',
          }}
        >
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
};
