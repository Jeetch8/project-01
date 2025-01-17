import { MouseEvent, useEffect, useRef } from "react";

type UseClickAway = (
  callback: Function
) => React.MutableRefObject<HTMLElement | null>;

const useClickAway: UseClickAway = (callback) => {
  const nodeRef = useRef<HTMLElement>(null);

  const handler = (e: globalThis.MouseEvent | TouchEvent) => {
    const el = nodeRef.current;
    if (el && !el.contains(e.target as Node)) {
      callback(e);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  });

  return nodeRef;
};

export default useClickAway;
