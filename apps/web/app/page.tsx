import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ROUTES } from '@/constants';
import AdBanner from '@/components/ads/ad-banner';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
    description: '하루상자는 인형뽑기를 비롯해 다양한 미니콘텐츠를 즐길 수 있는 웹 플랫폼입니다. 매일 새로운 즐거움을 하루상자에서 만나보세요.',
    keywords: [
        '하루상자', 'Haroo Box', 'Haroo App',
        '미니게임', '웹게임', '킬링타임', '심심풀이', '플랫폼',
        '캐주얼 게임', '무료 게임', 'HTML5 게임'
    ],
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
        description: '하루상자는 인형뽑기를 비롯해 다양한 미니콘텐츠를 즐길 수 있는 웹 플랫폼입니다.',
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
        description: '하루상자는 인형뽑기를 비롯해 다양한 미니콘텐츠를 즐길 수 있는 웹 플랫폼입니다.',
        images: ['/og-image.png'],
    },
};

export default function Home() {
    const contents = [
        {
            id: 'claw-machine',
            title: '인형뽑기',
            description: '리얼한 물리 엔진으로 즐기는 웹 인형뽑기 게임.\n실제 인형뽑기의 손맛을 느껴보세요!',
            image: '/hero_character.png',
            link: ROUTES.CLAW_HOME || '/claw', // Safe fallback if constant isn't updated yet
            badge: 'Hot',
            active: true,
        },
        {
            id: 'rolling-paper',
            title: '롤링페이퍼',
            description: '친구들과 추억을 나누는 롤링페이퍼',
            image: '/sample/r-paper-logo.png',
            link: 'https://r-paper-web.haroo.site',
            badge: 'New',
            active: true,
        },
        {
            id: 'pet-destiny',
            title: '운명연구소',
            description: '반려동물과 집사의 오행 궁합 분석.\n우리 아이와의 특별한 인연을 확인해보세요!',
            image: '/pet-destiny-logo-transparent-v2.png',
            link: '/pet-destiny',
            badge: 'New',
            active: true,
        },
        {
            id: 'htsm',
            title: 'HTSM',
            description: '친구들의 익명 평가로 발견하는 나.\nJohari Window 기반 심리 분석!',
            image: '/htsm-logo-v6.png',
            link: '/htsm',
            badge: 'New',
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
                        <Link href={content.link} key={content.id} className={styles.card}>
                            <div className={styles.cardImageWrapper}>
                                {content.badge && <span className={styles.badge}>{content.badge}</span>}
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
