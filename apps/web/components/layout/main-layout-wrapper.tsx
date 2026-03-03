'use client';

import { usePathname } from 'next/navigation';

export default function MainLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isToby = pathname.startsWith('/toby');

    return (
        <main
            className="main-content"
            style={isToby ? { paddingTop: 0 } : undefined}
        >
            {children}
        </main>
    );
}
