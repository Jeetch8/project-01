import { useEffect, useRef, useState } from 'react';

export const useThrottle = <T, _>(
  value: T,
  interval: number = 500
): T | undefined => {
  const [state, setState] = useState<T>();
  const lastupdate = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    if (lastupdate.current && now >= lastupdate.current + interval) {
      setState(value);
      lastupdate.current = now;
    } else {
      const interval_id = window.setInterval(() => {
        setState(value);
      }, interval);

      return () => window.clearInterval(interval_id);
    }
  }, [interval, value]);

  return state;
};
