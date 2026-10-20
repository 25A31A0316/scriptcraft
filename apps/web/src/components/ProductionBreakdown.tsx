import React, { useMemo } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';
import { paginateScreenplay } from '@screenplay/formatting';
import {
  Film,
  Sun,
  Moon,
  Building,
  Users,
  FileSpreadsheet,
  Download,
  Tag,
  Package,
} from 'lucide-react';
import { downloadFile } from '../utils/exportHelpers';

interface ProductionBreakdownProps {
  document: ScreenplayDocument;
  onSelectScene: (sceneId: string) => void;
  onTagScene?: (sceneId: string) => void;
}

interface SceneBreakdownItem {
  id: string;
  sceneNumber: string;
  heading: string;
  intExt: 'INT.' | 'EXT.' | 'OTHER';
  location: string;
  dayNight: 'DAY' | 'NIGHT' | 'OTHER';
  characters: string[];
  elements?: {
    props?: string[];
    wardrobe?: string[];
    sfx?: string[];
    vfx?: string[];
    equipment?: string[];
  };
}

export const ProductionBreakdown: React.FC<ProductionBreakdownProps> = ({
  document,
  onSelectScene,
  onTagScene,
}) => {
  const pagination = useMemo(() => paginateScreenplay(document), [document]);

  // Extract all scene data
  const sceneItems = useMemo(() => {
    const list: SceneBreakdownItem[] = [];
    let current: SceneBreakdownItem | null = null;
    let idx = 1;

    for (const node of document.nodes) {
      if (node.type === 'scene_heading') {
        const text = node.text || '';
        const num = (node.metadata as any)?.sceneNumber || String(idx++);

        let intExt: 'INT.' | 'EXT.' | 'OTHER' = 'OTHER';
        if (text.includes('INT.')) intExt = 'INT.';
        else if (text.includes('EXT.')) intExt = 'EXT.';

        let dayNight: 'DAY' | 'NIGHT' | 'OTHER' = 'OTHER';
        if (text.includes('NIGHT')) dayNight = 'NIGHT';
        else if (text.includes('DAY')) dayNight = 'DAY';

        // Extract location (between INT./EXT. and - DAY/NIGHT)
        const parts = text.replace(/^(INT\.|EXT\.|INT\.\/EXT\.)\s*/i, '').split('-');
        const loc = parts[0]?.trim() || 'GENERAL';

        const customElements = (node.metadata as Record<string, unknown>)?.productionElements as {
          props?: string[];
          wardrobe?: string[];
          sfx?: string[];
          vfx?: string[];
          equipment?: string[];
        } || (text.includes('LIVING ROOM') ? {
          props: ['Antique Bronze Key', 'House of Cards'],
          sfx: ['Ceiling Fan Creak'],
        } : text.includes('BALCONY') ? {
          props: ['Key'],
          sfx: ['Rain on Tin', 'Thunder'],
          vfx: ['City Horizon Rain'],
        } : {});

        current = {
          id: node.id,
          sceneNumber: num,
          heading: text,
          intExt,
          location: loc,
          dayNight,
          characters: [],
          elements: customElements,
        };
        list.push(current);
      } else if (current && node.type === 'character') {
        const charName = node.text.replace(/\(.*\)/, '').trim().toUpperCase();
        if (charName && !current.characters.includes(charName)) {
          current.characters.push(charName);
        }
      }
    }
    return list;
  }, [document.nodes]);

  // Character breakdown with scene appearances
  const castBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; dialogueCount: number; scenes: string[] }>();

    for (const scene of sceneItems) {
      for (const char of scene.characters) {
        const existing = map.get(char) || { name: char, dialogueCount: 0, scenes: [] };
        if (!existing.scenes.includes(scene.sceneNumber)) {
          existing.scenes.push(scene.sceneNumber);
        }
        map.set(char, existing);
      }
    }

    // Count dialogues
    for (const node of document.nodes) {
      if (node.type === 'character') {
        const char = node.text.replace(/\(.*\)/, '').trim().toUpperCase();
        if (map.has(char)) {
          map.get(char)!.dialogueCount += 1;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.dialogueCount - a.dialogueCount);
  }, [sceneItems, document.nodes]);

  // Aggregate Metrics
  const intCount = sceneItems.filter(s => s.intExt === 'INT.').length;
  const extCount = sceneItems.filter(s => s.intExt === 'EXT.').length;
  const dayCount = sceneItems.filter(s => s.dayNight === 'DAY').length;
  const nightCount = sceneItems.filter(s => s.dayNight === 'NIGHT').length;

  const exportBreakdownCsv = () => {
    const rows = [
      ['Scene #', 'Slugline', 'Environment', 'Location', 'Time of Day', 'Cast in Scene', 'Props', 'SFX', 'VFX'],
      ...sceneItems.map(s => [
        s.sceneNumber,
        `"${s.heading}"`,
        s.intExt,
        `"${s.location}"`,
        s.dayNight,
        `"${s.characters.join(', ')}"`,
        `"${(s.elements?.props || []).join('; ')}"`,
        `"${(s.elements?.sfx || []).join('; ')}"`,
        `"${(s.elements?.vfx || []).join('; ')}"`,
      ]),
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    downloadFile(
      `${document.title.toLowerCase().replace(/\s+/g, '_')}_production_breakdown.csv`,
      csvContent,
      'text/csv;charset=utf-8'
    );
  };

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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
              FILMMAKER PRODUCTION BREAKDOWN
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
              Automated script breakdown for directors, line producers, and assistant directors.
            </p>
          </div>

          <button
            onClick={exportBreakdownCsv}
            style={{
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '8px 14px',
              color: 'var(--accent-gold)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} />
            <span>Export CSV Sheet</span>
          </button>
        </div>

        {/* Top KPIs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {/* Total Pages & Scenes */}
          <div
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', marginBottom: '8px' }}>
              <Film size={16} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>PAGES & SCENES</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
              {pagination.totalPages} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink-muted)' }}>pgs</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
              {sceneItems.length} total scenes
            </div>
          </div>

          {/* INT vs EXT */}
          <div
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px' }}>
              <Building size={16} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>SET ENVIRONMENT</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>
              {intCount} <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>INT</span> / {extCount} <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>EXT</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
              {Math.round((intCount / (sceneItems.length || 1)) * 100)}% Interior shoots
            </div>
          </div>

          {/* DAY vs NIGHT */}
          <div
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px' }}>
              <Moon size={16} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>LIGHTING SCHEDULE</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>
              {dayCount} <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>DAY</span> / {nightCount} <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>NIGHT</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
              {Math.round((nightCount / (sceneItems.length || 1)) * 100)}% Night shoots
            </div>
          </div>

          {/* CAST */}
          <div
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '8px' }}>
              <Users size={16} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>SPEAKING CAST</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
              {castBreakdown.length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
              Speaking characters
            </div>
          </div>
        </div>

        {/* Scene Breakdown Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-sidebar)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FileSpreadsheet size={16} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
              Master Scene Stripboard
            </h3>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--ink-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 14px' }}>SCENE</th>
                <th style={{ padding: '10px 14px' }}>SLUGLINE</th>
                <th style={{ padding: '10px 14px' }}>INT/EXT</th>
                <th style={{ padding: '10px 14px' }}>DAY/NIGHT</th>
                <th style={{ padding: '10px 14px' }}>CAST MEMBERS</th>
                <th style={{ padding: '10px 14px' }}>TAGGED ELEMENTS</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {sceneItems.map(item => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-panel)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td
                    onClick={() => onSelectScene(item.id)}
                    style={{ padding: '10px 14px', fontFamily: 'var(--font-script)', fontWeight: 700, color: 'var(--accent-gold)', cursor: 'pointer' }}
                  >
                    #{item.sceneNumber}
                  </td>
                  <td
                    onClick={() => onSelectScene(item.id)}
                    style={{ padding: '10px 14px', fontFamily: 'var(--font-script)', color: '#fbbf24', cursor: 'pointer' }}
                  >
                    {item.heading}
                  </td>
                  <td style={{ padding: '10px 14px', color: item.intExt === 'INT.' ? '#38bdf8' : '#34d399' }}>
                    {item.intExt}
                  </td>
                  <td style={{ padding: '10px 14px', color: item.dayNight === 'NIGHT' ? '#f59e0b' : '#fbbf24' }}>
                    {item.dayNight}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>
                    {item.characters.join(', ') || <span style={{ color: 'var(--ink-dim)' }}>None</span>}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(item.elements?.props || []).map((p, i) => (
                        <span key={i} style={{ fontSize: '10px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                          📦 {p}
                        </span>
                      ))}
                      {(item.elements?.sfx || []).map((s, i) => (
                        <span key={i} style={{ fontSize: '10px', backgroundColor: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(244, 63, 94, 0.4)' }}>
                          🔊 {s}
                        </span>
                      ))}
                      {(item.elements?.vfx || []).map((v, i) => (
                        <span key={i} style={{ fontSize: '10px', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                          ✨ {v}
                        </span>
                      ))}
                      {(!item.elements?.props?.length && !item.elements?.sfx?.length && !item.elements?.vfx?.length) && (
                        <span style={{ color: 'var(--ink-dim)', fontSize: '11px' }}>No tags</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onTagScene) onTagScene(item.id);
                      }}
                      title="Tag Props, SFX, Wardrobe, VFX"
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        color: 'var(--accent-gold)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Tag size={11} />
                      <span>Tag Scene</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cast Call Sheet Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-sidebar)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Users size={16} color="#38bdf8" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
              Cast Call Sheet & Scene Numbers
            </h3>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--ink-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 14px' }}>CHARACTER</th>
                <th style={{ padding: '10px 14px' }}>DIALOGUE LINES</th>
                <th style={{ padding: '10px 14px' }}>SCENE APPEARANCES</th>
              </tr>
            </thead>
            <tbody>
              {castBreakdown.map(c => (
                <tr key={c.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-script)', fontWeight: 700, color: '#38bdf8' }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--ink-primary)' }}>
                    {c.dialogueCount} lines
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--ink-muted)' }}>
                    Scenes: {c.scenes.map(s => `#${s}`).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
