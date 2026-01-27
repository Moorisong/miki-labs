import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default function Home() {
    const contents = [
        {
            id: 'claw-machine',
            title: '하루상자',
            description: '리얼한 물리 엔진으로 즐기는 웹 인형뽑기 게임.\n실제 인형뽑기의 손맛을 느껴보세요!',
            image: '/hero_character.png',
            link: ROUTES.CLAW_HOME || '/claw', // Safe fallback if constant isn't updated yet
            badge: 'Hot',
            active: true,
        },
        {
            id: 'mini-game',
            title: '미니게임',
            description: '간단하게 즐기는 다양한 미니게임들이 준비 중입니다.',
            image: '/logo.png', // Placeholder
            link: '#',
            badge: 'Coming Soon',
            active: false,
        },
        {
            id: 'letter',
            title: '마음 편지',
            description: '소중한 사람에게 전하는 따뜻한 메시지와 스티커.',
            image: '/logo.png', // Placeholder
            link: '#',
            badge: null,
            active: false,
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
                                {content.badge && <span className={styles.badge} style={{ background: '#CBD5E0' }}>{content.badge}</span>}
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

            <footer style={{ marginTop: 'auto', paddingTop: '4rem', color: '#718096', fontSize: '0.875rem', textAlign: 'center' }}>
                <p>하루상자는 하루의 소소한 재미를 담아두는 작은 놀이 상자입니다.</p>
            </footer>
        </div>
    );
}
