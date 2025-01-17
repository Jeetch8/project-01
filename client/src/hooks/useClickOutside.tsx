import { type MutableRefObject, type RefObject, useEffect } from 'react';
import { off, on } from '@/utils/misc';
import useSyncedRef from './useSyncedRef';

const DEFAULT_EVENTS = ['mousedown', 'touchstart'];

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T> | MutableRefObject<T>,
  callback: EventListener,
  events: string[] = DEFAULT_EVENTS
) {
  const cbRef = useSyncedRef(callback);
  const refRef = useSyncedRef(ref);

  useEffect(() => {
    function handler(this: HTMLElement, event: Event) {
      if (!refRef.current.current) return;
      const { target: evtTarget } = event;
      const cb = cbRef.current;
      if (
        !evtTarget ||
        (Boolean(evtTarget) &&
          !refRef.current.current.contains(evtTarget as Node))
      ) {
        cb.call(this, event);
      }
    }

    for (const name of events) {
      on(document, name, handler, { passive: true });
    }

    return () => {
      for (const name of events) {
        off(document, name, handler, { passive: true });
      }
    };
  }, [...events]);
}

export default useClickOutside;
