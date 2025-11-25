'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Language } from '@/lib/i18n/translations';

/**
 * Temperature unit type
 */
export type TempUnit = 'C' | 'F';

/**
 * Time format type
 */
export type TimeFormat = '12h' | '24h';

/**
 * Date separator type
 */
export type DateSeparator = 'space' | 'dot' | 'slash' | 'dash';

/**
 * Day format type
 */
export type DayFormat = 'full' | 'short';

/**
 * Month format type
 */
export type MonthFormat = 'full' | 'short';

/**
 * Year format type
 */
export type YearFormat = 'full' | 'short';

/**
 * Theme type
 */
export type Theme = 'light' | 'dark';

/**
 * Settings interface for user preferences
 */
interface Settings {
  // General settings
  language: Language;

  // Date settings
  dateSeparator: DateSeparator;
  dayFormat: DayFormat;
  monthFormat: MonthFormat;
  yearFormat: YearFormat;

  // Time settings
  timeFormat: TimeFormat;
  showSeconds: boolean;
  blinkingColons: boolean;

  // Weather settings
  tempUnit: TempUnit;
  refreshInterval: number; // weather refresh interval in minutes

  // Appearance settings
  theme: Theme;
  autoDarkMode: boolean; // automatic dark mode based on sunset/sunrise
  highContrast: boolean; // high contrast mode for accessibility
  largeText: boolean; // large text mode for accessibility
  updateCheckInterval: number; // version update check interval in minutes
}

/**
 * Settings context state including setters
 */
interface SettingsState extends Settings {
  // General setters
  setLanguage: (language: Language) => void;

  // Date setters
  setDateSeparator: (separator: DateSeparator) => void;
  setDayFormat: (format: DayFormat) => void;
  setMonthFormat: (format: MonthFormat) => void;
  setYearFormat: (format: YearFormat) => void;

  // Time setters
  setTimeFormat: (format: TimeFormat) => void;
  setShowSeconds: (show: boolean) => void;
  setBlinkingColons: (blinking: boolean) => void;

  // Weather setters
  setTempUnit: (unit: TempUnit) => void;
  setRefreshInterval: (interval: number) => void;

  // Appearance setters
  setTheme: (theme: Theme) => void;
  setAutoDarkMode: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  setUpdateCheckInterval: (interval: number) => void;

  // Reset
  resetSettings: () => void;
}

/**
 * Local storage key for settings persistence
 */
const SETTINGS_STORAGE_KEY = 'chronos-settings';

/**
 * Default settings values
 */
const defaultSettings: Settings = {
  // General settings
  language: 'es',

  // Date settings
  dateSeparator: 'space',
  dayFormat: 'full',
  monthFormat: 'full',
  yearFormat: 'full',

  // Time settings
  timeFormat: '24h',
  showSeconds: false,
  blinkingColons: false,

  // Weather settings
  tempUnit: 'C',
  refreshInterval: 1, // weather refresh interval in minutes (1 min default)

  // Appearance settings
  theme: 'dark',
  autoDarkMode: true, // automatic dark mode enabled by default
  highContrast: false, // high contrast mode disabled by default
  largeText: false, // large text mode disabled by default
  updateCheckInterval: 1, // version update check interval in minutes (1 min default)
};

/**
 * React context for settings state management
 */
const SettingsContext = createContext<SettingsState | undefined>(undefined);

/**
 * SettingsProvider component - Provides settings context to the app
 * Manages persistence to localStorage with validation and error handling
 *
 * @param children - Child components to be wrapped with settings context
 *
 * @version 1.13.2 - Fixed GitHub Actions workflow to use --legacy-peer-deps for deployment
 */
export const SettingsProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const loadSettings = useCallback(() => {
    try {
      const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        // Validate parsed settings against expected structure
        if (parsed && typeof parsed === 'object') {
          // Ensure language is valid if present, otherwise default
          if (parsed.language && !['es', 'en'].includes(parsed.language)) {
            parsed.language = defaultSettings.language;
          }
          setSettings((s) => ({ ...s, ...parsed }));
        }
      } else {
        // No stored settings, try to detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (['es', 'en'].includes(browserLang)) {
          setSettings((s) => ({ ...s, language: browserLang as Language }));
        }
      }
    } catch (error) {
      console.error('Error reading settings from localStorage', error);
      // Reset to defaults if parsing fails
      setSettings(defaultSettings);
    }
  }, []);

  const saveSettings = useCallback((settingsToSave: Settings) => {
    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settingsToSave)
      );
    } catch (error) {
      console.error('Error saving settings to localStorage', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings, saveSettings]);

  // General setters
  const setLanguage = useCallback((language: Language) => {
    if (!['es', 'en'].includes(language)) {
      console.error('Invalid language:', language);
      return;
    }
    setSettings((s) => ({ ...s, language }));
  }, []);

  // Date setters with validation
  const setDateSeparator = useCallback((separator: DateSeparator) => {
    if (!['space', 'dot', 'slash', 'dash'].includes(separator)) {
      console.error('Invalid date separator:', separator);
      return;
    }
    setSettings((s) => ({ ...s, dateSeparator: separator }));
  }, []);

  const setDayFormat = useCallback((format: DayFormat) => {
    if (!['full', 'short'].includes(format)) {
      console.error('Invalid day format:', format);
      return;
    }
    setSettings((s) => ({ ...s, dayFormat: format }));
  }, []);

  const setMonthFormat = useCallback((format: MonthFormat) => {
    if (!['full', 'short'].includes(format)) {
      console.error('Invalid month format:', format);
      return;
    }
    setSettings((s) => ({ ...s, monthFormat: format }));
  }, []);

  const setYearFormat = useCallback((format: YearFormat) => {
    if (!['full', 'short'].includes(format)) {
      console.error('Invalid year format:', format);
      return;
    }
    setSettings((s) => ({ ...s, yearFormat: format }));
  }, []);

  // Time setters with validation
  const setTimeFormat = useCallback((format: TimeFormat) => {
    if (!['12h', '24h'].includes(format)) {
      console.error('Invalid time format:', format);
      return;
    }
    setSettings((s) => ({ ...s, timeFormat: format }));
  }, []);

  const setShowSeconds = useCallback((show: boolean) => {
    if (typeof show !== 'boolean') {
      console.error('Invalid showSeconds value:', show);
      return;
    }
    setSettings((s) => ({ ...s, showSeconds: show }));
  }, []);

  const setBlinkingColons = useCallback((blinking: boolean) => {
    if (typeof blinking !== 'boolean') {
      console.error('Invalid blinkingColons value:', blinking);
      return;
    }
    setSettings((s) => ({ ...s, blinkingColons: blinking }));
  }, []);

  // Weather setters with validation
  const setTempUnit = useCallback((unit: TempUnit) => {
    if (!['C', 'F'].includes(unit)) {
      console.error('Invalid temperature unit:', unit);
      return;
    }
    setSettings((s) => ({ ...s, tempUnit: unit }));
  }, []);

  const setRefreshInterval = useCallback((interval: number) => {
    if (!Number.isInteger(interval) || interval < 0 || interval > 60) {
      console.error('Invalid refresh interval:', interval);
      return;
    }
    setSettings((s) => ({ ...s, refreshInterval: interval }));
  }, []);

  // General setters with validation
  const setTheme = useCallback((theme: Theme) => {
    if (!['light', 'dark'].includes(theme)) {
      console.error('Invalid theme:', theme);
      return;
    }
    setSettings((s) => ({ ...s, theme: theme }));
  }, []);

  const setUpdateCheckInterval = useCallback((interval: number) => {
    if (!Number.isInteger(interval) || interval < 0 || interval > 60) {
      console.error('Invalid update check interval:', interval);
      return;
    }
    setSettings((s) => ({ ...s, updateCheckInterval: interval }));
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    if (typeof enabled !== 'boolean') {
      console.error('Invalid high contrast value:', enabled);
      return;
    }
    setSettings((s) => ({ ...s, highContrast: enabled }));
  }, []);

  const setLargeText = useCallback((enabled: boolean) => {
    if (typeof enabled !== 'boolean') {
      console.error('Invalid large text value:', enabled);
      return;
    }
    setSettings((s) => ({ ...s, largeText: enabled }));
  }, []);

  const setAutoDarkMode = useCallback((enabled: boolean) => {
    if (typeof enabled !== 'boolean') {
      console.error('Invalid auto dark mode value:', enabled);
      return;
    }
    setSettings((s) => ({ ...s, autoDarkMode: enabled }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        // General setters
        setLanguage,
        // Date setters
        setDateSeparator,
        setDayFormat,
        setMonthFormat,
        setYearFormat,
        // Time setters
        setTimeFormat,
        setShowSeconds,
        setBlinkingColons,
        // Weather setters
        setTempUnit,
        setRefreshInterval,
        // Appearance setters
        setTheme,
        setAutoDarkMode,
        setHighContrast,
        setLargeText,
        setUpdateCheckInterval,
        // Reset
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Custom hook to access settings context
 * Must be used within a SettingsProvider
 *
 * @returns Settings state and setter functions
 * @throws Error if used outside of SettingsProvider
 *
 * @version 1.10.1 - Added error handling and documentation
 */
export const useSettings = (): SettingsState => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
