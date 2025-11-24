/**
 * Google Analytics 4 tracking utilities
 */

import {
  getUserEnvironment,
  formatEnvironmentForAnalytics,
} from './userEnvironment';
import { APP_VERSION } from './version';

// GA4 Measurement ID from environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Check if GA is available and configured
 */
export const isGAReady = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    window.gtag !== undefined &&
    GA_MEASUREMENT_ID.length > 0
  );
};

/**
 * Send GA4 event
 */
export const trackEvent = (
  eventName: string,
  parameters: Record<string, any> = {}
): void => {
  if (!isGAReady()) return;

  window.gtag('event', eventName, {
    ...parameters,
    app_version: APP_VERSION,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Set custom dimensions
 */
export const setCustomDimensions = (dimensions: Record<string, any>): void => {
  if (!isGAReady()) return;

  Object.entries(dimensions).forEach(([key, value]) => {
    window.gtag('config', GA_MEASUREMENT_ID, {
      [key]: value,
    });
  });
};

/**
 * Track page view
 */
export const trackPageView = (pagePath: string): void => {
  if (!isGAReady()) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: pagePath,
  });
};

/**
 * Track user interactions
 */
export const trackUserInteraction = {
  fullscreenToggle: (action: 'enter' | 'exit') =>
    trackEvent('fullscreen_toggle', { action }),

  settingsPanelOpen: () => trackEvent('settings_panel_open'),

  temperatureUnitChange: (unit: 'C' | 'F') =>
    trackEvent('temperature_unit_change', { unit }),

  timeFormatChange: (format: '12h' | '24h') =>
    trackEvent('time_format_change', { format }),

  secondsToggle: (enabled: boolean) =>
    trackEvent('seconds_toggle', { enabled }),

  blinkingColonsToggle: (enabled: boolean) =>
    trackEvent('blinking_colons_toggle', { enabled }),

  refreshIntervalChange: (interval: number) =>
    trackEvent('refresh_interval_change', { interval_minutes: interval }),

  updateNotificationShown: (latestVersion: string) =>
    trackEvent('update_notification_shown', { latest_version: latestVersion }),

  updateCheckIntervalChange: (interval: number) =>
    trackEvent('update_check_interval_change', { interval_hours: interval }),

  updateApplied: (version: string) =>
    trackEvent('update_applied', { applied_version: version }),

  // Date settings
  dateSeparatorChange: (separator: string) =>
    trackEvent('date_separator_change', { separator }),

  dayFormatChange: (format: string) =>
    trackEvent('day_format_change', { format }),

  monthFormatChange: (format: string) =>
    trackEvent('month_format_change', { format }),

  // Theme settings
  themeChange: (theme: string) => trackEvent('theme_change', { theme }),
};

/**
 * Track weather and location events
 */
export const trackWeatherLocation = {
  weatherDataLoad: (success: boolean) =>
    trackEvent('weather_data_load', { success }),

  weatherError: (errorType: string) =>
    trackEvent('weather_error', { error_type: errorType }),

  locationGeolocationSuccess: () => trackEvent('location_geolocation_success'),

  locationIPFallback: () => trackEvent('location_ip_fallback'),

  locationError: (errorType: string) =>
    trackEvent('location_error', { error_type: errorType }),
};

/**
 * Track app usage events
 */
export const trackAppUsage = {
  appVersionView: () => trackEvent('app_version_view'),

  orientationChange: (orientation: 'portrait' | 'landscape') =>
    trackEvent('orientation_change', { orientation }),

  deviceType: (type: 'mobile' | 'tablet' | 'desktop') =>
    trackEvent('device_type', { device_type: type }),
};

/**
 * Track user environment data
 */
export const trackUserEnvironment = {
  /**
   * Track complete user environment on app initialization
   */
  trackEnvironment: () => {
    const env = getUserEnvironment();
    const envData = formatEnvironmentForAnalytics(env);

    trackEvent('user_environment', envData);
  },

  /**
   * Track browser information
   */
  trackBrowser: () => {
    const env = getUserEnvironment();
    trackEvent('browser_info', {
      browser_name: env.browser.name,
      browser_version: env.browser.version,
    });
  },

  /**
   * Track operating system information
   */
  trackOS: () => {
    const env = getUserEnvironment();
    trackEvent('os_info', {
      os_name: env.os.name,
      os_version: env.os.version,
    });
  },

  /**
   * Track device information
   */
  trackDevice: () => {
    const env = getUserEnvironment();
    trackEvent('device_info', {
      device_type: env.device.type,
      screen_resolution: `${env.device.screen.width}x${env.device.screen.height}`,
      pixel_ratio: env.device.screen.pixelRatio,
      touch_support: env.device.touch,
    });
  },

  /**
   * Track user preferences (language, timezone)
   */
  trackUserPreferences: () => {
    const env = getUserEnvironment();
    trackEvent('user_preferences', {
      language: env.language,
      timezone: env.timezone,
    });
  },
};

/**
 * Track errors
 */
export const trackError = (error: Error, context: string): void => {
  trackEvent('javascript_error', {
    error_message: error.message,
    error_stack: error.stack,
    context,
  });
};

/**
 * Initialize GA with custom dimensions and user environment tracking
 */
export const initializeAnalytics = (): void => {
  if (!isGAReady()) return;

  // Get user environment data
  const env = getUserEnvironment();
  const envData = formatEnvironmentForAnalytics(env);

  // Set initial custom dimensions
  const dimensions = {
    app_version: APP_VERSION,
    device_category: env.device.type,
    orientation:
      env.device.screen.height > env.device.screen.width
        ? 'portrait'
        : 'landscape',
    browser_name: env.browser.name,
    os_name: env.os.name,
    screen_resolution: envData.screen_resolution,
    language: env.language,
    timezone: env.timezone,
  };

  setCustomDimensions(dimensions);

  // Track complete user environment
  trackUserEnvironment.trackEnvironment();

  // Track individual components
  trackAppUsage.deviceType(env.device.type);
  trackUserEnvironment.trackBrowser();
  trackUserEnvironment.trackOS();
  trackUserEnvironment.trackDevice();
  trackUserEnvironment.trackUserPreferences();
};

/**
 * Get device category
 */
const getDeviceCategory = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}
