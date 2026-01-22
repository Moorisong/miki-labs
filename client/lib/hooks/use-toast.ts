'use client';

import { useState, useCallback, useRef } from 'react';
import { TOAST_DURATION } from '@/constants/toast-messages';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastState {
    message: string;
    type: ToastType;
    isVisible: boolean;
}

interface UseToastReturn {
    toast: ToastState;
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: () => void;
}

export function useToast(): UseToastReturn {
    const [toast, setToast] = useState<ToastState>({
        message: '',
        type: 'error',
        isVisible: false,
    });

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, isVisible: false }));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'error', duration: number = TOAST_DURATION.NORMAL) => {
            // 이미 토스트가 떠있으면 무시 (연속 토스트 방지)
            if (toast.isVisible) return;

            // 이전 타이머 클리어
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setToast({
                message,
                type,
                isVisible: true,
            });

            // 자동 숨김
            timeoutRef.current = setTimeout(() => {
                hideToast();
            }, duration);
        },
        [hideToast, toast.isVisible]
    );

    return { toast, showToast, hideToast };
}
