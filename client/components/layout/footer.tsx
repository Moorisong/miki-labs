import Link from 'next/link';

import { NAV_LINKS, MESSAGES, ROUTES } from '@/constants';

import styles from './footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <Link href={ROUTES.HOME} className={styles.logo}>
              <img src="/logo.png" alt="Logo" className={styles.logoIcon} />
              <span className={styles.logoText}>{MESSAGES.META.SITE_NAME}</span>
            </Link>
            <p className={styles.description}>
              {MESSAGES.META.OG_DESCRIPTION}
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>메뉴</h4>
              <ul className={styles.linkList}>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
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
            &copy; {currentYear} {MESSAGES.META.SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
