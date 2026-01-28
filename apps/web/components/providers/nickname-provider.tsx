'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import NicknameModal from '@/components/modals/nickname-modal';

interface NicknameProviderProps {
  children: React.ReactNode;
}

export default function NicknameProvider({ children }: NicknameProviderProps) {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);

  const nickname = session?.user?.nickname;
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    // 로그인 상태이고, 닉네임이 없을 때만 모달 표시
    if (isAuthenticated && session?.user && !nickname) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isAuthenticated, nickname]);

  const handleSuccess = (nickname: string) => {
    setShowModal(false);
    // 세션이 업데이트되면 자동으로 상태가 변경됨
  };

  return (
    <>
      {children}
      <NicknameModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
