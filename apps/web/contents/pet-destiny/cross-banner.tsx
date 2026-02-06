'use client';

import Image from 'next/image';
import styles from './cross-banner.module.css';

const MYOROK_LANDING_URL = 'https://myorok.vercel.app';

export default function CrossPromotionBanner() {
    const handleClick = () => {
        window.open(MYOROK_LANDING_URL, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={styles.bannerContainer} onClick={handleClick}>
            <div className={styles.bannerContent}>
                {/* 앱 아이콘 */}
                <div className={styles.iconSection}>
                    <Image
                        src="/myorok-icon-v2.png"
                        alt="묘록 앱 아이콘"
                        width={56}
                        height={56}
                        className={styles.appIcon}
                    />
                </div>

                {/* 텍스트 영역 */}
                <div className={styles.textSection}>
                    <span className={styles.label}>고양이 집사를 위한 추천 앱</span>
                    <h4 className={styles.title}>고양이 건강 기록 앱, 묘록</h4>
                    <p className={styles.description}>
                        배변 기록 · 투약 현황 · 건강 상태 메모를 한 곳에서 관리하세요
                    </p>
                </div>

                {/* CTA 버튼 */}
                <div className={styles.ctaSection}>
                    <span className={styles.ctaButton}>
                        앱 보러가기 →
                    </span>
                </div>
            </div>
        </div>
    );
}
