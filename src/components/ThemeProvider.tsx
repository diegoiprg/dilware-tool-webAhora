'use client';

import { useSettings } from '@/context/SettingsContext';
import { useEffect } from 'react';

/**
 * ThemeProvider component - Manages automatic and manual theme switching
 * Supports automatic dark mode based on sunset/sunrise times
 *
 * @param children - Child components to be wrapped with theme context
 *
 * @version 1.13.2 - Fixed GitHub Actions workflow to use --legacy-peer-deps for deployment
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, autoDarkMode, highContrast, largeText } = useSettings();

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;

      if (autoDarkMode) {
        // Automatic dark mode based on sunset/sunrise
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 60 + minutes;

        // Approximate sunset at 18:00 (6 PM) and sunrise at 6:00 (6 AM)
        const sunset = 18 * 60; // 18:00
        const sunrise = 6 * 60; // 6:00

        const isNight = currentTime >= sunset || currentTime < sunrise;

        if (isNight) {
          root.classList.remove('light');
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
        }
      } else {
        // Manual theme selection
        if (theme === 'light') {
          root.classList.remove('dark');
          root.classList.add('light');
        } else {
          root.classList.remove('light');
          root.classList.add('dark');
        }
      }

      // Apply accessibility settings
      if (highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }

      if (largeText) {
        root.classList.add('large-text');
      } else {
        root.classList.remove('large-text');
      }
    };

    applyTheme();

    // Update theme every minute for automatic mode
    if (autoDarkMode) {
      const interval = setInterval(applyTheme, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [theme, autoDarkMode, highContrast, largeText]);

  return <>{children}</>;
}
