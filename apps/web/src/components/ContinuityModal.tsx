import React, { useMemo } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';
import { analyzeContinuity, ContinuityIssue } from '../utils/continuityChecker';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

interface ContinuityModalProps {
  document: ScreenplayDocument;
  isOpen: boolean;
  onClose: () => void;
  onJumpToNode?: (nodeId: string) => void;
}

export const ContinuityModal: React.FC<ContinuityModalProps> = ({
  document,
  isOpen,
  onClose,
  onJumpToNode,
}) => {
  const issues = useMemo(() => analyzeContinuity(document), [document]);

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  // Compute a script health percentage
  const totalNodes = Math.max(1, document.nodes.length);
  const penalty = errors.length * 10 + warnings.length * 4;
  const healthScore = Math.max(0, Math.min(100, 100 - penalty));

  if (!isOpen) return null;

  const handleJump = (nodeId?: string) => {
    if (nodeId) {
      if (onJumpToNode) {
        onJumpToNode(nodeId);
      } else {
        window.dispatchEvent(new CustomEvent('jump-to-scene', { detail: { sceneId: nodeId } }));
      }
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
          width: '700px',
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
            <ShieldAlert size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
              SCRIPT CONTINUITY & FORMAT AUDIT
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

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Health Score Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                Script Formatting Health Score
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: healthScore > 80 ? '#4ade80' : healthScore > 60 ? '#facc15' : '#f87171',
                  marginTop: '2px',
                }}
              >
                {healthScore}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-dim)', marginTop: '4px' }}>
                {issues.length === 0
                  ? 'All industry rules passed. No formatting or continuity issues detected.'
                  : `${errors.length} formatting errors, ${warnings.length} continuity warnings detected.`}
              </div>
            </div>

            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: healthScore > 80 ? '#14532d' : healthScore > 60 ? '#713f12' : '#7f1d1d',
                color: healthScore > 80 ? '#4ade80' : healthScore > 60 ? '#facc15' : '#f87171',
              }}
            >
              {healthScore > 80 ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
            </div>
          </div>

          {/* Issues List */}
          <div>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '12px',
              }}
            >
              Audit Details ({issues.length} items)
            </h4>

            {issues.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-subtle)',
                }}
              >
                <CheckCircle size={36} color="#4ade80" style={{ margin: '0 auto 10px auto' }} />
                <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                  Your Screenplay is Production Ready!
                </h5>
                <p style={{ fontSize: '12px', color: 'var(--ink-dim)', marginTop: '4px' }}>
                  All sluglines contain valid INT./EXT. headers and day/night tags. Characters and dialogue are properly linked.
                </p>
              </div>
            ) : (
              issues.map(issue => (
                <div
                  key={issue.id}
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    border: `1px solid ${issue.type === 'error' ? '#991b1b' : '#854d0e'}`,
                    borderLeft: `4px solid ${issue.type === 'error' ? '#ef4444' : '#f59e0b'}`,
                    borderRadius: '6px',
                    padding: '12px 14px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {issue.type === 'error' ? (
                        <AlertOctagon size={16} color="#ef4444" />
                      ) : (
                        <AlertTriangle size={16} color="#f59e0b" />
                      )}
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        {issue.title}
                      </span>
                    </div>

                    {issue.nodeId && (
                      <button
                        onClick={() => handleJump(issue.nodeId)}
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
                        <span>Jump to Scene</span>
                        <ArrowRight size={11} />
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>
                    {issue.description}
                  </p>

                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--accent-gold)',
                      marginTop: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    💡 <strong>Recommendation:</strong> {issue.recommendation}
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
