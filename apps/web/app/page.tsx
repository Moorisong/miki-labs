import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ROUTES } from '@/constants';
import AdBanner from '@/components/ads/ad-banner';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
    description: '하루상자는 심리 분석 등 다양한 미니콘텐츠와 함께, 학교 선생님을 위한 교사 전용 서비스 툴(TOBY)을 제공하는 웹 플랫폼입니다. 수업과 학급 관리에 유용한 도구들과 매일 새로운 즐거움을 만나보세요.',
    keywords: [
        '하루상자', 'Haroo Box', 'Haroo App',
        '미니게임', '웹게임', '킬링타임', '심심풀이', '플랫폼',
        '캐주얼 게임', '무료 게임', 'HTML5 게임',
        'TOBY', '토비', '교사 도구', '교사 전용 툴', '선생님 도구',
        '수업 도구', '학급 관리', '교육 도구', '학교 서비스',
        '교사 서비스 툴', '수업 관리 도구', 'teacher tool'
    ],
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
        description: '하루상자는 미니콘텐츠와 교사 전용 서비스 툴(TOBY)을 제공하는 웹 플랫폼입니다. 수업·학급 관리 도구와 다양한 즐거움을 만나보세요.',
        url: 'https://box.haroo.site',
        type: 'website',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: '하루상자 메인 이미지',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
        description: '하루상자는 미니콘텐츠와 교사 전용 서비스 툴(TOBY)을 제공하는 웹 플랫폼입니다. 수업·학급 관리 도구와 다양한 즐거움을 만나보세요.',
        images: ['/og-image.png'],
    },
};

export default function Home() {
    const contents = [
        {
            id: 'toby',
            title: 'TOBY',
            description: '학교 선생님들을 위한 서비스 툴 모음.\n수업과 학급 관리에 유용한 도구들을 만나보세요!',
            image: '/sample/toby-logo.png',
            link: '/toby',
            newTab: true,
            badge: 'New',
            active: true,
        },
        {
            id: 'htsm',
            title: '자아탐험',
            description: '친구들의 익명 평가로 발견하는 나.\nJohari Window 기반 심리 분석!',
            image: '/htsm-logo-v6.png',
            link: '/htsm',
            badge: 'Hot',
            active: true,
        },
        {
            id: 'rolling-paper',
            title: '롤링페이퍼',
            description: '친구들과 추억을 나누는 롤링페이퍼',
            image: '/sample/r-paper-logo.png',
            link: 'https://r-paper-web.haroo.site',
            active: true,
        },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>하루상자</h1>
                <p className={styles.subtitle}>오늘의 작은 재미를 담다</p>
            </header>

            <div className={styles.grid}>
                {contents.map((content) => (
                    content.active ? (
                        <Link
                            href={content.link}
                            key={content.id}
                            className={styles.card}
                            {...((content as any).newTab || content.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                            <div className={styles.cardImageWrapper}>
                                {(content.badge || ('extraBadge' in content && content.extraBadge)) && (
                                    <div className={styles.badgeGroup}>
                                        {content.badge && <span className={styles.badge}>{content.badge}</span>}
                                        {'extraBadge' in content && content.extraBadge && <span className={`${styles.badge} ${styles.badgeWebOnly}`}>{content.extraBadge}</span>}
                                    </div>
                                )}
                                <Image
                                    src={content.image}
                                    alt={content.title}
                                    width={150}
                                    height={150}
                                    className={styles.cardImage}
                                    priority
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <h2 className={styles.cardTitle}>{content.title}</h2>
                                <p className={styles.cardDescription}>{content.description}</p>
                            </div>
                        </Link>
                    ) : (
                        <div key={content.id} className={`${styles.card} ${styles.disabled}`}>
                            <div className={styles.comingSoonOverlay}>Coming Soon</div>
                            <div className={styles.cardImageWrapper}>
                                {content.badge && <span className={styles.badge} style={{ background: '#94a3b8' }}>{content.badge}</span>}
                                <Image
                                    src={content.image}
                                    alt={content.title}
                                    width={150}
                                    height={150}
                                    className={styles.cardImage}
                                    style={{ filter: 'grayscale(100%)', opacity: 0.5 }}
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <h2 className={styles.cardTitle}>{content.title}</h2>
                                <p className={styles.cardDescription}>{content.description}</p>
                            </div>
                        </div>
                    )
                ))}
            </div>

            <AdBanner className={styles.adBanner} />

            <footer style={{ marginTop: 'auto', paddingTop: '2rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                <p>하루상자는 하루의 소소한 재미를 담아두는 작은 놀이 상자입니다.</p>
            </footer>
        </div>
    );
}
