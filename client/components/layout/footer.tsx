import styles from './footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} 뽑기중독. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
