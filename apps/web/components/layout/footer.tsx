'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';
import styles from './footer.module.css';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Toby 서비스에서는 푸터를 보이지 않게 처리
  if (pathname.startsWith('/toby')) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.links}>
          <Link href={ROUTES.TERMS} className={styles.link}>
            이용약관
          </Link>
          <span className={styles.separator}>·</span>
          <Link href={ROUTES.PRIVACY} className={styles.link}>
            개인정보처리방침
          </Link>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} KSH. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
