'use client';

import { useEffect } from 'react';
import { initializeAnalytics } from '@/lib/analytics';

export const Analytics = () => {
  useEffect(() => {
    // Initialize analytics after component mounts
    initializeAnalytics();
  }, []);

  return null;
};
