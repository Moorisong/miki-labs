'use client';

import { useState } from 'react';
import { FEATURES } from '@/constants';
import styles from './game-features.module.css';

export default function GameFeatures() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>게임 소개 및 특징</h2>
                <button
                    className={styles.toggleButton}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? '설명 접기 ▲' : '게임 설명 보기 ▼'}
                </button>
            </header>

            {isExpanded && (
                <div className={styles.content}>
                    <div className={styles.description}>
                        <p>
                            뽑기중독은 <strong>실제 인형뽑기 기계의 조작감</strong>을 웹에서 완벽하게 구현한 3D 게임입니다.
                            단순한 확률 게임이 아닌, <strong>물리엔진 기반의 리얼한 집게 조작</strong>을 경험해보세요.
                        </p>
                        <p className={styles.subText}>
                            위치 선정과 버튼을 놓는 타이밍에 따라 결과가 달라집니다.
                            나만의 노하우로 랭킹 1위에 도전해보세요!
                        </p>
                    </div>

                    <div className={styles.featureGrid}>
                        {FEATURES.map((feature, index) => (
                            <div key={index} className={styles.featureCard}>
                                <div className={styles.featureIcon}>{feature.icon}</div>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDescription}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
