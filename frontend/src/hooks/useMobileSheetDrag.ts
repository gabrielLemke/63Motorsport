import { useEffect } from 'react';

interface UseMobileSheetDragOptions {
  isOpen?: boolean;
  onClose: () => void;
  threshold?: number;
}

/**
 * Hook seguro para modais mobile e desktop:
 * - Não intercepta eventos de toque (onTouchStart/onTouchMove) nem aplica transform CSS,
 *   garantindo que o scroll nativo do navegador e o clique em botões/inputs/selects funcionem 100% no iOS e Android.
 * - Garante que o body nunca fique travado com overflow: hidden.
 * - Fecha o modal ao pressionar ESC.
 */
export function useMobileSheetDrag({
  isOpen = true,
  onClose
}: UseMobileSheetDragOptions) {
  useEffect(() => {
    // Garante que qualquer trava anterior de overflow no body seja limpa
    document.body.style.overflow = '';
    document.body.style.touchAction = '';

    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return {
    dragOffsetY: 0,
    isDragging: false,
    sheetStyle: undefined,
    dragHandleProps: {}
  };
}
