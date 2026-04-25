import React, { useState, FormEvent, useEffect, useRef } from 'react';
import styles from '../page.module.css';

interface TypingAreaProps {
    hint: string;
    onSubmit: (input: string) => void;
    disabled?: boolean;
}

export function TypingArea({ hint, onSubmit, disabled }: TypingAreaProps) {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // 타이핑 영역이 나타날 때 입력을 포커스하되, 스크롤이 튀는 것을 방지
        inputRef.current?.focus({ preventScroll: true });
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!value.trim() || disabled) return;

        onSubmit(value.trim());
        setValue(''); // 입력 후 초기화
    };

    return (
        <div className={styles.typingArea}>
            <div className={styles.hintBox}>
                {hint}
            </div>
            <form onSubmit={handleSubmit} className={styles.inputForm}>
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.wordInput}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                    placeholder="정답을 입력하세요..."
                    autoComplete="off"
                />
                <button type="submit" className={styles.submitBtn} disabled={disabled}>
                    입력
                </button>
            </form>
        </div>
    );
}
