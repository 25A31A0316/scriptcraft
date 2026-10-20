import { useState, useEffect, useCallback } from 'react';
import {
  ScreenplayDocument,
  ScreenplayElementType,
  ScreenplayNode,
  validateScreenplayDocument,
  sanitizeScreenplayDocument,
} from '@screenplay/schema';
import { useScreenplayPersistence } from './hooks/useScreenplayPersistence';
import { useCollaborationSync } from './hooks/useCollaborationSync';
import { ScriptTopBar } from './components/ScriptTopBar';
import { SceneOutliner } from './components/SceneOutliner';
import { CharacterTracker } from './components/CharacterTracker';
import { ScreenplayEditor } from './components/ScreenplayEditor';
import { BeatBoard } from './components/BeatBoard';
import { ProductionBreakdown } from './components/ProductionBreakdown';
import { RevisionManager } from './components/RevisionManager';
import { ScriptReportsModal } from './components/ScriptReportsModal';
import { ContinuityModal } from './components/ContinuityModal';
import { ScriptAssistantModal } from './components/ScriptAssistantModal';
import { SceneTaggingModal, ProductionElements } from './components/SceneTaggingModal';
import { TableReadModal } from './components/TableReadModal';
import { TitlePageModal } from './components/TitlePageModal';
import { DualDialogueModal } from './components/DualDialogueModal';
import { DirectorCommentsModal } from './components/DirectorCommentsModal';
import { DocumentLibraryModal } from './components/DocumentLibraryModal';
import { ScriptStatusBar } from './components/ScriptStatusBar';
import {
  generateFountain,
  parseFountain,
  generateFinalDraftXml,
  parseFinalDraftXml,
} from '@screenplay/import-export';
import { downloadFile } from './utils/exportHelpers';

const INITIAL_SCREENPLAY: ScreenplayDocument = {
  id: 'peka-medalu-001',
  title: 'Peka Medalu',
  format: 'feature',
  titlePage: {
    title: 'PEKA MEDALU',
    credit: 'Written by',
    author: 'Prasanth',
    draftDate: 'October 2026',
    contact: 'Draft 1 - Production',
  },
  nodes: [
    {
      id: 'node-sc-1',
      type: 'scene_heading',
      text: 'INT. LIVING ROOM - NIGHT',
      metadata: {
        sceneNumber: '1',
        environment: 'INT.',
        location: 'LIVING ROOM',
        timeOfDay: 'NIGHT',
      },
    },
    {
      id: 'node-ac-1',
      type: 'action',
      text: 'A delicate house of cards stands in the center of an aged coffee table. A vintage ceiling fan rotates with a steady rhythmic creak.',
    },
    {
      id: 'node-ch-1',
      type: 'character',
      text: 'SURESH',
    },
    {
      id: 'node-pa-1',
      type: 'parenthetical',
      text: '(whispering in Telugu)',
    },
    {
      id: 'node-di-1',
      type: 'dialogue',
      text: 'ఈ పేక మేడలు ఎప్పుడు కూలిపోతాయో ఎవరికీ తెలియదు.',
    },
    {
      id: 'node-ac-2',
      type: 'action',
      text: 'Suresh reaches into his pocket, his fingers trembling slightly as he pulls out an old bronze key.',
    },
    {
      id: 'node-sc-2',
      type: 'scene_heading',
      text: 'EXT. BALCONY - CONTINUOUS',
      metadata: {
        sceneNumber: '2',
        environment: 'EXT.',
        location: 'BALCONY',
        timeOfDay: 'CONTINUOUS',
      },
    },
    {
      id: 'node-ac-3',
      type: 'action',
      text: 'The city lights stretch out into the dark horizon. Rain begins to tap lightly against the corrugated tin roof.',
    },
  ],
  revision: {
    currentColor: 'white',
    version: 1,
    lockedSceneNumbers: false,
  },
  language: {
    primary: 'te-IN',
    secondary: 'en-US',
    direction: 'ltr',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function App() {
  const {
    document,
    persistDocument,
    saveStatus,
    lastSavedAt,
    switchDocument,
    createNewDocument,
    duplicateCurrentDocument,
  } = useScreenplayPersistence(INITIAL_SCREENPLAY);

  const [activeElement, setActiveElement] = useState<ScreenplayElementType>('action');
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [characterOpen, setCharacterOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'editor' | 'beatboard' | 'breakdown'>('editor');
  const [spellcheckEnabled, setSpellcheckEnabled] = useState(true);
  const [distractionFree, setDistractionFree] = useState(false);

  // Modals state
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [continuityModalOpen, setContinuityModalOpen] = useState(false);
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);
  const [taggingModalOpen, setTaggingModalOpen] = useState(false);
  const [activeTagSceneId, setActiveTagSceneId] = useState<string>('');
  const [tableReadModalOpen, setTableReadModalOpen] = useState(false);
  const [titlePageModalOpen, setTitlePageModalOpen] = useState(false);
  const [dualDialogueModalOpen, setDualDialogueModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [theme, setTheme] = useState<'obsidian' | 'classic' | 'slate'>('obsidian');

  useEffect(() => {
    window.document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle remote updates from collaboration peers
  const handleRemoteDocumentUpdate = useCallback(
    (remoteDoc: ScreenplayDocument) => {
      persistDocument(remoteDoc);
    },
    [persistDocument]
  );

  // Cloud & Real-time Collaboration Sync
  const {
    connectionStatus,
    peers,
    broadcastCursor,
    broadcastDocumentUpdate,
    saveCloudSnapshot,
  } = useCollaborationSync(document.id, 'Prasanth (Director)', handleRemoteDocumentUpdate);

  const handleDocumentChange = (updatedDoc: ScreenplayDocument) => {
    persistDocument(updatedDoc);
    broadcastDocumentUpdate(updatedDoc);
    saveCloudSnapshot(updatedDoc);
  };

  // Cursor-aware insertion for Dual Dialogue
  const handleInsertDualDialogue = (newNodes: ScreenplayNode[]) => {
    window.dispatchEvent(
      new CustomEvent('insert-screenplay-nodes', { detail: { nodes: newNodes } })
    );
  };

  // Cursor-aware insertion for Assistant suggestions
  const handleInsertNodeFromAssistant = (newNode: ScreenplayNode) => {
    window.dispatchEvent(
      new CustomEvent('insert-screenplay-nodes', { detail: { nodes: [newNode] } })
    );
  };

  const handleOpenTagScene = (sceneId: string) => {
    setActiveTagSceneId(sceneId);
    setTaggingModalOpen(true);
  };

  const handleUpdateSceneMetadata = (sceneId: string, elements: ProductionElements) => {
    const updatedNodes = document.nodes.map((n) => {
      if (n.id === sceneId) {
        return {
          ...n,
          metadata: {
            ...(n.metadata || {}),
            productionElements: elements,
          },
        };
      }
      return n;
    });
    handleDocumentChange({
      ...document,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSelectSceneFromBoard = (sceneId: string) => {
    setViewMode('editor');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('jump-to-scene', { detail: { sceneId } }));
    }, 100);
  };

  const handleTitleChange = (newTitle: string) => {
    handleDocumentChange({
      ...document,
      title: newTitle,
      titlePage: {
        ...document.titlePage,
        title: newTitle.toUpperCase(),
      },
    });
  };

  const handleExportFountain = () => {
    const fountainText = generateFountain(document);
    const filename = `${document.title.toLowerCase().replace(/\s+/g, '_')}.fountain`;
    downloadFile(filename, fountainText, 'text/plain;charset=utf-8');
  };

  const handleExportFDX = () => {
    const fdxXml = generateFinalDraftXml(document);
    const filename = `${document.title.toLowerCase().replace(/\s+/g, '_')}.fdx`;
    downloadFile(filename, fdxXml, 'application/xml;charset=utf-8');
  };

  const handleExportJSON = () => {
    const jsonText = JSON.stringify(document, null, 2);
    const filename = `${document.title.toLowerCase().replace(/\s+/g, '_')}_backup.json`;
    downloadFile(filename, jsonText, 'application/json');
  };

  const handleImportScript = async (file: File) => {
    const text = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
      let imported: ScreenplayDocument;
      if (ext === 'fdx' || text.includes('<FinalDraft')) {
        imported = parseFinalDraftXml(text);
      } else if (ext === 'json') {
        const parsed = JSON.parse(text);
        const validation = validateScreenplayDocument(parsed);
        if (!validation.valid) {
          alert('Import Rejected — Invalid Screenplay JSON Schema:\n• ' + validation.errors.join('\n• '));
          return;
        }
        imported = sanitizeScreenplayDocument(parsed as ScreenplayDocument);
      } else {
        // Default to Fountain format
        imported = parseFountain(text);
      }

      if (!imported.title || imported.title === 'Untitled Screenplay') {
        imported.title = file.name.replace(/\.[^/.]+$/, '');
      }

      handleDocumentChange(imported);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Failed to parse script file: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Top Application Bar (hidden during printing automatically via CSS) */}
      <ScriptTopBar
        document={document}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        cloudStatus={connectionStatus}
        peerCount={peers.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenLibrary={() => setLibraryModalOpen(true)}
        spellcheckEnabled={spellcheckEnabled}
        onToggleSpellcheck={() => setSpellcheckEnabled(!spellcheckEnabled)}
        distractionFree={distractionFree}
        onToggleDistractionFree={() => setDistractionFree(!distractionFree)}
        onOpenRevisions={() => setRevisionModalOpen(true)}
        onOpenReports={() => setReportsModalOpen(true)}
        onOpenContinuity={() => setContinuityModalOpen(true)}
        onOpenAssistant={() => setAssistantModalOpen(true)}
        onOpenTableRead={() => setTableReadModalOpen(true)}
        onOpenTitlePage={() => setTitlePageModalOpen(true)}
        onOpenDualDialogue={() => setDualDialogueModalOpen(true)}
        onOpenComments={() => setCommentsModalOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
        onTitleChange={handleTitleChange}
        outlineOpen={outlineOpen && !distractionFree}
        onToggleOutline={() => setOutlineOpen(!outlineOpen)}
        characterOpen={characterOpen && !distractionFree}
        onToggleCharacter={() => setCharacterOpen(!characterOpen)}
        onExportFountain={handleExportFountain}
        onExportFDX={handleExportFDX}
        onExportJSON={handleExportJSON}
        onPrintPDF={handlePrintPDF}
        onImportScript={handleImportScript}
      />

      {/* Main Studio Workspace */}
      {viewMode === 'editor' ? (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Scene Outline Rail (Hidden in Distraction-Free Mode) */}
          {!distractionFree && (
            <SceneOutliner
              document={document}
              isOpen={outlineOpen}
              onToggle={() => setOutlineOpen(!outlineOpen)}
            />
          )}

          {/* Center: The Writing Surface */}
          <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <ScreenplayEditor
              initialDocument={document}
              spellcheckEnabled={spellcheckEnabled}
              onDocumentChange={handleDocumentChange}
              onActiveElementChange={setActiveElement}
              onCursorChange={broadcastCursor}
            />
          </main>

          {/* Right: Cast & Dialogue Stats Rail (Hidden in Distraction-Free Mode) */}
          {!distractionFree && (
            <CharacterTracker
              document={document}
              isOpen={characterOpen}
            />
          )}
        </div>
      ) : viewMode === 'beatboard' ? (
        <BeatBoard
          document={document}
          onSelectScene={handleSelectSceneFromBoard}
        />
      ) : (
        <ProductionBreakdown
          document={document}
          onSelectScene={handleSelectSceneFromBoard}
          onTagScene={handleOpenTagScene}
        />
      )}

      {/* Bottom Status Bar */}
      {!distractionFree && (
        <ScriptStatusBar
          document={document}
          activeElement={activeElement}
        />
      )}

      {/* Document Library Modal */}
      <DocumentLibraryModal
        isOpen={libraryModalOpen}
        activeDocId={document.id}
        onClose={() => setLibraryModalOpen(false)}
        onOpenDocument={async (id) => {
          await switchDocument(id);
        }}
        onCreateNew={async () => {
          await createNewDocument('New Screenplay');
        }}
        onDuplicate={async () => {
          await duplicateCurrentDocument();
        }}
      />

      {/* Production Revisions Modal */}
      <RevisionManager
        document={document}
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        onUpdateRevision={handleDocumentChange}
      />

      {/* Script Reports & Eighths Modal */}
      <ScriptReportsModal
        document={document}
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
      />

      {/* Script Continuity & Format Audit Modal */}
      <ContinuityModal
        document={document}
        isOpen={continuityModalOpen}
        onClose={() => setContinuityModalOpen(false)}
      />

      {/* Filmmaker Creative Assistant Modal */}
      <ScriptAssistantModal
        document={document}
        isOpen={assistantModalOpen}
        onClose={() => setAssistantModalOpen(false)}
        onInsertNode={handleInsertNodeFromAssistant}
      />

      {/* Scene Production Elements Tagger Modal */}
      <SceneTaggingModal
        document={document}
        sceneId={activeTagSceneId}
        isOpen={taggingModalOpen}
        onClose={() => setTaggingModalOpen(false)}
        onUpdateSceneMetadata={handleUpdateSceneMetadata}
      />

      {/* Table Read & Teleprompter Modal */}
      <TableReadModal
        document={document}
        isOpen={tableReadModalOpen}
        onClose={() => setTableReadModalOpen(false)}
      />

      {/* Hollywood Title Page Designer Modal */}
      <TitlePageModal
        document={document}
        isOpen={titlePageModalOpen}
        onClose={() => setTitlePageModalOpen(false)}
        onUpdateTitlePage={handleDocumentChange}
      />

      {/* Dual Dialogue Simultaneous Speech Modal */}
      <DualDialogueModal
        document={document}
        isOpen={dualDialogueModalOpen}
        onClose={() => setDualDialogueModalOpen(false)}
        onInsertDualDialogue={handleInsertDualDialogue}
      />

      {/* Director Sticky Notes & Margin Comments Modal */}
      <DirectorCommentsModal
        document={document}
        isOpen={commentsModalOpen}
        onClose={() => setCommentsModalOpen(false)}
        onSelectScene={handleSelectSceneFromBoard}
      />
    </div>
  );
}
