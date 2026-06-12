import { useState, useRef, useEffect } from 'react';

interface UsePieceDragProps {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  movePieceToBasket: (pieceId: number, targetBasket: string) => void;
  setHoveredBasket: (basket: string | null) => void;
}

export function usePieceDrag({
  isDrawerOpen,
  setIsDrawerOpen,
  movePieceToBasket,
  setHoveredBasket,
}: UsePieceDragProps) {
  const [draggedPiece, setDraggedPiece] = useState<{
    id: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
    pointerId: number;
  } | null>(null);

  const longPressTimeout = useRef<any>(null);
  const dragActiveRef = useRef<boolean>(false);
  const startCoords = useRef<{ x: number; y: number } | null>(null);
  const lastCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const ignoreNextClickRef = useRef<boolean>(false);

  const globalMoveRef = useRef<any>(null);
  const globalUpRef = useRef<any>(null);
  const globalCancelRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (globalMoveRef.current) {
        window.removeEventListener('pointermove', globalMoveRef.current);
        window.removeEventListener('touchmove', globalMoveRef.current);
      }
      if (globalUpRef.current) {
        window.removeEventListener('pointerup', globalUpRef.current);
        window.removeEventListener('touchend', globalUpRef.current);
      }
      if (globalCancelRef.current) {
        window.removeEventListener('pointercancel', globalCancelRef.current);
        window.removeEventListener('touchcancel', globalCancelRef.current);
      }
    };
  }, []);

  const startDrag = (e: React.PointerEvent, pieceId: number) => {
    if (e.pointerType === 'touch') return;
    if (e.button !== 0) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    const pointerId = e.pointerId;
    const currentTarget = e.currentTarget as HTMLElement;

    startCoords.current = { x: clientX, y: clientY };
    lastCoords.current = { x: clientX, y: clientY };
    dragActiveRef.current = false;
    hasMovedRef.current = false;

    try {
      currentTarget.setPointerCapture(pointerId);
    } catch (err) {}

    const onGlobalMove = (event: PointerEvent) => {
      if (!startCoords.current) return;
      
      const dx = event.clientX - startCoords.current.x;
      const dy = event.clientY - startCoords.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!dragActiveRef.current) {
        if (distance > 5) {
          dragActiveRef.current = true;
          setDraggedPiece({
            id: pieceId,
            x: event.clientX,
            y: event.clientY,
            startX: clientX,
            startY: clientY,
            pointerId: pointerId,
          });
        }
      } else {
        setDraggedPiece({
          id: pieceId,
          x: event.clientX,
          y: event.clientY,
          startX: clientX,
          startY: clientY,
          pointerId: pointerId,
        });
        lastCoords.current = { x: event.clientX, y: event.clientY };
        
        const dropElement = document.elementFromPoint(event.clientX, event.clientY);
        const basketTab = dropElement?.closest('[data-basket-id]');
        const targetBasket = basketTab?.getAttribute('data-basket-id') || null;
        setHoveredBasket(targetBasket);
      }
    };

    const onGlobalUp = (event: PointerEvent) => {
      cleanupListeners();

      const wasDragging = dragActiveRef.current;
      dragActiveRef.current = false;
      startCoords.current = null;

      if (wasDragging) {
        const endX = event.clientX || lastCoords.current.x;
        const endY = event.clientY || lastCoords.current.y;

        const dropElement = document.elementFromPoint(endX, endY);
        const basketTab = dropElement?.closest('[data-basket-id]');
        const targetBasket = basketTab?.getAttribute('data-basket-id');
        
        if (targetBasket) {
          movePieceToBasket(pieceId, targetBasket);
        }

        setDraggedPiece(null);
        setHoveredBasket(null);
        ignoreNextClickRef.current = true;
      } else {
        ignoreNextClickRef.current = false;
        if (isDrawerOpen) {
          setTimeout(() => {
            setIsDrawerOpen(false);
          }, 60);
        }
      }
    };

    const onGlobalCancel = () => {
      cleanupListeners();
      dragActiveRef.current = false;
      startCoords.current = null;
      setDraggedPiece(null);
      setHoveredBasket(null);
    };

    const cleanupListeners = () => {
      window.removeEventListener('pointermove', onGlobalMove);
      window.removeEventListener('pointerup', onGlobalUp);
      window.removeEventListener('pointercancel', onGlobalCancel);

      globalMoveRef.current = null;
      globalUpRef.current = null;
      globalCancelRef.current = null;
    };

    window.addEventListener('pointermove', onGlobalMove, { passive: true });
    window.addEventListener('pointerup', onGlobalUp, { passive: true });
    window.addEventListener('pointercancel', onGlobalCancel);

    globalMoveRef.current = onGlobalMove;
    globalUpRef.current = onGlobalUp;
    globalCancelRef.current = onGlobalCancel;
  };

  const handleTouchStart = (e: React.TouchEvent, pieceId: number) => {
    const touch = e.touches[0];
    if (!touch) return;

    const clientX = touch.clientX;
    const clientY = touch.clientY;

    startCoords.current = { x: clientX, y: clientY };
    lastCoords.current = { x: clientX, y: clientY };
    dragActiveRef.current = false;
    hasMovedRef.current = false;

    longPressTimeout.current = setTimeout(() => {
      dragActiveRef.current = true;
      setDraggedPiece({
        id: pieceId,
        x: clientX,
        y: clientY,
        startX: clientX,
        startY: clientY,
        pointerId: 0,
      });

      const onGlobalTouchMove = (event: TouchEvent) => {
        if (event.cancelable) {
          event.preventDefault();
        }
        const t = event.touches[0];
        if (t) {
          setDraggedPiece({
            id: pieceId,
            x: t.clientX,
            y: t.clientY,
            startX: clientX,
            startY: clientY,
            pointerId: 0,
          });
          lastCoords.current = { x: t.clientX, y: t.clientY };

          const dropElement = document.elementFromPoint(t.clientX, t.clientY);
          const basketTab = dropElement?.closest('[data-basket-id]');
          const targetBasket = basketTab?.getAttribute('data-basket-id') || null;
          setHoveredBasket(targetBasket);
        }
      };

      const onGlobalTouchEnd = (event: TouchEvent) => {
        cleanupTouchListeners();

        dragActiveRef.current = false;
        startCoords.current = null;

        const t = event.changedTouches[0];
        const endX = t ? t.clientX : lastCoords.current.x;
        const endY = t ? t.clientY : lastCoords.current.y;

        const dropElement = document.elementFromPoint(endX, endY);
        const basketTab = dropElement?.closest('[data-basket-id]');
        const targetBasket = basketTab?.getAttribute('data-basket-id');
        
        if (targetBasket) {
          movePieceToBasket(pieceId, targetBasket);
        }

        setDraggedPiece(null);
        setHoveredBasket(null);
        ignoreNextClickRef.current = true;
      };

      const onGlobalTouchCancel = () => {
        cleanupTouchListeners();
        dragActiveRef.current = false;
        startCoords.current = null;
        setDraggedPiece(null);
        setHoveredBasket(null);
      };

      const cleanupTouchListeners = () => {
        window.removeEventListener('touchmove', onGlobalTouchMove);
        window.removeEventListener('touchend', onGlobalTouchEnd);
        window.removeEventListener('touchcancel', onGlobalTouchCancel);
        globalMoveRef.current = null;
        globalUpRef.current = null;
        globalCancelRef.current = null;
      };

      window.addEventListener('touchmove', onGlobalTouchMove, { passive: false });
      window.addEventListener('touchend', onGlobalTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onGlobalTouchCancel);

      globalMoveRef.current = onGlobalTouchMove;
      globalUpRef.current = onGlobalTouchEnd;
      globalCancelRef.current = onGlobalTouchCancel;

    }, 200);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragActiveRef.current && startCoords.current) {
      const touch = e.touches[0];
      if (touch) {
        const dx = touch.clientX - startCoords.current.x;
        const dy = touch.clientY - startCoords.current.y;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          hasMovedRef.current = true;
          if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
          }
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, pieceId: number) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    if (!dragActiveRef.current) {
      ignoreNextClickRef.current = false;
      if (!hasMovedRef.current) {
        // Handle touch tap manually via parent click handler
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragActiveRef.current && startCoords.current) {
      const dx = e.clientX - startCoords.current.x;
      const dy = e.clientY - startCoords.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMovedRef.current = true;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent, pieceId: number) => {
    if (!dragActiveRef.current) {
      ignoreNextClickRef.current = false;
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (!dragActiveRef.current) {
      startCoords.current = null;
    }
  };

  return {
    draggedPiece,
    startDrag,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    ignoreNextClickRef,
  };
}
