import React, { useState } from 'react';
import { ScreenplayDocument, ScreenplayNode } from '@screenplay/schema';
import {
  Tag,
  Package,
  Shirt,
  Volume2,
  Sparkles,
  Shield,
  Plus,
  X,
  Check,
} from 'lucide-react';

export interface ProductionElements {
  props: string[];
  wardrobe: string[];
  sfx: string[];
  vfx: string[];
  equipment: string[];
  notes?: string;
}

interface SceneTaggingModalProps {
  document: ScreenplayDocument;
  sceneId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSceneMetadata: (sceneId: string, elements: ProductionElements) => void;
}

export const SceneTaggingModal: React.FC<SceneTaggingModalProps> = ({
  document,
  sceneId,
  isOpen,
  onClose,
  onUpdateSceneMetadata,
}) => {
  const sceneNode = document.nodes.find(n => n.id === sceneId && n.type === 'scene_heading');

  const existingElements: ProductionElements = (sceneNode?.metadata as Record<string, unknown>)
    ?.productionElements as ProductionElements || {
    props: [],
    wardrobe: [],
    sfx: [],
    vfx: [],
    equipment: [],
    notes: '',
  };

  const [elements, setElements] = useState<ProductionElements>(existingElements);
  const [activeCategory, setActiveCategory] = useState<'props' | 'wardrobe' | 'sfx' | 'vfx' | 'equipment'>('props');
  const [newTagInput, setNewTagInput] = useState('');

  // Update local state when sceneId or modal opens
  React.useEffect(() => {
    if (sceneNode) {
      const current = (sceneNode.metadata as Record<string, unknown>)?.productionElements as ProductionElements;
      setElements(
        current || {
          props: sceneNode.text.includes('LIVING ROOM') ? ['Antique Bronze Key', 'House of Cards', 'Vintage Table'] : [],
          wardrobe: sceneNode.text.includes('LIVING ROOM') ? ['Simple Cotton Kurta'] : ['Raincoat'],
          sfx: sceneNode.text.includes('LIVING ROOM') ? ['Ceiling Fan Creak', 'Whisper'] : ['Corrugated Tin Rain', 'Distant Thunder'],
          vfx: sceneNode.text.includes('BALCONY') ? ['Rain Over City Lights'] : [],
          equipment: sceneNode.text.includes('BALCONY') ? ['Steadicam Rig', 'Rain Deflector'] : [],
          notes: '',
        }
      );
    }
  }, [sceneId, sceneNode, isOpen]);

  if (!isOpen || !sceneNode) return null;

  const handleAddTag = () => {
    const val = newTagInput.trim();
    if (!val) return;
    if (elements[activeCategory].includes(val)) return;

    const updated = {
      ...elements,
      [activeCategory]: [...elements[activeCategory], val],
    };
    setElements(updated);
    setNewTagInput('');
    onUpdateSceneMetadata(sceneId, updated);
  };

  const handleRemoveTag = (category: keyof ProductionElements, tagToRemove: string) => {
    if (!Array.isArray(elements[category])) return;
    const updated = {
      ...elements,
      [category]: (elements[category] as string[]).filter(t => t !== tagToRemove),
    };
    setElements(updated);
    onUpdateSceneMetadata(sceneId, updated);
  };

  const categories = [
    { key: 'props', label: 'Props', icon: Package, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    { key: 'wardrobe', label: 'Wardrobe', icon: Shirt, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    { key: 'sfx', label: 'Sound FX', icon: Volume2, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
    { key: 'vfx', label: 'VFX / CGI', icon: Sparkles, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
    { key: 'equipment', label: 'Special Rig', icon: Shield, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
  ] as const;

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
          width: '640px',
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
            <Tag size={18} color="var(--accent-gold)" />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                SCENE PRODUCTION ELEMENTS TAGGER
              </h3>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: '12px', color: 'var(--accent-gold)', marginTop: '2px' }}>
                {sceneNode.text}
              </div>
            </div>
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

        {/* Category Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-app)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 1rem',
            gap: '6px',
            overflowX: 'auto',
          }}
        >
          {categories.map(cat => {
            const Icon = cat.icon;
            const count = elements[cat.key]?.length || 0;
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: isSelected ? `2px solid ${cat.color}` : '2px solid transparent',
                  padding: '10px 12px',
                  color: isSelected ? cat.color : 'var(--ink-muted)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    style={{
                      fontSize: '10px',
                      backgroundColor: cat.bg,
                      color: cat.color,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Add Tag Input */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder={`Add new ${activeCategory} (e.g. ${
                activeCategory === 'props'
                  ? 'Key, Letter, Gun'
                  : activeCategory === 'wardrobe'
                  ? 'Suit, Muddy Shoes'
                  : activeCategory === 'sfx'
                  ? 'Gunshot, Car Horn'
                  : 'Green Screen'
              })...`}
              value={newTagInput}
              onChange={e => setNewTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTag()}
              style={{
                flex: 1,
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'var(--ink-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAddTag}
              disabled={!newTagInput.trim()}
              style={{
                backgroundColor: 'var(--accent-amber)',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 14px',
                fontWeight: 600,
                fontSize: '12px',
                cursor: newTagInput.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} />
              <span>Add Tag</span>
            </button>
          </div>

          {/* Current Category Badges */}
          <div style={{ marginBottom: '2rem' }}>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--ink-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Tagged in Scene ({elements[activeCategory]?.length || 0})
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(elements[activeCategory] || []).length === 0 ? (
                <div style={{ color: 'var(--ink-dim)', fontSize: '12px', fontStyle: 'italic' }}>
                  No {activeCategory} tagged for this scene yet. Type above to add!
                </div>
              ) : (
                elements[activeCategory].map(tag => {
                  const currentCatObj = categories.find(c => c.key === activeCategory);
                  return (
                    <div
                      key={tag}
                      style={{
                        backgroundColor: currentCatObj?.bg || 'var(--bg-panel)',
                        border: `1px solid ${currentCatObj?.color || 'var(--border-subtle)'}`,
                        borderRadius: '20px',
                        padding: '4px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(activeCategory, tag)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--ink-muted)',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Summary Strip of All Categories */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Full Scene Breakdown Overview
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              {categories.map(cat => (
                <div key={cat.key} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '100px', color: cat.color, fontWeight: 600 }}>
                    {cat.label}:
                  </span>
                  <span style={{ color: elements[cat.key]?.length ? '#f8fafc' : 'var(--ink-dim)' }}>
                    {elements[cat.key]?.join(', ') || 'None'}
                  </span>
                </div>
              ))}
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
              backgroundColor: 'var(--accent-amber)',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Check size={14} />
            <span>Done Tagging</span>
          </button>
        </div>
      </div>
    </div>
  );
};
