import * as React from 'react';

/**
 * Device detection hooks for Android and iOS compatibility
 * Provides utilities to detect Android devices, old Android versions, and iOS devices
 * Used to apply device-specific layouts and fixes for compatibility issues
 *
 * @version 1.13.9 - Updated version reference
 */

const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

export function useIsAndroidTablet() {
  const [isAndroidTablet, setIsAndroidTablet] = React.useState<
    boolean | undefined
  >(undefined);

  React.useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isTablet = window.innerWidth >= TABLET_BREAKPOINT;
    const mql = window.matchMedia(`(min-width: ${TABLET_BREAKPOINT}px)`);
    const onChange = () => {
      setIsAndroidTablet(isAndroid && window.innerWidth >= TABLET_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsAndroidTablet(isAndroid && isTablet);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isAndroidTablet;
}

export function useIsIPad() {
  const [isIPad, setIsIPad] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const isiPad =
      /iPad/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const mql = window.matchMedia(`(min-width: ${TABLET_BREAKPOINT}px)`);
    const onChange = () => {
      setIsIPad(isiPad && window.innerWidth >= TABLET_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsIPad(isiPad && window.innerWidth >= TABLET_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isIPad;
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const isLargeScreen = window.innerWidth >= DESKTOP_BREAKPOINT;
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const onChange = () => {
      setIsDesktop(!isMobile && window.innerWidth >= DESKTOP_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsDesktop(!isMobile && isLargeScreen);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isDesktop;
}

export function useIsAndroid() {
  const [isAndroid, setIsAndroid] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const android = /Android/i.test(navigator.userAgent);
    setIsAndroid(android);
  }, []);

  return !!isAndroid;
}

export function useIsOldAndroid() {
  const [isOldAndroid, setIsOldAndroid] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isOldVersion = (() => {
      const match = navigator.userAgent.match(/Android (\d+)/);
      if (match) {
        const version = parseInt(match[1], 10);
        return version < 7; // Consider Android 6.x and below as old for more aggressive timeout
      }
      return false;
    })();

    setIsOldAndroid(isAndroid && isOldVersion);
  }, []);

  return !!isOldAndroid;
}

export function useIsIOS() {
  const [isIOS, setIsIOS] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);
  }, []);

  return !!isIOS;
}
