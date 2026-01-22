'use client';

import { useState } from 'react';

export function useTutorial() {
    const [showTutorial, setShowTutorial] = useState(false);

    const closeTutorial = () => {
        setShowTutorial(false);
    };

    const openTutorial = () => {
        setShowTutorial(true);
    };

    return {
        showTutorial,
        closeTutorial,
        openTutorial,
    };
}
