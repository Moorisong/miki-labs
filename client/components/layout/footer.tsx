import Link from 'next/link';
import styles from './footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}>🎮</span>
              <span className={styles.logoText}>뽑기중독</span>
            </Link>
            <p className={styles.description}>
              리얼한 물리 엔진으로 즐기는 웹 인형뽑기 게임
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>메뉴</h4>
              <ul className={styles.linkList}>
                <li><Link href="/">홈</Link></li>
                <li><Link href="/game">게임</Link></li>
                <li><Link href="/ranking">랭킹</Link></li>
                <li><Link href="/about">소개</Link></li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>링크</h4>
              <ul className={styles.linkList}>
                <li>
                  <a
                    href="https://github.com/Moorisong/claw-addict"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} 뽑기중독. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
