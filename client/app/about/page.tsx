import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: '소개 | 뽑기중독',
  description: '뽑기중독 게임 소개 및 플레이 방법을 확인하세요. 리얼한 물리 엔진 기반 웹 인형뽑기 게임입니다.',
  openGraph: {
    title: '소개 | 뽑기중독',
    description: '뽑기중독 게임 소개 및 플레이 방법',
  },
};

const howToPlay = [
  {
    step: 1,
    title: '위치 선정',
    description: '방향키 또는 화면 버튼으로 크레인을 원하는 위치로 이동시킵니다.',
    icon: '🕹️',
  },
  {
    step: 2,
    title: '크레인 하강',
    description: '하강 버튼을 누르면 크레인이 아래로 내려가 인형을 잡습니다.',
    icon: '⬇️',
  },
  {
    step: 3,
    title: '인형 획득',
    description: '인형을 성공적으로 잡아 출구까지 옮기면 점수를 획득합니다!',
    icon: '🎉',
  },
];

const techStack = [
  { name: 'Next.js', description: 'React 프레임워크', icon: '⚛️' },
  { name: 'Three.js', description: '3D 그래픽 렌더링', icon: '🎨' },
  { name: 'Rapier', description: '물리 엔진', icon: '⚙️' },
  { name: 'TypeScript', description: '타입 안전성', icon: '📘' },
  { name: 'Express', description: '백엔드 서버', icon: '🖥️' },
  { name: 'WebSocket', description: '실시간 통신', icon: '🔌' },
];

export default function AboutPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>뽑기중독</h1>
        <p className={styles.subtitle}>
          리얼한 물리 엔진으로 즐기는 웹 인형뽑기 게임
        </p>
      </section>

      {/* About Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>게임 소개</h2>
        <div className={styles.aboutContent}>
          <p>
            <strong>뽑기중독</strong>은 실제 인형뽑기 기계의 경험을 웹에서 그대로 재현한 게임입니다.
            물리 엔진을 기반으로 한 리얼한 크레인 동작과 인형의 움직임을 경험해보세요.
          </p>
          <p>
            데스크톱과 모바일 모두에서 쾌적하게 플레이할 수 있으며,
            전국의 플레이어들과 점수를 겨루는 랭킹 시스템도 제공합니다.
          </p>
          <p>
            동전 없이, 언제 어디서나 무료로 즐기는 인형뽑기!
            지금 바로 도전해보세요.
          </p>
        </div>
      </section>

      {/* How to Play Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>플레이 방법</h2>
        <div className={styles.howToPlay}>
          {howToPlay.map((item) => (
            <div key={item.step} className={styles.stepCard}>
              <div className={styles.stepIcon}>{item.icon}</div>
              <div className={styles.stepNumber}>STEP {item.step}</div>
              <h3 className={styles.stepTitle}>{item.title}</h3>
              <p className={styles.stepDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Controls Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>조작법</h2>
        <div className={styles.controlsGrid}>
          <div className={styles.controlsCard}>
            <h3 className={styles.controlsTitle}>데스크톱</h3>
            <ul className={styles.controlsList}>
              <li>
                <span className={styles.key}>W</span>
                <span className={styles.key}>A</span>
                <span className={styles.key}>S</span>
                <span className={styles.key}>D</span>
                <span>또는 방향키로 이동</span>
              </li>
              <li>
                <span className={styles.key}>Space</span>
                <span>크레인 하강</span>
              </li>
            </ul>
          </div>
          <div className={styles.controlsCard}>
            <h3 className={styles.controlsTitle}>모바일</h3>
            <ul className={styles.controlsList}>
              <li>화면 방향 버튼으로 이동</li>
              <li>하강 버튼으로 크레인 작동</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>기술 스택</h2>
        <div className={styles.techGrid}>
          {techStack.map((tech) => (
            <div key={tech.name} className={styles.techCard}>
              <span className={styles.techIcon}>{tech.icon}</span>
              <h3 className={styles.techName}>{tech.name}</h3>
              <p className={styles.techDescription}>{tech.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>지금 바로 플레이하세요!</h2>
        <Link href="/game" className={styles.ctaButton}>
          게임 시작
        </Link>
      </section>
    </div>
  );
}
