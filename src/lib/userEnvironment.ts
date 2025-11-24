/**
 * User Environment Detection Utility
 *
 * Detects and provides information about the user's browser, operating system,
 * device type, and other environment details for analytics tracking.
 */

export interface UserEnvironment {
  browser: {
    name: string;
    version: string;
    userAgent: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    screen: {
      width: number;
      height: number;
      pixelRatio: number;
    };
    touch: boolean;
  };
  language: string;
  timezone: string;
}

/**
 * Detects the user's browser information
 */
function detectBrowser(): { name: string; version: string; userAgent: string } {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';

  // Browser detection patterns
  const browsers = [
    { name: 'Chrome', pattern: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', pattern: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', pattern: /Version\/([0-9.]+).*Safari/ },
    { name: 'Edge', pattern: /Edg\/([0-9.]+)/ },
    { name: 'Opera', pattern: /OPR\/([0-9.]+)/ },
    { name: 'Internet Explorer', pattern: /MSIE ([0-9.]+)/ },
    { name: 'Internet Explorer', pattern: /Trident\/.*rv:([0-9.]+)/ },
  ];

  for (const browser of browsers) {
    const match = ua.match(browser.pattern);
    if (match) {
      name = browser.name;
      version = match[1];
      break;
    }
  }

  return { name, version, userAgent: ua };
}

/**
 * Detects the user's operating system
 */
function detectOS(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';

  // OS detection patterns
  const osPatterns = [
    { name: 'Windows', pattern: /Windows NT ([0-9.]+)/ },
    { name: 'macOS', pattern: /Mac OS X ([0-9_]+)/ },
    { name: 'Linux', pattern: /Linux/ },
    { name: 'Android', pattern: /Android ([0-9.]+)/ },
    { name: 'iOS', pattern: /iPhone OS ([0-9_]+)/ },
    { name: 'iPadOS', pattern: /iPad.*OS ([0-9_]+)/ },
  ];

  for (const os of osPatterns) {
    const match = ua.match(os.pattern);
    if (match) {
      name = os.name;
      version = match[1]?.replace(/_/g, '.') || 'Unknown';
      break;
    }
  }

  return { name, version };
}

/**
 * Detects the device type
 */
function detectDevice(): {
  type: 'desktop' | 'mobile' | 'tablet';
  screen: { width: number; height: number; pixelRatio: number };
  touch: boolean;
} {
  const width = window.screen.width;
  const height = window.screen.height;
  const pixelRatio = window.devicePixelRatio || 1;
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  let type: 'desktop' | 'mobile' | 'tablet' = 'desktop';

  // Simple device type detection
  if (width <= 768) {
    type = touch ? 'mobile' : 'tablet';
  } else if (width <= 1024) {
    type = 'tablet';
  } else {
    type = 'desktop';
  }

  // More specific detection for mobile/tablet
  const ua = navigator.userAgent.toLowerCase();
  if (
    ua.includes('mobile') ||
    (ua.includes('android') && ua.includes('mobile'))
  ) {
    type = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    type = 'tablet';
  }

  return {
    type,
    screen: { width, height, pixelRatio },
    touch,
  };
}

/**
 * Gets the user's environment information
 */
export function getUserEnvironment(): UserEnvironment {
  return {
    browser: detectBrowser(),
    os: detectOS(),
    device: detectDevice(),
    language: navigator.language || 'Unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
  };
}

/**
 * Formats environment data for analytics tracking
 */
export function formatEnvironmentForAnalytics(
  env: UserEnvironment
): Record<string, string> {
  return {
    browser_name: env.browser.name,
    browser_version: env.browser.version,
    os_name: env.os.name,
    os_version: env.os.version,
    device_type: env.device.type,
    screen_resolution: `${env.device.screen.width}x${env.device.screen.height}`,
    pixel_ratio: env.device.screen.pixelRatio.toString(),
    touch_support: env.device.touch.toString(),
    language: env.language,
    timezone: env.timezone,
  };
}
