'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import NicknameModal from '@/components/modals/nickname-modal';
import styles from './nav-bar.module.css';

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/game', label: '게임' },
  { href: '/ranking', label: '랭킹' },
  { href: '/about', label: '소개' },
];

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [nicknameInfo, setNicknameInfo] = useState<{
    canChangeNickname: boolean;
    nextChangeDate: string | null;
  }>({ canChangeNickname: true, nextChangeDate: null });
  const pathname = usePathname();
  const { data: session, status, update } = useSession();

  // 닉네임 변경 가능 여부 확인
  useEffect(() => {
    const fetchNicknameInfo = async () => {
      if (status === 'authenticated' && session?.user?.nickname) {
        try {
          const response = await fetch('/api/user/nickname');
          const data = await response.json();
          if (data.success) {
            setNicknameInfo({
              canChangeNickname: data.data.canChangeNickname,
              nextChangeDate: data.data.nextChangeDate,
            });
          }
        } catch (error) {
          console.error('닉네임 정보 조회 실패:', error);
        }
      }
    };

    fetchNicknameInfo();
  }, [status, session?.user?.nickname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    closeMenu();
    signOut({ callbackUrl: '/' });
  };

  const handleNicknameClick = () => {
    setIsNicknameModalOpen(true);
  };

  const handleNicknameSuccess = async (nickname: string) => {
    // 세션 업데이트 후 닉네임 정보 다시 조회
    await update();
    setNicknameInfo({
      canChangeNickname: false,
      nextChangeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  };

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo} onClick={closeMenu}>
            <img src="/logo.png" alt="Logo" className={styles.logoIcon} />
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
            <li className={styles.authItem}>
              {status === 'loading' ? (
                <span className={styles.authLoading}>...</span>
              ) : session ? (
                <div className={styles.userMenu}>
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt="프로필"
                      className={styles.userAvatar}
                    />
                  )}
                  <div className={styles.userInfo}>
                    {session.user?.nickname ? (
                      <button
                        type="button"
                        className={styles.userNicknameButton}
                        onClick={handleNicknameClick}
                        title="닉네임 수정"
                      >
                        {session.user.nickname}
                        <span className={styles.editIcon}>✏️</span>
                      </button>
                    ) : (
                      <span className={styles.noNickname}>닉네임 미설정</span>
                    )}
                  </div>
                  <button onClick={handleSignOut} className={styles.logoutButton}>
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={styles.loginButton}
                  onClick={closeMenu}
                >
                  로그인
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </header>

      {/* 닉네임 수정 모달 */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        onSuccess={handleNicknameSuccess}
        mode="edit"
        currentNickname={session?.user?.nickname}
        canChangeNickname={nicknameInfo.canChangeNickname}
        nextChangeDate={nicknameInfo.nextChangeDate}
      />
    </>
  );
}

