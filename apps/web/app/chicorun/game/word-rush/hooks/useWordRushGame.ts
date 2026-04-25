import { useState, useEffect, useRef, useCallback } from 'react';

export type GameState = 'READY' | 'PLAYING' | 'RESULT';

export interface Problem {
    wid: number;
    mid: number;
    hintId: string;
    hint: string;
    answers: string[]; // 정규화된 정답 목록 (이미 소문자 + 공백제거)
}

interface UseWordRushGameProps {
    problems: Problem[];
    onGameEnd: (stats: { correctCount: number; maxCombo: number; clearTimeSeconds: number; usedProblems: { wid: number; mid: number; hintId: string }[] }) => void;
    timeLimit?: number;
}

export function useWordRushGame({ problems, onGameEnd, timeLimit = 60 }: UseWordRushGameProps) {
    const [gameState, setGameState] = useState<GameState>('READY');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = useCallback(() => {
        setGameState('PLAYING');
        setCurrentIndex(0);
        setTimeLeft(timeLimit);
        setCombo(0);
        setMaxCombo(0);
        setCorrectCount(0);
    }, [timeLimit]);

    const endGame = useCallback(() => {
        setGameState('RESULT');
        if (timerRef.current) clearInterval(timerRef.current);

        // 계산된 통계를 상위(또는 API)로 전달
        onGameEnd({
            correctCount,
            maxCombo,
            clearTimeSeconds: timeLimit - timeLeft,
            usedProblems: problems.map(p => ({ wid: p.wid, mid: p.mid, hintId: p.hintId }))
        });
    }, [correctCount, maxCombo, timeLimit, timeLeft, problems, onGameEnd]);

    useEffect(() => {
        if (gameState === 'PLAYING') {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setTimeout(endGame, 0); // 상태 업데이트 후 종료
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState, endGame]);

    // 입력값 검증 로직
    const submitAnswer = useCallback((input: string) => {
        if (gameState !== 'PLAYING') return false;

        const currentProblem = problems[currentIndex];
        if (!currentProblem) return false;

        // 정규화 비교 (대소문자 무시, 공백 무시)
        const normalizedInput = input.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isCorrect = currentProblem.answers.includes(normalizedInput);

        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
            setCombo(prev => {
                const newCombo = prev + 1;
                setMaxCombo(m => Math.max(m, newCombo));
                return newCombo;
            });
        } else {
            setCombo(0);
        }

        // 다음 문제로
        if (currentIndex + 1 >= problems.length) {
            endGame();
        } else {
            setCurrentIndex(prev => prev + 1);
        }

        return isCorrect;
    }, [gameState, problems, currentIndex, endGame]);

    return {
        gameState,
        timeLeft,
        currentProblem: problems[currentIndex] || null,
        combo,
        correctCount,
        startGame,
        submitAnswer
    };
}
