import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  X,
  FileText,
  Clock,
  Layers,
  Users,
} from 'lucide-react';
import { storageManager, DocumentMetadata } from '../utils/storageManager';

interface DocumentLibraryModalProps {
  isOpen: boolean;
  activeDocId: string;
  onClose: () => void;
  onOpenDocument: (id: string) => void;
  onCreateNew: () => void;
  onDuplicate: (id: string) => void;
}

export const DocumentLibraryModal: React.FC<DocumentLibraryModalProps> = ({
  isOpen,
  activeDocId,
  onClose,
  onOpenDocument,
  onCreateNew,
  onDuplicate,
}) => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadList = async () => {
    try {
      const list = await storageManager.listDocuments();
      setDocuments(list);
    } catch (e) {
      console.error('Failed to load document list:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadList();
      setRenamingId(null);
      setConfirmDeleteId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartRename = (doc: DocumentMetadata) => {
    setRenamingId(doc.id);
    setRenameValue(doc.title);
  };

  const handleSaveRename = async (id: string) => {
    if (renameValue.trim()) {
      await storageManager.renameDocument(id, renameValue.trim());
      setRenamingId(null);
      await loadList();
    }
  };

  const handleDelete = async (id: string) => {
    await storageManager.deleteDocument(id);
    setConfirmDeleteId(null);
    await loadList();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-modal-title"
    >
      <div
        className="relative w-full max-w-3xl rounded-xl border p-6 shadow-2xl flex flex-col"
        style={{
          backgroundColor: 'var(--surface-primary, #12141a)',
          borderColor: 'var(--border-subtle, #2d3139)',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 id="library-modal-title" className="text-xl font-bold tracking-tight text-white">
                Screenplay Library
              </h2>
              <p className="text-xs text-gray-400">
                Manage, switch, or duplicate your scripts. Saved locally in high-capacity IndexedDB.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onCreateNew();
                onClose();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-sm"
              id="library-new-script-btn"
            >
              <Plus className="w-4 h-4" />
              New Script
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close document library"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Script List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {documents.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No screenplays found. Click "New Script" to start writing.
            </div>
          ) : (
            documents.map((doc) => {
              const isActive = doc.id === activeDocId;
              const isDeleting = confirmDeleteId === doc.id;
              const isRenaming = renamingId === doc.id;

              return (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    isActive
                      ? 'border-amber-500/50 bg-amber-500/5 shadow-md shadow-amber-500/5'
                      : 'border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/70'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      {isRenaming ? (
                        <div className="flex items-center gap-2 w-full max-w-sm">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(doc.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            className="bg-black/60 border border-amber-500/50 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:ring-1 focus:ring-amber-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(doc.id)}
                            className="p-1 text-green-400 hover:text-green-300"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRenamingId(null)}
                            className="p-1 text-gray-400 hover:text-gray-300"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3
                            className="text-sm font-semibold text-white truncate cursor-pointer hover:text-amber-400 transition-colors"
                            onClick={() => {
                              onOpenDocument(doc.id);
                              onClose();
                            }}
                          >
                            {doc.title}
                          </h3>
                          {isActive && (
                            <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Active
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-gray-500" />
                        {doc.sceneCount} {doc.sceneCount === 1 ? 'Scene' : 'Scenes'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        {doc.characterCount} {doc.characterCount === 1 ? 'Character' : 'Characters'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {new Date(doc.updatedAt).toLocaleDateString()} {new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {isDeleting ? (
                      <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/40 px-2 py-1 rounded">
                        <span className="text-[11px] text-red-300">Confirm delete?</span>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="px-2 py-0.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded font-medium"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {!isActive && (
                          <button
                            onClick={() => {
                              onOpenDocument(doc.id);
                              onClose();
                            }}
                            className="px-3 py-1 text-xs font-medium text-amber-400 hover:bg-amber-400/10 rounded transition-colors"
                          >
                            Open
                          </button>
                        )}
                        <button
                          onClick={() => handleStartRename(doc)}
                          className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                          title="Rename Screenplay"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onDuplicate(doc.id);
                            loadList();
                          }}
                          className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                          title="Duplicate Screenplay"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(doc.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                          title="Delete Screenplay"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span>{documents.length} scripts stored in local browser database</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs rounded border border-gray-700 hover:bg-gray-800 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
