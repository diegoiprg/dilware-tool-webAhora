import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook that provides the current date and time, updating every second
 * Uses useCallback for memoization to prevent unnecessary re-renders
 *
 * @returns Current Date object representing the current time
 *
 * @version 1.10.1 - Added improved documentation and type safety
 */
export const useDateTime = (): Date => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const updateTime = useCallback((): void => {
    setCurrentTime(new Date());
  }, []);

  useEffect(() => {
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [updateTime]);

  return currentTime;
};
