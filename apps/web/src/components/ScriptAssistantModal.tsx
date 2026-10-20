import React, { useState } from 'react';
import { ScreenplayDocument, ScreenplayNode } from '@screenplay/schema';
import {
  Sparkles,
  X,
  Copy,
  PlusCircle,
  Lightbulb,
  MessageSquare,
  Wand2,
  Film,
  Languages,
  Check,
} from 'lucide-react';

interface ScriptAssistantModalProps {
  document: ScreenplayDocument;
  isOpen: boolean;
  onClose: () => void;
  onInsertNode?: (node: ScreenplayNode) => void;
}

type AssistantTool = 'logline' | 'action_punch' | 'dialogue_subtext' | 'telugu_phrasing';

export const ScriptAssistantModal: React.FC<ScriptAssistantModalProps> = ({
  document,
  isOpen,
  onClose,
  onInsertNode,
}) => {
  const [activeTool, setActiveTool] = useState<AssistantTool>('logline');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('SURESH');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Extract unique character names from document
  const characters = Array.from(
    new Set(
      document.nodes
        .filter(n => n.type === 'character')
        .map(n => n.text.replace(/\(.*\)/, '').trim().toUpperCase())
        .filter(Boolean)
    )
  );

  if (!isOpen) return null;

  // Curated creative intelligence suggestions tailored to the current script ("Peka Medalu")
  const suggestions: Record<
    AssistantTool,
    { title: string; subtitle: string; options: { text: string; tag: string; nodeType: 'action' | 'dialogue' }[] }
  > = {
    logline: {
      title: 'Cinematic Logline & Pitch Formulations',
      subtitle: 'Distill the essence of Peka Medalu into a commercial high-concept hook:',
      options: [
        {
          tag: 'High Tension Hook',
          text: `When an overlooked dreamer's clandestine scheme begins to collapse like a house of cards, he must navigate betrayals within his own family before midnight arrives.`,
          nodeType: 'action',
        },
        {
          tag: 'Character Driven Drama',
          text: `Trapped between traditional family expectations and an illicit path to fortune, a desperate man discovers the fragile key that could either liberate or destroy everyone he loves.`,
          nodeType: 'action',
        },
        {
          tag: 'Telugu Indie Pitch',
          text: `In the rain-soaked alleys of modern Hyderabad, an ordinary man's fragile ambitions collide with unforgiving reality in a psychological race against time.`,
          nodeType: 'action',
        },
      ],
    },
    action_punch: {
      title: 'Action Beat Punch-Up (Visceral Present-Tense)',
      subtitle: 'Cinematic prose with rhythmic camera direction and heightened sensory details:',
      options: [
        {
          tag: 'Sensory Detail',
          text: `The bronze key slips from his slick palm, hitting the linoleum with a dull CLINK that echoes through the quiet room. Outside, thunder rumbles low.`,
          nodeType: 'action',
        },
        {
          tag: 'Visual Metaphor',
          text: `A draft from the cracked window stirs the top card. It wavers, catches balance, then stays upright—a miracle built on friction and borrowed time.`,
          nodeType: 'action',
        },
        {
          tag: 'Cinematic Camera',
          text: `CLOSE ON the antique key's notched teeth. सुरेश's knuckles whiten as he grips it tight enough to cut the flesh.`,
          nodeType: 'action',
        },
      ],
    },
    dialogue_subtext: {
      title: 'Dialogue Subtext & Emotional Tension',
      subtitle: `Punchier lines for ${selectedCharacter || 'Character'} replacing on-the-nose exposition:`,
      options: [
        {
          tag: 'Unspoken Guilt',
          text: `కొన్ని రహస్యాలు తాళాలు వేసిన గదుల్లోనే ఉండాలి... బయటకు వస్తే అందరం మసి అయిపోతాం.`,
          nodeType: 'dialogue',
        },
        {
          tag: 'Hard Realism',
          text: `గాలి వీస్తే పేక మేడ కూలిపోవడం తప్పు కాదు... గాలి వస్తుందని తెలిసి కూడా కట్టడం మన తప్పు.`,
          nodeType: 'dialogue',
        },
        {
          tag: 'Quiet Defiance',
          text: `తాళం చెవి చేతిలో ఉంది కదా అని తలుపులు తీయకూడదు. అవతల ఉన్నది వెలుతురో, చీకటో నీకు తెలియదు.`,
          nodeType: 'dialogue',
        },
      ],
    },
    telugu_phrasing: {
      title: 'Authentic Telugu Nuances & Idioms',
      subtitle: 'Colloquial screen expressions that resonate deeply with regional audiences:',
      options: [
        {
          tag: 'Colloquial Punch',
          text: `ఈ పేక మేడలు ఎప్పుడు కూలిపోతాయో ఎవరికీ తెలియదు... కానీ కూలేటప్పుడు వచ్చే శబ్దం ఊరంతా వింటుంది!`,
          nodeType: 'dialogue',
        },
        {
          tag: 'Philosophical Tone',
          text: `మనం ఆశలతో మేడలు కడతాం, కానీ విధి ఒక చిన్న చిరునవ్వుతో దాన్ని నేలమట్టం చేస్తుంది.`,
          nodeType: 'dialogue',
        },
        {
          tag: 'Street-Smart Grit',
          text: `ఆట మొదలైన తర్వాత కార్డులను నిందించడం అనవసరం... చేతిలో ఉన్నదాంతోనే గెలవాలి.`,
          nodeType: 'dialogue',
        },
      ],
    },
  };

  const currentToolData = suggestions[activeTool];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInsert = (text: string, type: 'action' | 'dialogue') => {
    if (onInsertNode) {
      onInsertNode({
        id: `assistant-node-${Date.now()}`,
        type,
        text,
      });
    } else {
      // Default dispatch event
      window.dispatchEvent(
        new CustomEvent('insert-script-element', {
          detail: { type, text },
        })
      );
    }
    onClose();
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
            <Sparkles size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
              FILMMAKER SCRIPT CRAFT & CREATIVE ASSISTANT
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

        {/* Tool Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-app)',
            padding: '0 1rem',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setActiveTool('logline')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTool === 'logline' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              padding: '10px 12px',
              color: activeTool === 'logline' ? 'var(--accent-gold)' : 'var(--ink-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Film size={14} />
            <span>Logline Pitch</span>
          </button>

          <button
            onClick={() => setActiveTool('action_punch')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTool === 'action_punch' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              padding: '10px 12px',
              color: activeTool === 'action_punch' ? 'var(--accent-gold)' : 'var(--ink-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Wand2 size={14} />
            <span>Action Punch-Up</span>
          </button>

          <button
            onClick={() => setActiveTool('dialogue_subtext')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTool === 'dialogue_subtext' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              padding: '10px 12px',
              color: activeTool === 'dialogue_subtext' ? 'var(--accent-gold)' : 'var(--ink-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MessageSquare size={14} />
            <span>Dialogue Subtext</span>
          </button>

          <button
            onClick={() => setActiveTool('telugu_phrasing')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTool === 'telugu_phrasing' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              padding: '10px 12px',
              color: activeTool === 'telugu_phrasing' ? 'var(--accent-gold)' : 'var(--ink-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Languages size={14} />
            <span>Telugu Nuances</span>
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
              {currentToolData.title}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--ink-dim)', marginTop: '2px' }}>
              {currentToolData.subtitle}
            </p>
          </div>

          {/* Character selector for dialogue tools */}
          {(activeTool === 'dialogue_subtext' || activeTool === 'telugu_phrasing') && characters.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Focus Character:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {characters.map(char => (
                  <button
                    key={char}
                    onClick={() => setSelectedCharacter(char)}
                    style={{
                      backgroundColor: selectedCharacter === char ? 'var(--accent-gold)' : 'var(--bg-panel)',
                      color: selectedCharacter === char ? '#000000' : 'var(--ink-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentToolData.options.map((opt, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      backgroundColor: 'rgba(217, 119, 6, 0.15)',
                      color: 'var(--accent-gold)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {opt.tag}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleCopy(opt.text, idx)}
                      title="Copy to clipboard"
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        color: 'var(--ink-muted)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copiedIndex === idx ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleInsert(opt.text, opt.nodeType)}
                      title="Insert directly into screenplay"
                      style={{
                        backgroundColor: 'var(--accent-amber)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        color: '#000000',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <PlusCircle size={12} />
                      <span>Insert into Script</span>
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: opt.nodeType === 'dialogue' ? 'var(--font-script)' : 'inherit',
                    fontSize: '13px',
                    color: '#f1f5f9',
                    lineHeight: 1.5,
                  }}
                >
                  {opt.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info note */}
        <div
          style={{
            padding: '10px 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-app)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--ink-dim)',
          }}
        >
          <Lightbulb size={13} color="var(--accent-gold)" />
          <span>
            Writer agency is strictly protected: AI recommendations are never automatically applied without explicit writer selection.
          </span>
        </div>
      </div>
    </div>
  );
};
