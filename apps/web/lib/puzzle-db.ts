import { PuzzlePiece } from './stores/puzzle-store';

export interface LocalPuzzleState {
  puzzleId: string;
  difficulty: 'novice' | 'beginner' | 'expert';
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

// 쓰기 속도 제한(Throttling)을 위한 시간 기록 및 타이머 맵
const debounceTimers = new Map<string, NodeJS.Timeout>();
const lastSaveTimes = new Map<string, number>();

export async function savePuzzleState(
  puzzleId: string,
  state: Omit<LocalPuzzleState, 'puzzleId' | 'updatedAt'>,
  immediate = false
): Promise<void> {
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
      lastSaveTimes.set(puzzleId, Date.now());
    } catch (error) {
      console.error('IndexedDB save failed:', error);
    }
  };

  if (immediate) {
    if (debounceTimers.has(puzzleId)) {
      clearTimeout(debounceTimers.get(puzzleId)!);
      debounceTimers.delete(puzzleId);
    }
    return saveFn();
  }

  const lastSave = lastSaveTimes.get(puzzleId) || 0;
  const now = Date.now();
  const THROTTLE_INTERVAL = 5000; // 5초 간격으로 최소 1회 쓰기 보장

  //마지막 저장으로부터 5초 이상 지났으면 즉시 저장
  if (now - lastSave >= THROTTLE_INTERVAL) {
    if (debounceTimers.has(puzzleId)) {
      clearTimeout(debounceTimers.get(puzzleId)!);
      debounceTimers.delete(puzzleId);
    }
    return saveFn();
  }

  // 이미 예약된 저장이 있다면 기존 예약을 유지 (매초 리셋하여 저장을 지연시키는 데브 바운스 버그 방지)
  if (debounceTimers.has(puzzleId)) {
    return;
  }

  // 남은 시간만큼 대기 후 저장 예약
  return new Promise((resolve) => {
    const delay = THROTTLE_INTERVAL - (now - lastSave);
    const timer = setTimeout(async () => {
      debounceTimers.delete(puzzleId);
      await saveFn();
      resolve();
    }, delay);

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
