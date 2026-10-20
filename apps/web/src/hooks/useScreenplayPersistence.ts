import { useState, useEffect, useCallback, useRef } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';
import { storageManager, DocumentMetadata } from '../utils/storageManager';

export type LocalSaveStatus = 'saved' | 'saving' | 'error' | 'recovered';

export function useScreenplayPersistence(fallbackInitialDocument: ScreenplayDocument) {
  const [document, setDocument] = useState<ScreenplayDocument>(fallbackInitialDocument);
  const [saveStatus, setSaveStatus] = useState<LocalSaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // References to keep latest pending doc and timer
  const latestDocRef = useRef<ScreenplayDocument>(fallbackInitialDocument);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef<boolean>(false);

  // 1. Initial Load & Migration
  useEffect(() => {
    let mounted = true;
    async function initStorage() {
      try {
        const loadedDoc = await storageManager.migrateLegacyDataIfPresent(fallbackInitialDocument);
        if (mounted) {
          setDocument(loadedDoc);
          latestDocRef.current = loadedDoc;
          setIsInitialized(true);
          setLastSavedAt(new Date(loadedDoc.updatedAt || Date.now()));
        }
      } catch (err) {
        console.error('Persistence initialization error:', err);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    }
    initStorage();
    return () => {
      mounted = false;
    };
  }, []);

  // Flush pending changes to storage immediately
  const flushPendingSave = useCallback(async () => {
    if (!isDirtyRef.current) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    try {
      const docToSave = latestDocRef.current;
      storageManager.flushSync(docToSave);
      await storageManager.saveDocument(docToSave);
      isDirtyRef.current = false;
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      setErrorMessage(null);
    } catch (err) {
      console.error('Flush save failed:', err);
      setSaveStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Storage write failed');
    }
  }, []);

  // Debounced persist document
  const persistDocument = useCallback((updatedDoc: ScreenplayDocument) => {
    setDocument(updatedDoc);
    latestDocRef.current = updatedDoc;
    isDirtyRef.current = true;
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await storageManager.saveDocument(updatedDoc);
        isDirtyRef.current = false;
        setSaveStatus('saved');
        setLastSavedAt(new Date());
        setErrorMessage(null);
      } catch (err) {
        console.error('Local persistence write error:', err);
        setSaveStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'IndexedDB quota or write error');
      }
    }, 300);
  }, []);

  // Safety: Flush on unmount and beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirtyRef.current && latestDocRef.current) {
        storageManager.flushSync(latestDocRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);

      // Flush any pending save on component unmount
      if (isDirtyRef.current && latestDocRef.current) {
        storageManager.flushSync(latestDocRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Document Library Operations
  const switchDocument = useCallback(async (docId: string): Promise<boolean> => {
    // Flush current before switching
    await flushPendingSave();
    const nextDoc = await storageManager.loadDocument(docId);
    if (nextDoc) {
      storageManager.setActiveDocumentId(docId);
      setDocument(nextDoc);
      latestDocRef.current = nextDoc;
      setLastSavedAt(new Date(nextDoc.updatedAt || Date.now()));
      return true;
    }
    return false;
  }, [flushPendingSave]);

  const createNewDocument = useCallback(async (title?: string): Promise<ScreenplayDocument> => {
    await flushPendingSave();
    const newDoc = await storageManager.createDocument(title);
    setDocument(newDoc);
    latestDocRef.current = newDoc;
    setLastSavedAt(new Date());
    return newDoc;
  }, [flushPendingSave]);

  const duplicateCurrentDocument = useCallback(async (title?: string): Promise<ScreenplayDocument> => {
    await flushPendingSave();
    const duplicated = await storageManager.duplicateDocument(document.id, title);
    setDocument(duplicated);
    latestDocRef.current = duplicated;
    setLastSavedAt(new Date());
    return duplicated;
  }, [document.id, flushPendingSave]);

  const deleteDocument = useCallback(async (docId: string): Promise<void> => {
    await storageManager.deleteDocument(docId);
    if (docId === document.id) {
      const list = await storageManager.listDocuments();
      if (list.length > 0 && list[0]) {
        await switchDocument(list[0].id);
      } else {
        await createNewDocument('New Screenplay');
      }
    }
  }, [document.id, switchDocument, createNewDocument]);

  return {
    document,
    persistDocument,
    flushPendingSave,
    saveStatus,
    lastSavedAt,
    errorMessage,
    isInitialized,
    switchDocument,
    createNewDocument,
    duplicateCurrentDocument,
    deleteDocument,
  };
}
