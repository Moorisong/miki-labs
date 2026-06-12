import { useState, useEffect } from 'react';

export function usePuzzleBaskets(trayPieces: number[]) {
  const [activeBasket, setActiveBasket] = useState<string>('basket1');
  const [hoveredBasket, setHoveredBasket] = useState<string | null>(null);
  const [baskets, setBaskets] = useState<Record<string, number[]>>({
    basket1: [],
    basket2: [],
    basket3: [],
    basket4: [],
    basket5: [],
  });

  // 로컬스토리지에서 바구니 데이터 로드 (마운트 시)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `puzzle-baskets-${window.location.pathname}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setBaskets(parsed);
        }
      } catch (e) {}
    }
  }, []);

  // trayPieces 데이터와 로컬 바구니 동기화
  useEffect(() => {
    setBaskets((prev) => {
      const allPiecesInBaskets = new Set(Object.values(prev).flat());
      const traySet = new Set(trayPieces);

      // 1. 트레이에 없는 조각은 바구니에서도 삭제
      const nextBaskets = { ...prev };
      for (const key in nextBaskets) {
        nextBaskets[key] = nextBaskets[key].filter((id) => traySet.has(id));
      }

      // 2. 바구니에 없는 새로운 조각은 현재 활성화된 바구니에 추가
      const newPieces = trayPieces.filter((id) => !allPiecesInBaskets.has(id));
      if (newPieces.length > 0) {
        const target = activeBasket || 'basket1';
        nextBaskets[target] = [...(nextBaskets[target] || []), ...newPieces];
      }

      // 로컬스토리지 저장
      if (typeof window !== 'undefined') {
        const key = `puzzle-baskets-${window.location.pathname}`;
        localStorage.setItem(key, JSON.stringify(nextBaskets));
      }

      return nextBaskets;
    });
  }, [trayPieces, activeBasket]);

  const movePieceToBasket = (pieceId: number, targetBasket: string) => {
    setBaskets((prev) => {
      const next = { ...prev };
      for (const key in next) {
        next[key] = next[key].filter((id) => id !== pieceId);
      }
      next[targetBasket] = [...(next[targetBasket] || []), pieceId];

      if (typeof window !== 'undefined') {
        const key = `puzzle-baskets-${window.location.pathname}`;
        localStorage.setItem(key, JSON.stringify(next));
      }

      return next;
    });
  };

  return {
    baskets,
    activeBasket,
    setActiveBasket,
    hoveredBasket,
    setHoveredBasket,
    movePieceToBasket,
  };
}
