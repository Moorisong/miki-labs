import { PuzzlePiece } from './stores/puzzle-store';

export interface LocalPuzzleState {
  puzzleId: string;
  difficulty: 'beginner' | 'expert';
  mode: 'ranked' | 'solo';
  timerSeconds: number;
  pieces: PuzzlePiece[];
  board: (number | null)[];
  trayPieces: number[];
  progress: number;
  completed: boolean;
  startedAt: string;
  updatedAt: string;
}

const DB_NAME = 'haruPuzzleDB';
const STORE_NAME = 'puzzleState';
const DB_VERSION = 2;

let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'puzzleId' });
      }
    };
  });
}

// 2초 디바운스를 위한 타이머 맵
const debounceTimers = new Map<string, NodeJS.Timeout>();

export async function savePuzzleState(
  puzzleId: string,
  state: Omit<LocalPuzzleState, 'puzzleId' | 'updatedAt'>,
  immediate = false
): Promise<void> {
  // 기존 타이머 클리어
  if (debounceTimers.has(puzzleId)) {
    clearTimeout(debounceTimers.get(puzzleId)!);
    debounceTimers.delete(puzzleId);
  }

  const saveFn = async () => {
    try {
      const db = await getDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const data: LocalPuzzleState = {
        puzzleId,
        ...state,
        updatedAt: new Date().toISOString(),
      };

      store.put(data);
    } catch (error) {
      console.error('IndexedDB save failed:', error);
    }
  };

  if (immediate) {
    return saveFn();
  }

  return new Promise((resolve) => {
    const timer = setTimeout(async () => {
      await saveFn();
      resolve();
    }, 2000); // 2초 디바운스

    debounceTimers.set(puzzleId, timer);
  });
}

export async function loadPuzzleState(puzzleId: string): Promise<LocalPuzzleState | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(puzzleId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error('IndexedDB load error:', request.error);
        resolve(null);
      };
    });
  } catch (error) {
    console.error('IndexedDB load failed:', error);
    return null;
  }
}

export async function deletePuzzleState(puzzleId: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(puzzleId);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('IndexedDB delete error:', request.error);
        resolve();
      };
    });
  } catch (error) {
    console.error('IndexedDB delete failed:', error);
  }
}

export async function clearAllPuzzleState(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('IndexedDB clear error:', request.error);
        resolve();
      };
    });
  } catch (error) {
    console.error('IndexedDB clear failed:', error);
  }
}
