'use client';

import { Menu } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';

interface HeaderProps {
  appVersion: string;
}

/**
 * Header component - Displays settings menu icon
 */
export const Header = ({ appVersion }: HeaderProps) => {
  return <SettingsPanel appVersion={appVersion} />;
};
