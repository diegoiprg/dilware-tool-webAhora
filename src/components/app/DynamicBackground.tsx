import React, { useEffect, useState } from 'react';
import { useIsOldAndroid } from '@/hooks/useIsAndroidTablet';

interface DynamicBackgroundProps {
    currentTime: Date;
}

export const DynamicBackground = ({ currentTime }: DynamicBackgroundProps) => {
    const isOldAndroid = useIsOldAndroid();
    const [gradient, setGradient] = useState('');

    useEffect(() => {
        if (isOldAndroid) return;

        const hour = currentTime.getHours();

        // Define gradients for different times of day
        // Dawn: 5-8
        // Day: 8-17
        // Dusk: 17-20
        // Night: 20-5

        let newGradient = '';

        if (hour >= 5 && hour < 8) {
            // Dawn (Blue to Orange)
            newGradient = 'bg-gradient-to-br from-indigo-900 via-purple-900 to-orange-800';
        } else if (hour >= 8 && hour < 17) {
            // Day (Blue sky)
            newGradient = 'bg-gradient-to-br from-blue-600 via-blue-400 to-cyan-300';
        } else if (hour >= 17 && hour < 20) {
            // Dusk (Purple to Pink)
            newGradient = 'bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800';
        } else {
            // Night (Deep Blue/Black)
            newGradient = 'bg-gradient-to-br from-slate-950 via-slate-900 to-black';
        }

        setGradient(newGradient);
    }, [currentTime, isOldAndroid]);

    if (isOldAndroid) {
        return <div className="fixed inset-0 bg-black -z-50" />;
    }

    return (
        <div
            className={`fixed inset-0 transition-colors duration-[5000ms] ease-in-out -z-50 ${gradient}`}
            aria-hidden="true"
        />
    );
};
