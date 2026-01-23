'use client';

import { useAntiDebug } from '@/lib/utils/anti-debug';

export default function AntiDebugProvider({ children }: { children: React.ReactNode }) {
    useAntiDebug();
    return <>{children}</>;
}
