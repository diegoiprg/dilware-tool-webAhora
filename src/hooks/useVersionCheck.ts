/**
 * Hook for checking app version updates
 *
 * Periodically checks for new app versions and provides update status
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { APP_VERSION } from '@/lib/version';

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string | null;
  hasUpdate: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export interface VersionInfo {
  version: string;
  releaseDate: string;
  changelog?: string[];
}

/**
 * Hook to check for app version updates
 * @param checkInterval - Interval in milliseconds to check for updates (default: 30 minutes)
 * @param versionEndpoint - URL to fetch latest version info (optional)
 */
export function useVersionCheck(
  checkInterval: number = 15 * 60 * 1000, // 15 minutes (default for active development)
  versionEndpoint?: string
): VersionCheckResult & {
  checkForUpdates: () => Promise<void>;
  dismissUpdate: () => void;
} {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissedUpdate, setDismissedUpdate] = useState<string | null>(null);

  // Use ref to store interval ID for proper cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Default endpoint - can be overridden
  const defaultEndpoint =
    versionEndpoint ||
    'https://api.github.com/repos/diegoiprg/dilware-tool-webAhora/releases/latest';

  const checkForUpdates = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    setError(null);

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('Version check timed out');
      setIsChecking(false);
      setError('Request timeout');
    }, 10000); // 10 second timeout

    try {
      // For GitHub releases, we get the latest release
      const response = await fetch(defaultEndpoint, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
        // Add timeout to fetch request
        signal: AbortSignal.timeout(8000), // 8 second timeout for fetch
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch version info: ${response.status}`);
      }

      const releaseData = await response.json();

      // Extract version from tag_name (remove 'v' prefix if present)
      const latestVersionRaw = releaseData.tag_name || releaseData.version;
      const latestVersionClean = latestVersionRaw?.replace(/^v/, '') || null;

      console.log('Version check result:', {
        raw: latestVersionRaw,
        clean: latestVersionClean,
        current: APP_VERSION.replace(/^v/, ''),
        hasUpdate: latestVersionClean
          ? isNewerVersion(latestVersionClean, APP_VERSION.replace(/^v/, ''))
          : false,
      });

      // Ensure we have a valid version
      if (latestVersionClean) {
        setLatestVersion(latestVersionClean);
        setLastChecked(new Date());

        // Track version check in analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'version_check', {
            current_version: APP_VERSION,
            latest_version: latestVersionClean,
            has_update: isNewerVersion(
              latestVersionClean,
              APP_VERSION.replace(/^v/, '')
            ),
          });
        }
      } else {
        // If we can't extract version, assume current version
        console.warn(
          'Could not extract version from API response, using current version'
        );
        setLatestVersion(APP_VERSION.replace(/^v/, ''));
        setLastChecked(new Date());
      }

      console.log('Version check completed successfully');
    } catch (err) {
      console.warn('Failed to check for updates:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Fallback: try to get version from package.json on the deployed site with aggressive cache-busting
      try {
        console.log(
          'Attempting fallback version check from /package.json with aggressive cache busting'
        );
        const cacheBustParam = `?t=${Date.now()}&v=${Math.random()
          .toString(36)
          .substring(2, 15)}`; // More aggressive cache busting
        const packageResponse = await fetch(`/package.json${cacheBustParam}`, {
          signal: AbortSignal.timeout(3000), // 3 second timeout for fallback
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
          cache: 'no-store', // Force no caching
        });
        if (packageResponse.ok) {
          const packageData = await packageResponse.json();
          const packageVersion = packageData.version;
          console.log('Fallback version check successful:', {
            packageVersion,
            currentVersion: APP_VERSION.replace(/^v/, ''),
            hasUpdate: isNewerVersion(
              packageVersion,
              APP_VERSION.replace(/^v/, '')
            ),
            cacheBustParam,
          });
          setLatestVersion(packageVersion);
          setLastChecked(new Date());
        } else {
          console.warn(
            'Fallback package.json request failed with status:',
            packageResponse.status,
            'Response headers:',
            Object.fromEntries(packageResponse.headers.entries())
          );
          // If we can't get the deployed version, assume current version for now
          // This will be re-checked on next interval
          setLatestVersion(APP_VERSION.replace(/^v/, ''));
          setLastChecked(new Date());
        }
      } catch (fallbackErr) {
        console.warn('Fallback version check also failed:', fallbackErr);
        // If fallback fails completely, assume current version
        console.log(
          'Using current version as fallback:',
          APP_VERSION.replace(/^v/, '')
        );
        setLatestVersion(APP_VERSION.replace(/^v/, ''));
        setLastChecked(new Date());
      }
    } finally {
      clearTimeout(timeoutId);
      setIsChecking(false);
    }
  }, [isChecking, defaultEndpoint]);

  const dismissUpdate = useCallback(() => {
    if (latestVersion) {
      setDismissedUpdate(latestVersion);
    }
  }, [latestVersion]);

  // Check for updates on mount and periodically
  useEffect(() => {
    // Initial check with fallback
    const performInitialCheck = async () => {
      try {
        await checkForUpdates();
      } catch (error) {
        // If initial check fails, assume current version is latest
        console.warn(
          'Initial version check failed, assuming current version is latest'
        );
        setLatestVersion(APP_VERSION.replace(/^v/, ''));
        setLastChecked(new Date());
        setIsChecking(false);
      }
    };

    performInitialCheck();

    // Set up periodic checks
    intervalRef.current = setInterval(() => {
      checkForUpdates().catch((error) => {
        console.warn('Periodic version check failed:', error);
      });
    }, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkInterval]); // Remove checkForUpdates from dependencies

  const currentVersionClean = APP_VERSION.replace(/^v/, '');
  const hasUpdate = latestVersion
    ? isNewerVersion(latestVersion, currentVersionClean) &&
    dismissedUpdate !== latestVersion
    : false;

  return {
    currentVersion: APP_VERSION,
    latestVersion,
    hasUpdate,
    isChecking,
    lastChecked,
    error,
    checkForUpdates,
    dismissUpdate,
  };
}

/**
 * Compare two version strings to determine if the first is newer
 * Supports semantic versioning (major.minor.patch)
 */
function isNewerVersion(version1: string, version2: string): boolean {
  // Handle invalid versions
  if (!version1 || !version2) return false;

  // Normalize versions (remove 'v' prefix if present)
  const v1 = version1.replace(/^v/, '');
  const v2 = version2.replace(/^v/, '');

  // Split and parse version parts
  const v1Parts = v1.split('.').map((part) => {
    const num = parseInt(part, 10);
    return isNaN(num) ? 0 : num;
  });
  const v2Parts = v2.split('.').map((part) => {
    const num = parseInt(part, 10);
    return isNaN(num) ? 0 : num;
  });

  // Pad shorter version with zeros
  while (v1Parts.length < v2Parts.length) v1Parts.push(0);
  while (v2Parts.length < v1Parts.length) v2Parts.push(0);

  // Compare version parts
  for (let i = 0; i < v1Parts.length; i++) {
    if (v1Parts[i] > v2Parts[i]) return true;
    if (v1Parts[i] < v2Parts[i]) return false;
  }

  return false; // Versions are equal
}

/**
 * Get a user-friendly version status message
 */
export function getVersionStatusMessage(result: VersionCheckResult): string {
  if (result.error) {
    return `Error checking for updates: ${result.error}`;
  }

  if (result.isChecking) {
    return 'Checking for updates...';
  }

  if (result.hasUpdate) {
    return `New version ${result.latestVersion} available! Refresh to update.`;
  }

  if (result.latestVersion) {
    return `Up to date (v${result.currentVersion})`;
  }

  return 'Version status unknown';
}
