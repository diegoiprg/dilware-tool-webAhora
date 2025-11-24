'use client';

import { CalendarDays } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

/**
 * Formats a Date object into a localized date string based on user settings
 * @param date - Date object to format
 * @param language - Language code ('es' | 'en')
 * @param dateSeparator - Date separator character
 * @param dayFormat - Day format ('full' | 'short')
 * @param monthFormat - Month format ('full' | 'short')
 * @param yearFormat - Year format ('full' | 'short')
 * @returns Formatted date string
 */
const formatDate = (
  date: Date,
  language: string,
  dateSeparator: string,
  dayFormat: string,
  monthFormat: string,
  yearFormat: string
): string => {
  // Get day name
  const dayName = new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'long' }).format(
    date
  );
  const formattedDayName =
    dayFormat === 'short'
      ? dayName.slice(0, 3).toUpperCase() // First 3 chars
      : dayName.charAt(0).toUpperCase() + dayName.slice(1);

  // Get day, month, year
  const day = String(date.getDate()).padStart(2, '0');
  const fullYear = date.getFullYear();
  const year =
    yearFormat === 'short' ? String(fullYear).slice(-2) : String(fullYear);

  // Get month name
  const monthName = new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', { month: 'long' }).format(date);

  let monthValue = monthName.toUpperCase();
  if (monthFormat === 'short') {
    monthValue = monthName.slice(0, 3).toUpperCase();
  }

  // Apply separator
  let separator = ' ';
  switch (dateSeparator) {
    case 'dot':
      separator = '.';
      break;
    case 'slash':
      separator = '/';
      break;
    case 'dash':
      separator = '-';
      break;
    case 'space':
    default:
      separator = ' ';
      break;
  }

  return `${formattedDayName}, ${day}${separator}${monthValue}${separator}${year}`;
};

/**
 * DateDisplay component - Shows the current date with calendar icon, centered at 100% width
 * @param date - Date object to display
 */
export const DateDisplay = ({ date }: { date: Date }) => {
  const { language, dateSeparator, dayFormat, monthFormat, yearFormat } = useSettings();
  const formattedDate = formatDate(
    date,
    language,
    dateSeparator,
    dayFormat,
    monthFormat,
    yearFormat
  );

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-3">
        <div className="rounded-full p-2">
          <CalendarDays className="size-8 sm:size-10 md:size-12 lg:size-14 xl:size-16 2xl:size-18" />
        </div>
        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl pt-1">
          <span className="font-bold">{formattedDate.split(',')[0]},</span>
          <span>{formattedDate.split(',').slice(1).join(',')}</span>
        </span>
      </div>
    </div>
  );
};
