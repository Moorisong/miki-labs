'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

import { NAV_LINKS, API, MESSAGES, CONFIG } from '@/constants';


import styles from './nav-bar.module.css';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [hasChicoToken, setHasChicoToken] = useState(false);
  const [studentNickname, setStudentNickname] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const studentToken = localStorage.getItem('chicorun_student_token');
      const teacherToken = localStorage.getItem('chicorun_teacher_token');
      const studentInfo = localStorage.getItem('chicorun_student_info');

      setHasChicoToken(!!(studentToken || teacherToken));

      if (studentToken && studentInfo) {
        try {
          const info = JSON.parse(studentInfo);
          setStudentNickname(info.nickname || null);
        } catch {
          setStudentNickname(null);
        }
      } else {
        setStudentNickname(null);
      }
    }
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isContentsActive = NAV_LINKS.some(link => pathname === link.href);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isChicorun = pathname.startsWith('/chicorun');

  const handleSignOut = () => {
    closeMenu();
    // Chicorun 관련 모든 로컬 스토리지 데이터 삭제
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('chicorun_')) {
        localStorage.removeItem(key);
      }
    });

    // 자아탐험 관련 페이지에서 로그아웃 시 자아탐험 랜딩 페이지로 이동
    const redirectUrl = pathname.startsWith('/htsm') ? '/htsm' : isChicorun ? '/chicorun' : pathname;

    if (session) {
      signOut({ callbackUrl: redirectUrl });
    } else {
      // 학생 등 세션이 없는 경우 수동 리다이렉트
      window.location.href = redirectUrl;
    }
  };

  // ─── 선생님 성함 확인 (NextAuth 세션 기반) ───────────────────────────────────
  const teacherName = (session?.user as any)?.nickname || session?.user?.name;

  // Chicorun 바로가기 링크 (로그인 상태에 따라 학생/선생님 버튼 필터링)
  const CHICORUN_LINKS = [
    { href: '/chicorun', label: '학습홈' },
    { href: '/chicorun/ranking', label: '랭킹' },
    { href: '/chicorun/customize', label: '꾸미기' },
    // 선생님이 로그인한 경우 학생 입장 버튼 숨김
    ...(!teacherName ? [{
      href: '/chicorun/join',
      label: studentNickname ? `학생(${studentNickname})` : '학생'
    }] : []),
    // 학생이 로그인한 경우 선생님 대시보드 버튼 숨김
    ...(!studentNickname ? [{
      href: '/chicorun/teacher/dashboard',
      label: teacherName ? `선생님(${teacherName})` : '선생님'
    }] : []),
  ];

  // Toby 서비스에서는 헤더를 보이지 않게 처리
  if (pathname.startsWith('/toby')) {
    return null;
  }

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo} onClick={closeMenu}>
            <img src="/logo.png" alt="Logo" className={styles.logoIcon} />
            <span className={styles.logoText}>하루상자</span>
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
            {/* PC: Dropdown Menu */}
            <li
              className={`${styles.dropdownContainer} ${styles.desktopOnly}`}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                className={`${styles.navLink} ${styles.dropdownToggle} ${isContentsActive ? styles.active : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                콘텐츠 <span className={`${styles.arrow} ${isDropdownOpen ? styles.arrowRotate : ''}`}>▾</span>
              </button>
              <ul className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.show : ''}`}>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`${styles.dropdownItem} ${pathname === link.href ? styles.dropdownItemActive : ''}`}
                      onClick={() => {
                        closeMenu();
                        setIsDropdownOpen(false);
                      }}
                      {...((link as any).newTab || link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Mobile: Linear List */}
            {NAV_LINKS.map((link) => (
              <li key={link.href} className={styles.mobileOnly}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
                  onClick={closeMenu}
                  {...((link as any).newTab || link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Chicorun Specific Links (Visible only on /chicorun paths) - Positioned to the right */}
            {isChicorun && (
              <>
                <li className={styles.divider} />
                {CHICORUN_LINKS.map((link) => (
                  <li key={link.href} className={styles.chicorunLinkItem}>
                    <Link
                      href={link.href}
                      className={`${styles.navLink} ${styles.chicorunLink} ${pathname === link.href ? styles.active : ''}`}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </>
            )}

            <li className={styles.authItem}>
              {status === 'loading' ? (
                <span className={styles.authLoading}>...</span>
              ) : (session || hasChicoToken) ? (
                <div className={styles.userMenu}>
                  <button onClick={handleSignOut} className={styles.logoutButton}>
                    로그아웃
                  </button>
                </div>
              ) : (
                !isChicorun && (
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                    className={styles.loginButton}
                    onClick={closeMenu}
                  >
                    로그인
                  </Link>
                )
              )}
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}


