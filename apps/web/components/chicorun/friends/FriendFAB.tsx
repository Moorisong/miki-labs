'use client';

import { useState } from 'react';
import styles from './FriendFAB.module.css';
import QuickFriendRequestModal from './QuickFriendRequestModal';

export default function FriendFAB() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className={styles.fab}
                onClick={() => setIsOpen(true)}
                title="빠른 친구 신청"
            >
                <span className={styles.fabIcon}>👤+</span>
            </button>

            {isOpen && (
                <QuickFriendRequestModal onClose={() => setIsOpen(false)} />
            )}
        </>
    );
}
