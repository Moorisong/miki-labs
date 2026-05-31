'use client';

import { Puzzle } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const links = [
    { label: '서비스 소개', href: '/puzzle' },
    { label: '이용약관', href: '/terms' },
    { label: '개인정보처리방침', href: '/privacy' },
  ];

  return (
    <footer
      className="mt-auto border-t"
      style={{ 
        backgroundColor: 'var(--puzzle-glass-bg)',
        borderTop: '1px solid var(--puzzle-border)' 
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'var(--puzzle-primary)' }}
            >
              <Puzzle size={14} color="white" strokeWidth={2.5} />
            </div>
            <span
              className="text-base tracking-tight font-extrabold"
              style={{ color: 'var(--puzzle-card-foreground)' }}
            >
              하루퍼즐
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {links.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-semibold transition-colors duration-150"
                style={{ color: 'var(--puzzle-muted-foreground)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--puzzle-foreground)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--puzzle-muted-foreground)';
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className="mt-6 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{ borderTop: '1px solid var(--puzzle-border)' }}
        >
          <p className="text-xs font-medium" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            © {new Date().getFullYear()} 하루퍼즐. All rights reserved.
          </p>
          <p className="text-xs font-semibold" style={{ color: 'var(--puzzle-primary)' }}>
            🧘 매주 새로운 퍼즐로 힐링과 도전을 만나보세요.
          </p>
        </div>
      </div>
    </footer>
  );
}
