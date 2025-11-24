import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import {
  useIsAndroidTablet,
  useIsIPad,
  useIsDesktop,
} from '@/hooks/useIsAndroidTablet';

/**
 * Formats a Date object into a time string based on format preferences
 * @param date - Date object to format
 * @param format - Time format ('12h' or '24h')
 * @param showSeconds - Whether to include seconds in the display
 * @param showColons - Whether to show colons (for blinking effect)
 * @param blinkingColons - Whether colons should blink
 * @returns Formatted time string
 */
const formatTime = (
  date: Date,
  format: '12h' | '24h',
  showSeconds: boolean,
  showColons: boolean,
  blinkingColons: boolean
): string => {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const colon = blinkingColons && !showColons ? ' ' : ':';
  let timeString = '';

  if (format === '12h') {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    timeString = `${String(hours).padStart(2, ' ')}${colon}${minutes}`;
    if (showSeconds) {
      timeString += `${colon}${seconds}`;
    }
    timeString += ` ${ampm}`;
  } else {
    timeString = `${String(hours).padStart(2, '0')}${colon}${minutes}`;
    if (showSeconds) {
      timeString += `${colon}${seconds}`;
    }
  }
  return timeString;
};

interface ClockProps {
  time: Date;
  onClick?: () => void;
  isFullscreenSupported?: boolean;
  isOldAndroid?: boolean;
  isIOS?: boolean;
}

/**
 * Clock component - Fliqlo-style maximized clock display
 * Takes maximum possible size for visibility from distance, similar to Fliqlo screensaver
 * Uses vmin units for responsive scaling across all devices and orientations
 * Clicking toggles fullscreen mode if supported
 *
 * @param time - Current time Date object
 * @param onClick - Handler for click events (fullscreen toggle)
 * @param isFullscreenSupported - Whether fullscreen API is available
 *
 * @version 1.13.2 - Fixed GitHub Actions workflow to use --legacy-peer-deps for deployment
 */
export const Clock = React.memo(
  ({
    time,
    onClick,
    isFullscreenSupported = true,
    isOldAndroid = false,
    isIOS = false,
  }: ClockProps) => {
    const { timeFormat, showSeconds, blinkingColons } = useSettings();
    const isAndroidTablet = useIsAndroidTablet();
    const isIPad = useIsIPad();
    const isDesktop = useIsDesktop();
    const [isPortrait, setIsPortrait] = React.useState(
      window.innerHeight > window.innerWidth
    );
    const [showColons, setShowColons] = React.useState(true);
    const [canShowSeconds, setCanShowSeconds] = React.useState(showSeconds);

    // Responsive seconds display - hide if text doesn't fit
    React.useEffect(() => {
      const checkTextFit = () => {
        const testTime = formatTime(
          time,
          timeFormat,
          true, // Test with seconds
          true,
          false
        );
        const testDiv = document.createElement('div');
        testDiv.style.position = 'absolute';
        testDiv.style.visibility = 'hidden';
        testDiv.style.whiteSpace = 'nowrap';
        testDiv.style.fontSize = '18vmin'; // Base size for better accessibility
        testDiv.textContent = testTime;
        document.body.appendChild(testDiv);

        const textWidth = testDiv.offsetWidth;
        const screenWidth = window.innerWidth;
        const fits = textWidth < screenWidth * 0.95; // 95% of screen width

        document.body.removeChild(testDiv);
        setCanShowSeconds(fits && showSeconds);
      };

      checkTextFit();
      window.addEventListener('resize', checkTextFit);
      return () => window.removeEventListener('resize', checkTextFit);
    }, [time, timeFormat, showSeconds]);

    // Auto-hide seconds indicator when seconds are hidden
    React.useEffect(() => {
      if (!canShowSeconds && showSeconds) {
        // If seconds don't fit but are enabled, hide the colon indicator
        setShowColons(false);
      } else if (blinkingColons) {
        setShowColons(true);
      }
    }, [canShowSeconds, showSeconds, blinkingColons]);

    const formattedTime = formatTime(
      time,
      timeFormat,
      canShowSeconds,
      showColons,
      blinkingColons
    );

    React.useEffect(() => {
      const handleResize = () => {
        setIsPortrait(window.innerHeight > window.innerWidth);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle blinking colons effect
    React.useEffect(() => {
      if (!blinkingColons) {
        setShowColons(true);
        return;
      }

      const interval = setInterval(() => {
        setShowColons((prev) => !prev);
      }, 1000); // Blink every second

      return () => clearInterval(interval);
    }, [blinkingColons]);

    return (
      <main className="w-full h-full flex flex-col items-center justify-center p-4">
        <div
          onClick={isFullscreenSupported ? onClick : undefined}
          className={`font-code font-bold text-center select-none ${
            // Fliqlo-style: maximize clock size for visibility from distance
            // Enhanced with better responsive scaling and visual hierarchy
            // Improved vertical sizing while maintaining horizontal fit
            // Adjust width when seconds are enabled to fit content
            // Increase text size on old Android and iOS devices for better visibility
            showSeconds && canShowSeconds ? 'w-auto max-w-full' : 'w-full'
          } ${
            isOldAndroid
              ? isPortrait
                ? 'text-[40vmin]'
                : 'text-[44vmin]'
              : isIOS
              ? isPortrait
                ? 'text-[36vmin]'
                : 'text-[40vmin]'
              : isAndroidTablet
              ? isPortrait
                ? 'text-[32vmin]'
                : 'text-[36vmin]'
              : isIPad
              ? isPortrait
                ? 'text-[32vmin]'
                : 'text-[34vmin]'
              : isDesktop
              ? 'lg:text-[32vmin] xl:text-[36vmin] 2xl:text-[42vmin] 3xl:text-[46vmin] 4xl:text-[50vmin]'
              : !isPortrait
              ? 'text-[32vmin]'
              : 'text-[28vmin]'
          } leading-none whitespace-nowrap tabular-nums overflow-hidden transition-all duration-300 ease-in-out ${
            isFullscreenSupported
              ? 'cursor-pointer hover:scale-105 active:scale-95'
              : 'cursor-default'
          } drop-shadow-lg`}
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
            filter: 'contrast(1.1) brightness(1.05)',
          }}
        >
          {formattedTime}
        </div>
      </main>
    );
  }
);
