'use client';

import { useState, useEffect } from 'react';
import { STORAGE_KEY } from '@/constants/storage';

export function useTutorial() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const seen = localStorage.getItem(STORAGE_KEY.TUTORIAL_SEEN);
        if (!seen) {
            setShowTutorial(true);
            setHasSeenTutorial(false);
        } else {
            setHasSeenTutorial(true);
        }
    }, []);

    const closeTutorial = () => {
        setShowTutorial(false);
        // When closed, mark as seen
        localStorage.setItem(STORAGE_KEY.TUTORIAL_SEEN, 'true');
        setHasSeenTutorial(true);
    };

    const openTutorial = () => {
        setShowTutorial(true);
    };

    return {
        showTutorial,
        hasSeenTutorial,
        closeTutorial,
        openTutorial,
    };
}
