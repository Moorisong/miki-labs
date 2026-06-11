'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MainLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isToby = pathname?.startsWith('/toby') ?? false;
    const isPuzzle = pathname?.startsWith('/puzzle') ?? false;

    return (
        <main
            className="main-content"
            style={mounted && (isToby || isPuzzle) ? { paddingTop: 0 } : undefined}
        >
            {children}
        </main>
    );
}
