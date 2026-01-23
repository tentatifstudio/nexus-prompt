
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nexus_guest_reveals';
const MAX_LIMIT = 3;

export const useMeteredAccess = () => {
  const [revealCount, setRevealCount] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const increment = () => {
    const nextCount = revealCount + 1;
    setRevealCount(nextCount);
    localStorage.setItem(STORAGE_KEY, nextCount.toString());
  };

  const hasRemaining = revealCount < MAX_LIMIT;
  const remaining = Math.max(0, MAX_LIMIT - revealCount);

  return {
    revealCount,
    remaining,
    hasRemaining,
    increment,
    maxLimit: MAX_LIMIT
  };
};
