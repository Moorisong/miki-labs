'use client';

import { LogOut, Trash2, UserX, ChevronRight } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SettingsPanelProps {
  onClearData: () => void;
  onDeleteAccount: () => void;
}

export default function SettingsPanel({ onClearData, onDeleteAccount }: SettingsPanelProps) {
  const handleSignOut = async () => {
    try {
      const { clearAllPuzzleState } = await import('@/lib/puzzle-db');
      await clearAllPuzzleState();
    } catch (e) {
      console.error('Failed to clear puzzle state on signout:', e);
    }
    signOut({ callbackUrl: '/puzzle' });
  };

  const menuItems = [
    { 
      icon: LogOut, 
      label: '로그아웃', 
      color: 'var(--puzzle-foreground)', 
      onClick: handleSignOut 
    },
    { 
      icon: Trash2, 
      label: '모든 퍼즐 데이터 초기화', 
      color: '#F59E0B', 
      onClick: onClearData 
    },
    { 
      icon: UserX, 
      label: '계정 탈퇴', 
      color: 'var(--puzzle-destructive, #EF4444)', 
      onClick: onDeleteAccount 
    },
  ];

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
      }}
    >
      {menuItems.map(({ icon: Icon, label, color, onClick }, idx) => (
        <button
          key={label}
          onClick={onClick}
          className="w-full flex items-center justify-between px-5 py-4 text-sm transition-colors text-left"
          style={{
            color,
            borderBottom: idx < menuItems.length - 1 ? '1px solid var(--puzzle-border)' : 'none',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--puzzle-muted)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <div className="flex items-center gap-3">
            <Icon size={16} strokeWidth={2.5} />
            <span className="font-semibold">{label}</span>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--puzzle-muted-foreground)' }} />
        </button>
      ))}
    </div>
  );
}
