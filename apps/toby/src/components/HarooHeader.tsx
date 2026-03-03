import React, { useState, useEffect } from 'react';

const NAV_LINKS = [
    { href: '/toby', label: 'TOBY' }, // Explicitly point to /toby subpath
    { href: '/htsm', label: '자아탐험' },
    { href: 'https://r-paper-web.haroo.site/', label: '롤링페이퍼' },
];

const HarooHeader: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
    const [user, setUser] = useState<{ nickname?: string; image?: string } | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                // NextAuth session endpoint (relative to root)
                const res = await fetch('/api/auth/session');
                const session = await res.json();
                if (session && Object.keys(session).length > 0) {
                    setStatus('authenticated');
                    setUser(session.user);
                } else {
                    setStatus('unauthenticated');
                }
            } catch (error) {
                console.error('Session fetch failed:', error);
                setStatus('unauthenticated');
            }
        };
        fetchSession();
    }, []);

    return (
        <header className="haroo-header">
            <nav className="haroo-nav">
                <a href="/" className="haroo-logo">
                    <img src="/logo.png" alt="Logo" className="haroo-logo-icon" />
                    <span className="haroo-logo-text">하루상자</span>
                </a>

                <ul className="haroo-nav-links">
                    <li
                        className="haroo-dropdown-container"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <button
                            className={`haroo-dropdown-toggle ${isDropdownOpen ? 'active' : ''}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            콘텐츠 <span className={`haroo-arrow ${isDropdownOpen ? 'haroo-arrow-rotate' : ''}`}>▾</span>
                        </button>
                        <ul className={`haroo-dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="haroo-dropdown-item"
                                        {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </li>
                </ul>

                <div className="haroo-auth-item">
                    {status === 'authenticated' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {user?.image && (
                                <img
                                    src={user.image}
                                    alt="프로필"
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--color-primary)' }}
                                />
                            )}
                            <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '14px' }}>
                                {user?.nickname || '사용자'}
                            </span>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default HarooHeader;
