import { ScreenplayDocument, ScreenplayFormatProfile, ScreenplayNode } from '@screenplay/schema';
import { validateScreenplayDocument, sanitizeScreenplayDocument } from '@screenplay/schema';

export interface DocumentMetadata {
  id: string;
  title: string;
  format: string;
  updatedAt: string;
  createdAt: string;
  sceneCount: number;
  characterCount: number;
}

const DB_NAME = 'ScriptCraftDB';
const DB_VERSION = 1;
const DOCS_STORE = 'documents';
const INDEX_STORE = 'metadata_index';

const LEGACY_STORAGE_KEY = 'scriptcraft_active_document_v1';
const ACTIVE_DOC_ID_KEY = 'scriptcraft_active_document_id';
const EMERGENCY_SYNC_KEY = 'scriptcraft_emergency_backup';

class ScriptCraftStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isIDBAvailable: boolean = true;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    } else {
      this.isIDBAvailable = false;
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(DOCS_STORE)) {
            db.createObjectStore(DOCS_STORE, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(INDEX_STORE)) {
            db.createObjectStore(INDEX_STORE, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('IndexedDB open error, falling back to localStorage');
          this.isIDBAvailable = false;
          reject(request.error);
        };
      } catch (err) {
        this.isIDBAvailable = false;
        reject(err);
      }
    });

    return this.dbPromise;
  }

  private extractMetadata(doc: ScreenplayDocument): DocumentMetadata {
    const sceneCount = (doc.nodes || []).filter(n => n.type === 'scene_heading').length;
    const characters = new Set((doc.nodes || []).filter(n => n.type === 'character').map(n => n.text.trim().toUpperCase()));

    return {
      id: doc.id,
      title: doc.title,
      format: doc.format || 'feature',
      updatedAt: doc.updatedAt || new Date().toISOString(),
      createdAt: doc.createdAt || new Date().toISOString(),
      sceneCount,
      characterCount: characters.size,
    };
  }

  /**
   * Migrate legacy single-document localStorage to IndexedDB
   */
  public async migrateLegacyDataIfPresent(fallbackInitialDoc: ScreenplayDocument): Promise<ScreenplayDocument> {
    try {
      const activeId = localStorage.getItem(ACTIVE_DOC_ID_KEY);
      if (activeId) {
        const loaded = await this.loadDocument(activeId);
        if (loaded) return loaded;
      }

      // Check legacy single-key
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          const validation = validateScreenplayDocument(parsed);
          const docToSave = validation.valid ? (parsed as ScreenplayDocument) : sanitizeScreenplayDocument(parsed);
          await this.saveDocument(docToSave);
          this.setActiveDocumentId(docToSave.id);
          console.info('Successfully migrated legacy screenplay to IndexedDB library:', docToSave.id);
          return docToSave;
        } catch (e) {
          console.warn('Legacy data parsing error during migration:', e);
        }
      }
    } catch (e) {
      console.warn('Migration error:', e);
    }

    // Default: save initial document
    await this.saveDocument(fallbackInitialDoc);
    this.setActiveDocumentId(fallbackInitialDoc.id);
    return fallbackInitialDoc;
  }

  public async saveDocument(doc: ScreenplayDocument): Promise<void> {
    const sanitized = sanitizeScreenplayDocument(doc);
    const meta = this.extractMetadata(sanitized);

    // Always mirror to localStorage as emergency fallback
    try {
      localStorage.setItem(`${LEGACY_STORAGE_KEY}_${sanitized.id}`, JSON.stringify(sanitized));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.warn('LocalStorage mirror warning:', e);
    }

    if (!this.isIDBAvailable) {
      return;
    }

    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([DOCS_STORE, INDEX_STORE], 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);

        tx.objectStore(DOCS_STORE).put(sanitized);
        tx.objectStore(INDEX_STORE).put(meta);
      });
    } catch (err) {
      console.error('IndexedDB save failed:', err);
      throw err;
    }
  }

  public async loadDocument(id: string): Promise<ScreenplayDocument | null> {
    if (this.isIDBAvailable) {
      try {
        const db = await this.initDB();
        const doc = await new Promise<ScreenplayDocument | null>((resolve, reject) => {
          const tx = db.transaction([DOCS_STORE], 'readonly');
          const request = tx.objectStore(DOCS_STORE).get(id);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
        if (doc) return doc;
      } catch (e) {
        console.warn('IndexedDB load failed, falling back to localStorage:', e);
      }
    }

    // LocalStorage fallback
    const raw = localStorage.getItem(`${LEGACY_STORAGE_KEY}_${id}`) || (localStorage.getItem(ACTIVE_DOC_ID_KEY) === id ? localStorage.getItem(LEGACY_STORAGE_KEY) : null);
    if (raw) {
      try {
        return JSON.parse(raw) as ScreenplayDocument;
      } catch {
        return null;
      }
    }
    return null;
  }

  public async listDocuments(): Promise<DocumentMetadata[]> {
    if (this.isIDBAvailable) {
      try {
        const db = await this.initDB();
        const list = await new Promise<DocumentMetadata[]>((resolve, reject) => {
          const tx = db.transaction([INDEX_STORE], 'readonly');
          const request = tx.objectStore(INDEX_STORE).getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });
        if (list && list.length > 0) {
          return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
      } catch (e) {
        console.warn('IndexedDB listDocuments failed:', e);
      }
    }

    // LocalStorage fallback index
    const metas: DocumentMetadata[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${LEGACY_STORAGE_KEY}_`)) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || '{}');
          if (parsed && parsed.id) {
            metas.push(this.extractMetadata(parsed));
          }
        } catch {
          // ignore corrupted keys
        }
      }
    }
    return metas;
  }

  public async createDocument(title = 'Untitled Screenplay', format: ScreenplayFormatProfile = 'feature'): Promise<ScreenplayDocument> {
    const newId = `scriptcraft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const newDoc: ScreenplayDocument = {
      id: newId,
      title,
      format,
      titlePage: {
        title: title.toUpperCase(),
        credit: 'Written by',
        author: 'Screenwriter',
        draftDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        contact: '',
      },
      nodes: [
        {
          id: `node-sc-${Date.now()}-1`,
          type: 'scene_heading',
          text: 'EXT. NEW LOCATION - DAY',
          metadata: {
            sceneNumber: '1',
            environment: 'EXT.',
            location: 'NEW LOCATION',
            timeOfDay: 'DAY',
          },
        },
        {
          id: `node-ac-${Date.now()}-2`,
          type: 'action',
          text: 'The scene opens with vivid imagery setting the stage for the story.',
        },
      ],
      revision: {
        currentColor: 'white',
        version: 1,
        lockedSceneNumbers: false,
      },
      language: {
        primary: 'en-US',
        direction: 'ltr',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveDocument(newDoc);
    this.setActiveDocumentId(newId);
    return newDoc;
  }

  public async duplicateDocument(sourceId: string, customTitle?: string): Promise<ScreenplayDocument> {
    const source = await this.loadDocument(sourceId);
    if (!source) throw new Error(`Source screenplay "${sourceId}" not found`);

    const newId = `scriptcraft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const duplicatedTitle = customTitle || `${source.title} (Copy)`;

    const duplicatedDoc: ScreenplayDocument = {
      ...source,
      id: newId,
      title: duplicatedTitle,
      titlePage: {
        ...source.titlePage,
        title: duplicatedTitle.toUpperCase(),
      },
      nodes: source.nodes.map(n => ({
        ...n,
        id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveDocument(duplicatedDoc);
    this.setActiveDocumentId(newId);
    return duplicatedDoc;
  }

  public async renameDocument(id: string, newTitle: string): Promise<void> {
    const doc = await this.loadDocument(id);
    if (!doc) throw new Error(`Document "${id}" not found`);
    doc.title = newTitle.trim();
    doc.titlePage.title = newTitle.trim().toUpperCase();
    doc.updatedAt = new Date().toISOString();
    await this.saveDocument(doc);
  }

  public async deleteDocument(id: string): Promise<void> {
    if (this.isIDBAvailable) {
      try {
        const db = await this.initDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction([DOCS_STORE, INDEX_STORE], 'readwrite');
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.objectStore(DOCS_STORE).delete(id);
          tx.objectStore(INDEX_STORE).delete(id);
        });
      } catch (e) {
        console.warn('IndexedDB delete failed:', e);
      }
    }

    try {
      localStorage.removeItem(`${LEGACY_STORAGE_KEY}_${id}`);
      if (this.getActiveDocumentId() === id) {
        localStorage.removeItem(ACTIVE_DOC_ID_KEY);
      }
    } catch {
      // ignore
    }
  }

  public getActiveDocumentId(): string {
    return localStorage.getItem(ACTIVE_DOC_ID_KEY) || '';
  }

  public setActiveDocumentId(id: string): void {
    localStorage.setItem(ACTIVE_DOC_ID_KEY, id);
  }

  /**
   * Emergency synchronous flush when window is closing or reloading
   */
  public flushSync(doc: ScreenplayDocument): void {
    try {
      const sanitized = sanitizeScreenplayDocument(doc);
      localStorage.setItem(EMERGENCY_SYNC_KEY, JSON.stringify(sanitized));
      localStorage.setItem(`${LEGACY_STORAGE_KEY}_${sanitized.id}`, JSON.stringify(sanitized));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(sanitized));
      localStorage.setItem(ACTIVE_DOC_ID_KEY, sanitized.id);
    } catch (e) {
      console.error('Emergency flush failed:', e);
    }
  }
}

export const storageManager = new ScriptCraftStorage();
