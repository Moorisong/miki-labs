'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface SyncChoiceModalProps {
  onChooseKeepCurrent: () => void; // YES: 로컬 진행 상태를 서버에 덮어씀
  onChooseLoadServer: () => void;  // NO: 기존 서버 진행 상태를 불러옴
  localProgress: number;
  localTimeFormatted: string;
  serverProgress: number;
  serverTimeFormatted: string;
}

export default function SyncChoiceModal({
  onChooseKeepCurrent,
  onChooseLoadServer,
  localProgress,
  localTimeFormatted,
  serverProgress,
  serverTimeFormatted,
}: SyncChoiceModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[11000] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl border p-6 text-center shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: 'var(--puzzle-background)',
          borderColor: 'var(--puzzle-border)',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          opacity: visible ? 1 : 0,
        }}
      >
        <h3 className="text-lg font-black mb-1" style={{ color: 'var(--puzzle-card-foreground)' }}>
          퍼즐 이어서 맞추기
        </h3>
        <p className="text-xs font-semibold mb-6" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          어떤 진행 기록으로 시작할까요?
        </p>

        {/* 2-Option Card Container */}
        <div className="flex flex-col gap-3 mb-2">
          
          {/* Option 1: Local / Keep Current */}
          <button
            onClick={onChooseKeepCurrent}
            className="flex items-center justify-between p-4 rounded-2xl border text-left transition-all active:scale-[0.98] hover:border-emerald-500 hover:bg-emerald-50/5 dark:hover:bg-emerald-950/10"
            style={{
              backgroundColor: 'var(--puzzle-card-background)',
              borderColor: 'var(--puzzle-border)',
            }}
          >
            <div>
              <span className="block text-xs font-bold mb-1" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                방금 플레이한 기록 (로컬)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-emerald-500">{localProgress}%</span>
                <span className="text-[10px] font-semibold flex items-center gap-0.5 text-zinc-500">
                  <Clock size={10} />
                  {localTimeFormatted}
                </span>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">
              덮어쓰기
            </div>
          </button>

          {/* Option 2: Server / Restore Previous */}
          <button
            onClick={onChooseLoadServer}
            className="flex items-center justify-between p-4 rounded-2xl border text-left transition-all active:scale-[0.98] hover:border-blue-500 hover:bg-blue-50/5 dark:hover:bg-blue-950/10"
            style={{
              backgroundColor: 'var(--puzzle-card-background)',
              borderColor: 'var(--puzzle-border)',
            }}
          >
            <div>
              <span className="block text-xs font-bold mb-1" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                이전에 저장된 기록 (서버)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-blue-500">{serverProgress}%</span>
                <span className="text-[10px] font-semibold flex items-center gap-0.5 text-zinc-500">
                  <Clock size={10} />
                  {serverTimeFormatted}
                </span>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors">
              불러오기
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
