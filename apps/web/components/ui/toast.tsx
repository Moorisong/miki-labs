'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ToastState } from '@/lib/hooks/use-toast';
import styles from './toast.module.css';

interface ToastProps {
    toast: ToastState;
    onHide?: () => void;
}

export default function Toast({ toast, onHide }: ToastProps) {
    const [isHiding, setIsHiding] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!toast.isVisible && isHiding) {
            // isVisible이 false로 바뀌면 hiding 상태 시작
            const timer = setTimeout(() => {
                setIsHiding(false);
            }, 250); // 애니메이션 시간
            return () => clearTimeout(timer);
        }

        if (toast.isVisible) {
            setIsHiding(false);
        }
    }, [toast.isVisible, isHiding]);

    // 클릭으로 닫기
    const handleClick = () => {
        setIsHiding(true);
        setTimeout(() => {
            onHide?.();
        }, 250);
    };

    if (!mounted) return null;

    // 보이거나 숨겨지는 중일 때만 렌더링
    const shouldRender = toast.isVisible || isHiding;
    if (!shouldRender) return null;

    const toastElement = (
        <div className={styles.toastContainer}>
            <div
                className={`${styles.toast} ${styles[toast.type]} ${!toast.isVisible ? styles.hiding : ''}`}
                onClick={handleClick}
                role="alert"
                aria-live="polite"
            >
                {/* 아이콘(❌, ✅ 등) 삭제하고 메시지만 표시 */}
                <span className={styles.message}>{toast.message}</span>
            </div>
        </div>
    );

    return createPortal(toastElement, document.body);
}
