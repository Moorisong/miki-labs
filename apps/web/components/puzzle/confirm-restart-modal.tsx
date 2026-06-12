'use client';

interface ConfirmRestartModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmRestartModal({
  onClose,
  onConfirm,
}: ConfirmRestartModalProps) {
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="relative w-full max-w-sm rounded-3xl border p-6 md:p-8"
        style={{
          backgroundColor: 'var(--puzzle-background)',
          borderColor: 'var(--puzzle-border)',
          boxShadow: 'var(--puzzle-shadow-lg)',
          animation: 'puzzle-modal-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        <h3 className="text-xl font-black mb-3 text-red-500 flex items-center gap-2">
          ⚠️ 새로 시작하시겠습니까?
        </h3>
        <p className="text-sm font-medium leading-relaxed mb-6" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          이미 진행 중인 퍼즐이 있습니다. 처음부터 다시 시작하시면 <strong className="text-red-500 font-bold">기존 진행 데이터는 삭제</strong>됩니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border font-bold text-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--puzzle-foreground)',
              borderColor: 'var(--puzzle-border)',
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-white font-black text-sm bg-red-500 hover:bg-red-600 transition-colors"
            style={{
              boxShadow: 'var(--puzzle-shadow-md)',
            }}
          >
            새로 시작
          </button>
        </div>
      </div>
    </div>
  );
}
