import React, { useState, FormEvent } from 'react';
import styles from '../page.module.css';

interface TypingAreaProps {
    hint: string;
    onSubmit: (input: string) => void;
    disabled?: boolean;
}

export function TypingArea({ hint, onSubmit, disabled }: TypingAreaProps) {
    const [value, setValue] = useState('');

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
                    type="text"
                    className={styles.wordInput}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                    placeholder="Type the word here..."
                    autoFocus
                    autoComplete="off"
                />
                <button type="submit" className={styles.submitBtn} disabled={disabled}>
                    Enter
                </button>
            </form>
        </div>
    );
}
