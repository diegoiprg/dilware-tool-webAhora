/**
 * SettingsPanel Component
 *
 * Provides a slide-out panel for user configuration options.
 * Displays the app version alongside the settings icon in the top-right corner.
 * Contains controls for:
 * - Temperature unit (Celsius/Fahrenheit)
 * - Time format (12h/24h)
 * - Seconds display toggle
 * - Weather data refresh interval
 * - Version update check interval
 */

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Menu } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { trackUserInteraction } from '@/lib/analytics';
import { useTranslation } from '@/lib/i18n/translations';

import { motion } from 'framer-motion';
import { useIsOldAndroid } from '@/hooks/useIsAndroidTablet';

/**
 * SettingsPanel - Configuration panel component
 * @param appVersion - The current application version string to display
 */
export const SettingsPanel = ({ appVersion }: { appVersion: string }) => {
  const isOldAndroid = useIsOldAndroid();
  const t = useTranslation();

  // Animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
  };

  // Extract settings state and setters from context
  const {
    // General settings
    language,
    setLanguage,
    // Date settings
    dateSeparator,
    setDateSeparator,
    dayFormat,
    setDayFormat,
    monthFormat,
    setMonthFormat,
    yearFormat,
    setYearFormat,
    // Time settings
    timeFormat,
    setTimeFormat,
    showSeconds,
    setShowSeconds,
    blinkingColons,
    setBlinkingColons,
    // Weather settings
    tempUnit,
    setTempUnit,
    refreshInterval,
    setRefreshInterval,
    // Appearance settings
    theme,
    setTheme,
    autoDarkMode,
    setAutoDarkMode,
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    updateCheckInterval,
    setUpdateCheckInterval,
    resetSettings,
  } = useSettings();

  // Track settings panel open
  const handleSettingsOpen = () => {
    trackUserInteraction.settingsPanelOpen();
  };

  return (
    // Settings panel trigger button
    <Sheet>
      <SheetTrigger asChild>
        <button
          onClick={handleSettingsOpen}
          className="text-muted-foreground hover:text-foreground transition-colors bg-white/20 rounded-full p-2 flex items-center gap-2"
          aria-label="Settings"
          title="Settings"
        >
          <span className="text-[1.5rem]">{appVersion}</span>
          <Menu className="size-6" />
        </button>
      </SheetTrigger>
      <SheetContent className="max-h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t.settings.title}</SheetTitle>
        </SheetHeader>
        <motion.div
          className="grid gap-6 py-6"
          variants={!isOldAndroid ? containerVariants : {}}
          initial="hidden"
          animate="visible"
        >
          {/* General Section (Language & Appearance) */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t.settings.general.title}
            </h3>

            {/* Language Toggle */}
            <div className="grid gap-3">
              <Label>{t.settings.general.language}</Label>
              <RadioGroup
                value={language}
                onValueChange={(value) => {
                  setLanguage(value as any);
                  // trackUserInteraction.languageChange(value as any); // TODO: Add tracking
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="es" id="lang-es" />
                  <Label htmlFor="lang-es">Español</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en">English</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-3">
              <Label>{t.settings.general.theme}</Label>
              <RadioGroup
                value={theme}
                onValueChange={(value) => {
                  setTheme(value as any);
                  trackUserInteraction.themeChange(value as any);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">{t.settings.general.theme_dark}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">{t.settings.general.theme_light}</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-dark-mode">{t.settings.general.autoDark}</Label>
              <Switch
                id="auto-dark-mode"
                checked={autoDarkMode}
                onCheckedChange={(checked) => {
                  setAutoDarkMode(checked);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">{t.settings.general.highContrast}</Label>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={(checked) => {
                  setHighContrast(checked);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="large-text">{t.settings.general.largeText}</Label>
              <Switch
                id="large-text"
                checked={largeText}
                onCheckedChange={(checked) => {
                  setLargeText(checked);
                }}
              />
            </div>
          </motion.div>

          {/* Separator */}
          <div className="border-t border-border/50 my-4"></div>

          {/* Fecha (Date) Section */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t.settings.date.title}
            </h3>
            <div className="grid gap-3">
              <Label>{t.settings.date.separator}</Label>
              <RadioGroup
                value={dateSeparator}
                onValueChange={(value) => {
                  setDateSeparator(value as any);
                  trackUserInteraction.dateSeparatorChange(value as any);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="space" id="space" />
                  <Label htmlFor="space">{t.settings.date.separator_space}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dot" id="dot" />
                  <Label htmlFor="dot">{t.settings.date.separator_dot}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="slash" id="slash" />
                  <Label htmlFor="slash">{t.settings.date.separator_slash}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dash" id="dash" />
                  <Label htmlFor="dash">{t.settings.date.separator_dash}</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-3">
              <Label>{t.settings.date.dayFormat}</Label>
              <RadioGroup
                value={dayFormat}
                onValueChange={(value) => {
                  setDayFormat(value as any);
                  trackUserInteraction.dayFormatChange(value as any);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="full-day" />
                  <Label htmlFor="full-day">{t.settings.date.dayFormat_full}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short-day" />
                  <Label htmlFor="short-day">{t.settings.date.dayFormat_short}</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-3">
              <Label>{t.settings.date.monthFormat}</Label>
              <RadioGroup
                value={monthFormat}
                onValueChange={(value) => {
                  setMonthFormat(value as any);
                  trackUserInteraction.monthFormatChange(value as any);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full">{t.settings.date.monthFormat_full}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short" />
                  <Label htmlFor="short">{t.settings.date.monthFormat_short}</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-3">
              <Label>{t.settings.date.yearFormat}</Label>
              <RadioGroup
                value={yearFormat}
                onValueChange={(value) => {
                  setYearFormat(value as any);
                  // Note: No specific tracking for year format yet
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="full-year" />
                  <Label htmlFor="full-year">{t.settings.date.yearFormat_full}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short-year" />
                  <Label htmlFor="short-year">{t.settings.date.yearFormat_short}</Label>
                </div>
              </RadioGroup>
            </div>
          </motion.div>

          {/* Separator */}
          <div className="border-t border-border/50 my-4"></div>

          {/* Hora (Time) Section */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t.settings.time.title}
            </h3>
            <div className="grid gap-3">
              <Label>{t.settings.time.format}</Label>
              <RadioGroup
                value={timeFormat}
                onValueChange={(value) => {
                  setTimeFormat(value as any);
                  // Auto-manage seconds based on format
                  if (value === '24h') {
                    setShowSeconds(true);
                  } else if (value === '12h') {
                    setShowSeconds(false);
                  }
                  trackUserInteraction.timeFormatChange(value as '12h' | '24h');
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="24h" id="24h" />
                  <Label htmlFor="24h">{t.settings.time.format_24}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="12h" id="12h" />
                  <Label htmlFor="12h">{t.settings.time.format_12}</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-seconds">{t.settings.time.showSeconds}</Label>
              <Switch
                id="show-seconds"
                checked={showSeconds}
                disabled={timeFormat === '12h'} // Disable when 12h format is selected
                onCheckedChange={(checked) => {
                  setShowSeconds(checked);
                  trackUserInteraction.secondsToggle(checked);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="blinking-colons">{t.settings.time.blinkingColons}</Label>
              <Switch
                id="blinking-colons"
                checked={blinkingColons}
                onCheckedChange={(checked) => {
                  setBlinkingColons(checked);
                  trackUserInteraction.blinkingColonsToggle(checked);
                }}
              />
            </div>
          </motion.div>

          {/* Separator */}
          <div className="border-t border-border/50 my-4"></div>

          {/* Clima (Weather) Section */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t.settings.weather.title}
            </h3>
            <div className="grid gap-3">
              <Label>{t.settings.weather.unit}</Label>
              <RadioGroup
                value={tempUnit}
                onValueChange={(value) => {
                  setTempUnit(value as any);
                  trackUserInteraction.temperatureUnitChange(
                    value as 'C' | 'F'
                  );
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="C" id="celsius" />
                  <Label htmlFor="celsius">{t.settings.weather.unit_c}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="F" id="fahrenheit" />
                  <Label htmlFor="fahrenheit">{t.settings.weather.unit_f}</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-3">
              <Label>{t.settings.weather.refresh}</Label>
              <Select
                value={String(refreshInterval)}
                onValueChange={(value) => {
                  const numValue = Number(value);
                  setRefreshInterval(numValue);
                  trackUserInteraction.refreshIntervalChange(numValue);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar intervalo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t.settings.weather.refresh_1}</SelectItem>
                  <SelectItem value="5">{t.settings.weather.refresh_5}</SelectItem>
                  <SelectItem value="10">{t.settings.weather.refresh_10}</SelectItem>
                  <SelectItem value="15">{t.settings.weather.refresh_15}</SelectItem>
                  <SelectItem value="30">{t.settings.weather.refresh_30}</SelectItem>
                  <SelectItem value="0">{t.settings.weather.refresh_0}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <div className="flex items-center justify-center pt-4">
            <button
              onClick={resetSettings}
              className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              {t.settings.general.reset}
            </button>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
};
