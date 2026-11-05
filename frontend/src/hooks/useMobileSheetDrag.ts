import { useState, useRef, useEffect, type TouchEvent } from 'react';

interface UseMobileSheetDragOptions {
  isOpen?: boolean;
  onClose: () => void;
  threshold?: number;
}

/**
 * Hook para pop-ups e modais mobile:
 * 1. Trava o scroll do body enquanto o pop-up está aberto (evita arrastar o fundo junto).
 * 2. Permite arrastar o pop-up para baixo pelo cabeçalho/handle (swipe-down to close) com feedback visual em tempo real.
 * 3. Permite fechar com a tecla ESC.
 */
export function useMobileSheetDrag({
  isOpen = true,
  onClose,
  threshold = 85
}: UseMobileSheetDragOptions) {
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setDragOffsetY(0);
      setIsDragging(false);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = 0;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLElement>) => {
    if (startYRef.current === null) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    // Só arrasta para baixo (deltaY > 0)
    if (deltaY > 0) {
      currentYRef.current = deltaY;
      setDragOffsetY(deltaY);
    } else {
      currentYRef.current = 0;
      setDragOffsetY(0);
    }
  };

  const handleTouchEnd = () => {
    if (startYRef.current === null) return;
    const finalDelta = currentYRef.current;
    startYRef.current = null;
    currentYRef.current = 0;
    setIsDragging(false);

    if (finalDelta >= threshold) {
      setDragOffsetY(0);
      onClose();
    } else {
      setDragOffsetY(0);
    }
  };

  const sheetStyle = {
    transform: dragOffsetY > 0 ? `translateY(${dragOffsetY}px)` : undefined,
    transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  const dragHandleProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd
  };

  return {
    dragOffsetY,
    isDragging,
    sheetStyle,
    dragHandleProps
  };
}
