/**
 * MainContent Component
 *
 * This is the main component of the Personal Dashboard application.
 * It renders a full-screen layout displaying the current time, date, location, and weather.
 * Inspired by Fliqlo, the clock takes maximum possible size for visibility from distance.
 *
 * Key Features:
 * - Fliqlo-style layout with maximized clock size
 * - Fullscreen mode with screen wake lock to prevent screen timeout
 * - Real-time updates for time, location, and weather data
 * - Settings panel for user customization
 *
 * Layout Structure (Fliqlo-inspired):
 * - Top section: Menu and date (menu aligned right)
 * - Main section: Maximum-sized clock (takes most of the screen)
 * - Bottom section: Weather with integrated location
 *
 * @version 1.13.9 - Fixed Android loading regression by restoring original loading logic
 */

'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useDateTime } from '@/hooks/useDateTime';
import { useAppLocation } from '@/hooks/useAppLocation';
import { useWeather } from '@/hooks/useWeather';
import { useToast } from '@/hooks/use-toast';
import {
  useIsAndroid,
  useIsOldAndroid,
  useIsIOS,
} from '@/hooks/useIsAndroidTablet';
import { LoadingScreen } from '@/components/app/LoadingScreen';
import { DashboardLayout } from '@/components/app/DashboardLayout';
import { APP_VERSION } from '@/lib/version';
import { trackUserInteraction } from '@/lib/analytics';

/**
 * MainContent - The root component for the dashboard
 *
 * Manages the overall layout and state for the application, including:
 * - Time and date display
 * - Location and weather data
 * - Fullscreen mode with wake lock
 * - Settings panel
 */
export default function MainContent() {
  // Reference to the main container for potential DOM manipulation
  const containerRef = useRef<HTMLDivElement>(null);

  // State for managing screen wake lock in fullscreen mode
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  // Device detection hooks
  const isAndroid = useIsAndroid();
  const isOldAndroid = useIsOldAndroid();
  const isIOS = useIsIOS();

  // Check for API support - memoized to avoid recalculation
  const isFullscreenSupported = useMemo(
    () => typeof document !== 'undefined' && !!document.fullscreenEnabled,
    []
  );
  const isWakeLockSupported = useMemo(
    () => typeof navigator !== 'undefined' && 'wakeLock' in navigator,
    []
  );

  // Custom hooks for data fetching
  const currentTime = useDateTime();
  const { toast } = useToast();

  // Location and weather data hooks
  const {
    location,
    error: locationError,
    loading: locationLoading,
  } = useAppLocation();
  const {
    weather,
    error: weatherError,
    loading: weatherLoading,
    retry: retryWeather,
  } = useWeather(location?.latitude, location?.longitude);

  // Show user-friendly error messages for location and weather failures
  useEffect(() => {
    if (locationError && !isOldAndroid) {
      toast({
        title: 'Error de ubicación',
        description:
          'No se pudo obtener su ubicación. Verifique permisos de geolocalización.',
        variant: 'destructive',
      });
    }
  }, [locationError, isOldAndroid, toast]);

  useEffect(() => {
    if (weatherError && !isOldAndroid) {
      toast({
        title: 'Error del clima',
        description:
          'No se pudo cargar la información del clima. Verifique su conexión a internet.',
        variant: 'destructive',
      });
    }
  }, [weatherError, isOldAndroid, toast]);

  // Effect to manage screen wake lock during fullscreen mode
  // Only active if Wake Lock API is supported
  useEffect(() => {
    if (!isWakeLockSupported) return;

    const handleFullscreenChange = async () => {
      if (document.fullscreenElement) {
        // Entered fullscreen, request wake lock to keep screen on
        try {
          const wl = await navigator.wakeLock.request('screen');
          setWakeLock(wl);
        } catch (err) {
          console.error('Wake lock request failed', err);
        }
      } else {
        // Exited fullscreen, release wake lock
        if (wakeLock) {
          wakeLock.release();
          setWakeLock(null);
        }
      }
    };

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup: remove listener and release wake lock on unmount
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock, isWakeLockSupported]);

  /**
   * Toggles fullscreen mode for the application
   * Only works if Fullscreen API is supported
   * When entering fullscreen, the wake lock effect will automatically engage if supported
   */
  const handleFullscreen = () => {
    if (!isFullscreenSupported) return;

    const mainContainer = document.documentElement;
    if (document.fullscreenElement) {
      // Exit fullscreen mode
      document.exitFullscreen();
      trackUserInteraction.fullscreenToggle('exit');
    } else {
      // Enter fullscreen mode - wake lock will be requested via the useEffect
      mainContainer.requestFullscreen().catch(() => { });
      trackUserInteraction.fullscreenToggle('enter');
    }
  };

  // Show loading screen while initial data is being fetched
  // On old Android devices, reduce loading time to prevent getting stuck
  if (!currentTime || (locationLoading && !isOldAndroid)) {
    return <LoadingScreen />;
  }

  // Render the main dashboard layout
  return (
    <DashboardLayout
      containerRef={containerRef}
      currentTime={currentTime}
      appVersion={APP_VERSION}
      location={location}
      weather={weather}
      weatherLoading={weatherLoading}
      weatherError={weatherError}
      locationError={locationError}
      onFullscreen={handleFullscreen}
      onRetryWeather={retryWeather}
      isFullscreenSupported={isFullscreenSupported}
      isAndroid={isAndroid}
      isOldAndroid={isOldAndroid}
      isIOS={isIOS}
    />
  );
}

