import { useState, useEffect, useCallback, useRef } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';

const STORAGE_KEY = 'scriptcraft_active_document_v1';

export type SaveStatus = 'saved' | 'saving' | 'offline_ready';

export function useScreenplayPersistence(initialDocument: ScreenplayDocument) {
  const [document, setDocument] = useState<ScreenplayDocument>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as ScreenplayDocument;
      }
    } catch (e) {
      console.warn('Failed to read from local persistence:', e);
    }
    return initialDocument;
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistDocument = useCallback((updatedDoc: ScreenplayDocument) => {
    setDocument(updatedDoc);
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce write to storage by 300ms to guarantee zero UI lag while typing
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDoc));
        setSaveStatus('saved');
        setLastSavedAt(new Date());
      } catch (err) {
        console.error('Local persistence write error:', err);
        setSaveStatus('offline_ready');
      }
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    document,
    persistDocument,
    saveStatus,
    lastSavedAt,
  };
}
