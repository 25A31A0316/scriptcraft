import React, { useState } from 'react';
import { ScreenplayDocument, ScreenplayTitlePage } from '@screenplay/schema';
import {
  FileText,
  X,
  Check,
  Shield,
  Eye,
  Edit3,
} from 'lucide-react';

interface TitlePageModalProps {
  document: ScreenplayDocument;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTitlePage: (updatedDoc: ScreenplayDocument) => void;
}

export const TitlePageModal: React.FC<TitlePageModalProps> = ({
  document,
  isOpen,
  onClose,
  onUpdateTitlePage,
}) => {
  const currentTitlePage: ScreenplayTitlePage = document.titlePage || {
    title: document.title.toUpperCase(),
    credit: 'Written by',
    author: 'Author Name',
    draftDate: 'October 2026',
    contact: 'Contact Info',
  };

  const [form, setForm] = useState<ScreenplayTitlePage>(currentTitlePage);
  const [watermark, setWatermark] = useState<string>('CONFIDENTIAL - PRODUCTION DRAFT');
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: ScreenplayDocument = {
      ...document,
      title: form.title || document.title,
      titlePage: form,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTitlePage(updated);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 55,
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
          width: '780px',
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
            <FileText size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
              HOLLYWOOD TITLE PAGE DESIGNER & WATERMARK
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                onClick={() => setActiveTab('edit')}
                style={{
                  backgroundColor: activeTab === 'edit' ? 'var(--bg-panel)' : 'transparent',
                  color: activeTab === 'edit' ? 'var(--accent-gold)' : 'var(--ink-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Edit3 size={12} />
                <span>Editor</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                style={{
                  backgroundColor: activeTab === 'preview' ? 'var(--bg-panel)' : 'transparent',
                  color: activeTab === 'preview' ? 'var(--accent-gold)' : 'var(--ink-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Eye size={12} />
                <span>Page Preview</span>
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
                marginLeft: '8px',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'edit' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                  Screenplay Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#f8fafc',
                    fontFamily: 'var(--font-script)',
                    fontSize: '14px',
                    fontWeight: 700,
                    marginTop: '4px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                    Credit Line
                  </label>
                  <input
                    type="text"
                    value={form.credit || 'Written by'}
                    onChange={e => setForm({ ...form, credit: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: 'var(--ink-primary)',
                      fontSize: '12px',
                      marginTop: '4px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                    Author(s)
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm({ ...form, author: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: 'var(--ink-primary)',
                      fontSize: '12px',
                      marginTop: '4px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                  Source Material / Story By (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Based on an original story by..."
                  value={form.source || ''}
                  onChange={e => setForm({ ...form, source: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'var(--ink-primary)',
                    fontSize: '12px',
                    marginTop: '4px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                    Draft Date & Revision Color
                  </label>
                  <input
                    type="text"
                    value={form.draftDate || 'October 2026'}
                    onChange={e => setForm({ ...form, draftDate: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: 'var(--ink-primary)',
                      fontSize: '12px',
                      marginTop: '4px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                    WGA Registration / Copyright
                  </label>
                  <input
                    type="text"
                    placeholder="WGA Registration #..."
                    value={form.copyright || ''}
                    onChange={e => setForm({ ...form, copyright: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: 'var(--ink-primary)',
                      fontSize: '12px',
                      marginTop: '4px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                  Contact Information (Agent, Attorney, Production Co.)
                </label>
                <textarea
                  rows={2}
                  value={form.contact || ''}
                  onChange={e => setForm({ ...form, contact: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'var(--ink-primary)',
                    fontSize: '12px',
                    marginTop: '4px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Watermark Section */}
              <div
                style={{
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '12px',
                  marginTop: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} color="var(--accent-gold)" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                      Security Studio Watermark
                    </span>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={e => setShowWatermark(e.target.checked)}
                    />
                    <span>Enable Watermark</span>
                  </label>
                </div>

                {showWatermark && (
                  <input
                    type="text"
                    value={watermark}
                    onChange={e => setWatermark(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-panel)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      color: 'var(--accent-gold)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Live Hollywood Title Page 8.5" x 11" Paper Simulation */
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '420px',
                  height: '560px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  padding: '3rem 2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-script)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Diagonal Watermark if enabled */}
                {showWatermark && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-35deg)',
                      fontSize: '24px',
                      fontWeight: 800,
                      color: 'rgba(239, 68, 68, 0.18)',
                      letterSpacing: '0.15em',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {watermark}
                  </div>
                )}

                {/* Upper Middle: Title & Author */}
                <div style={{ marginTop: '5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'underline' }}>
                    {form.title.toUpperCase()}
                  </div>

                  <div style={{ fontSize: '11px', marginTop: '1.5rem', fontStyle: 'italic' }}>
                    {form.credit || 'written by'}
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '0.75rem' }}>
                    {form.author}
                  </div>

                  {form.source && (
                    <div style={{ fontSize: '10px', marginTop: '1rem', color: '#4b5563' }}>
                      {form.source}
                    </div>
                  )}
                </div>

                {/* Bottom Left & Right Metadata */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#1f2937', lineHeight: 1.4 }}>
                  <div>
                    {form.draftDate && <div>{form.draftDate}</div>}
                    <div style={{ textTransform: 'capitalize' }}>
                      {(document.revision?.currentColor || 'White')} Draft
                    </div>
                    {form.copyright && <div style={{ marginTop: '4px' }}>{form.copyright}</div>}
                  </div>

                  <div style={{ textAlign: 'right', whiteSpace: 'pre-wrap' }}>
                    {form.contact}
                  </div>
                </div>
              </div>
            </div>
          )}
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
            onClick={handleSave}
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
            <span>Apply to Script</span>
          </button>
        </div>
      </div>
    </div>
  );
};
