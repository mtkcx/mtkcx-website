import { useState, useCallback } from 'react';

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  storageKey: string;
}

interface AttemptRecord {
  count: number;
  resetAt: number;
}

export const useRateLimit = (options: RateLimitOptions) => {
  const [isLimited, setIsLimited] = useState(false);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const storageData = localStorage.getItem(options.storageKey);
    
    let attempts: AttemptRecord = { count: 0, resetAt: now + options.windowMs };
    
    if (storageData) {
      try {
        attempts = JSON.parse(storageData);
      } catch {
        // Invalid data, reset
        attempts = { count: 0, resetAt: now + options.windowMs };
      }
    }

    // Reset if window has expired
    if (now >= attempts.resetAt) {
      attempts = { count: 0, resetAt: now + options.windowMs };
    }

    // Check if rate limited
    if (attempts.count >= options.maxAttempts) {
      setIsLimited(true);
      return false;
    }

    // Increment count and save
    attempts.count += 1;
    localStorage.setItem(options.storageKey, JSON.stringify(attempts));
    
    setIsLimited(false);
    return true;
  }, [options]);

  const getRemainingTime = useCallback((): number => {
    const storageData = localStorage.getItem(options.storageKey);
    if (!storageData) return 0;
    
    try {
      const attempts: AttemptRecord = JSON.parse(storageData);
      const now = Date.now();
      return Math.max(0, attempts.resetAt - now);
    } catch {
      return 0;
    }
  }, [options.storageKey]);

  return { checkRateLimit, isLimited, getRemainingTime };
};