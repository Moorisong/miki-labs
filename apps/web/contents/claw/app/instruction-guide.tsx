'use client';

import { useState, useEffect } from 'react';
import styles from './instruction-guide.module.css';

const STORAGE_KEY = 'haroo_claw_instruction_collapsed';

export default function InstructionGuide() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            setIsCollapsed(JSON.parse(savedState));
        }
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    };

    return (
        <section className={styles.container}>
            <div className={styles.header} onClick={toggleCollapse}>
                <h3 className={styles.title}>🕹️ 조작 방법</h3>
                <button className={styles.toggleButton}>
                    {isCollapsed ? '펼치기 ▼' : '접기 ▲'}
                </button>
            </div>

            {!isCollapsed && (
                <div className={styles.content}>
                    <div className={styles.keyItem}>
                        <span className={styles.keyLabel}>이동</span>
                        <div className={styles.keys}>
                            <span className={styles.key}>W</span>
                            <span className={styles.key}>A</span>
                            <span className={styles.key}>S</span>
                            <span className={styles.key}>D</span>
                            <span className={styles.separator}>/</span>
                            <span className={styles.key}>방향키</span>
                        </div>
                    </div>
                    <div className={styles.keyItem}>
                        <span className={styles.keyLabel}>잡기</span>
                        <div className={styles.keys}>
                            <span className={styles.key}>Space</span>
                            <span className={styles.separator}>/</span>
                            <span className={styles.key}>Enter</span>
                        </div>
                    </div>
                    <div className={styles.keyItem}>
                        <span className={styles.keyLabel}>카메라</span>
                        <div className={styles.keys}>
                            <span className={styles.key}>PC: 마우스 드래그</span>
                            <span className={styles.separator}>/</span>
                            <span className={styles.key}>Mobile: 터치 드래그</span>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
