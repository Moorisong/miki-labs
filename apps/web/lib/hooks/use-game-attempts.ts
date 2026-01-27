import { useState, useEffect, useCallback } from 'react';

import { STORAGE_KEY, CONFIG } from '@/constants';

const DEFAULT_ATTEMPTS = CONFIG.GAME.MAX_ATTEMPTS;
const COOLDOWN_DURATION = CONFIG.TIMEOUT.COOLDOWN_HOURS * 60 * 60 * 1000; // 밀리초 변환

interface AttemptData {
    remainingAttempts: number;
    cooldownEndAt: number | null;
}

interface UseGameAttemptsReturn {
    remainingAttempts: number;
    isOnCooldown: boolean;
    cooldownEndAt: number | null;
    cooldownRemaining: string; // 포맷된 남은 시간 (HH:MM:SS)
    canPlay: boolean;
    useAttempt: () => boolean; // 시도 사용 (실패 시)
    addAttempt: () => void; // 시도 추가 (성공 시)
    resetCooldown: () => void; // 쿨타임 리셋 (디버그용)
}

function getStoredData(): AttemptData {
    if (typeof window === 'undefined') {
        return { remainingAttempts: DEFAULT_ATTEMPTS, cooldownEndAt: null };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY.GAME_ATTEMPTS);
        if (stored) {
            const data = JSON.parse(stored) as AttemptData;
            return data;
        }
    } catch (e) {
        console.error('Failed to read attempt data:', e);
    }

    return { remainingAttempts: DEFAULT_ATTEMPTS, cooldownEndAt: null };
}

function saveData(data: AttemptData) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY.GAME_ATTEMPTS, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save attempt data:', e);
    }
}

function formatTimeRemaining(ms: number): string {
    if (ms <= 0) return '00:00:00';

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function useGameAttempts(): UseGameAttemptsReturn {
    const [remainingAttempts, setRemainingAttempts] = useState<number>(DEFAULT_ATTEMPTS);
    const [cooldownEndAt, setCooldownEndAt] = useState<number | null>(null);
    const [cooldownRemaining, setCooldownRemaining] = useState('00:00:00');
    const [isOnCooldown, setIsOnCooldown] = useState(false);

    // 초기 데이터 로드
    useEffect(() => {
        const data = getStoredData();
        const now = Date.now();

        // 쿨타임 체크
        if (data.cooldownEndAt && data.cooldownEndAt > now) {
            // 아직 쿨타임 중
            setIsOnCooldown(true);
            setCooldownEndAt(data.cooldownEndAt);
            setRemainingAttempts(0);
        } else if (data.cooldownEndAt && data.cooldownEndAt <= now) {
            // 쿨타임 종료됨 - 충전
            setRemainingAttempts(DEFAULT_ATTEMPTS);
            setCooldownEndAt(null);
            setIsOnCooldown(false);
            saveData({ remainingAttempts: DEFAULT_ATTEMPTS, cooldownEndAt: null });
        } else {
            // 쿨타임 없음
            setRemainingAttempts(data.remainingAttempts);
            setCooldownEndAt(null);
            setIsOnCooldown(false);
        }
    }, []);

    // 쿨타임 타이머
    useEffect(() => {
        if (!cooldownEndAt) {
            setCooldownRemaining('00:00:00');
            setIsOnCooldown(false);
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const remaining = cooldownEndAt - now;

            if (remaining <= 0) {
                // 쿨타임 종료 - 충전
                setIsOnCooldown(false);
                setCooldownEndAt(null);
                setRemainingAttempts(DEFAULT_ATTEMPTS);
                setCooldownRemaining('00:00:00');
                saveData({ remainingAttempts: DEFAULT_ATTEMPTS, cooldownEndAt: null });
            } else {
                setCooldownRemaining(formatTimeRemaining(remaining));
                setIsOnCooldown(true);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [cooldownEndAt]);

    // 시도 사용 (실패 시 호출)
    const useAttempt = useCallback((): boolean => {
        if (isOnCooldown || remainingAttempts <= 0) {
            return false;
        }

        // 함수형 업데이트로 stale closure 문제 방지
        setRemainingAttempts((prev) => {
            const newAttempts = prev - 1;

            if (newAttempts === 0) {
                // 쿨타임 시작
                const endAt = Date.now() + COOLDOWN_DURATION;
                setCooldownEndAt(endAt);
                setIsOnCooldown(true);
                saveData({ remainingAttempts: 0, cooldownEndAt: endAt });
            } else {
                saveData({ remainingAttempts: newAttempts, cooldownEndAt: null });
            }

            return newAttempts;
        });

        return true;
    }, [remainingAttempts, isOnCooldown]);

    // 시도 추가 (성공 시 호출)
    const addAttempt = useCallback(() => {
        if (isOnCooldown) return;

        // 함수형 업데이트로 stale closure 문제 방지
        setRemainingAttempts((prev) => {
            const newAttempts = prev + 1;
            saveData({ remainingAttempts: newAttempts, cooldownEndAt: null });
            return newAttempts;
        });
    }, [isOnCooldown]);

    // 쿨타임 리셋 (디버그/테스트용)
    const resetCooldown = useCallback(() => {
        setRemainingAttempts(DEFAULT_ATTEMPTS);
        setCooldownEndAt(null);
        setIsOnCooldown(false);
        setCooldownRemaining('00:00:00');
        saveData({ remainingAttempts: DEFAULT_ATTEMPTS, cooldownEndAt: null });
    }, []);

    return {
        remainingAttempts,
        isOnCooldown,
        cooldownEndAt,
        cooldownRemaining,
        canPlay: !isOnCooldown && remainingAttempts > 0,
        useAttempt,
        addAttempt,
        resetCooldown,
    };
}

export default useGameAttempts;

