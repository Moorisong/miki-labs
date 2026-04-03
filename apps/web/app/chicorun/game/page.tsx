'use client';

import { useRouter } from 'next/navigation';
import { CHICORUN_ROUTES } from '@/constants/chicorun';
import styles from './page.module.css';

const IconCloudRain = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
        <path d="M16 14v6"></path>
        <path d="M8 14v6"></path>
        <path d="M12 16v6"></path>
    </svg>
);

export default function ChicorunGameHubPage() {
    const router = useRouter();

    const games = [
        {
            id: 'word-rain',
            name: 'Word Rain',
            description: '하늘에서 떨어지는 단어를 맞혀보세요! 단어 실력을 키우는 가장 재미있는 방법입니다.',
            route: CHICORUN_ROUTES.GAME_WORD_RAIN,
            icon: <IconCloudRain />,
            color: '#3b82f6'
        },
        // 나중에 다른 게임 추가 가능
    ];

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Chicorun Game Center</h1>
                    <p className={styles.subtitle}>재미있게 게임하며 영어를 배워보세요!</p>
                </header>

                <div className={styles.gameGrid}>
                    {games.map((game) => (
                        <div key={game.id} className={styles.gameCard}>
                            <div className={styles.gameIcon} style={{ background: `linear-gradient(135deg, ${game.color} 0%, #1e40af 100%)` }}>
                                {game.icon}
                            </div>
                            <h2 className={styles.gameName}>{game.name}</h2>
                            <p className={styles.gameDescription}>{game.description}</p>
                            <button
                                className={styles.btnPlay}
                                onClick={() => router.push(game.route)}
                            >
                                게임 시작하기
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
