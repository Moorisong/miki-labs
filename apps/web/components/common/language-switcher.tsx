'use client';

import React from 'react';
import { useLanguage } from '../../context/language-context';
import styles from './language-switcher.module.css';

interface LanguageSwitcherProps {
    inline?: boolean;
}

export default function LanguageSwitcher({ inline }: LanguageSwitcherProps = {}) {
    const { language, setLanguage } = useLanguage();

    return (
        <div className={inline ? styles.inlineContainer : styles.container}>
            <button
                onClick={() => setLanguage('en')}
                className={`${styles.button} ${language === 'en' ? styles.active : ''}`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('ko')}
                className={`${styles.button} ${language === 'ko' ? styles.active : ''}`}
            >
                한국어
            </button>
        </div>
    );
}
