'use client';

import { useEffect, useCallback, ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const mouseDownTarget = useRef<EventTarget | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    // 오버레이(배경)에서 클릭이 시작되었는지 확인
    if (e.target === e.currentTarget) {
      mouseDownTarget.current = e.target;
    } else {
      mouseDownTarget.current = null;
    }
  };

  const handleOverlayMouseUp = (e: React.MouseEvent) => {
    // 모바일 환경(768px 미만)에서는 오버레이 클릭으로 닫기 방지
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }

    // 마우스를 뗐을 때 타겟이 오버레이이고,
    // 마우스를 눌렀을 때도 오버레이였을 경우에만 닫기 (드래그 실수 방지)
    if (
      closeOnOverlayClick &&
      e.target === e.currentTarget &&
      mouseDownTarget.current === e.currentTarget
    ) {
      onClose();
    }

    // 초기화
    mouseDownTarget.current = null;
  };

  const handleContentClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div
        className={`${styles.modal} ${styles[size]}`}
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="닫기"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(modalContent, document.body);
}
