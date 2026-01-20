'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './nav-bar.module.css';

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/game', label: '게임' },
  { href: '/ranking', label: '랭킹' },
  { href: '/about', label: '소개' },
];

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoIcon}>🎮</span>
          <span className={styles.logoText}>뽑기중독</span>
        </Link>

        <button
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
        >
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.active : ''}`} />
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.active : ''}`} />
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.active : ''}`} />
        </button>

        <ul className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
