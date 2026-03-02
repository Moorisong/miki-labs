import Link from 'next/link';
import { ROUTES } from '@/constants';
import styles from './footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
