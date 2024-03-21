export function on<T extends EventTarget>(
  object: T | null,
  ...args:
    | Parameters<T['addEventListener']>
    | [string, EventListenerOrEventListenerObject | CallableFunction, ...any]
): void {
  object?.addEventListener(
    ...(args as Parameters<HTMLElement['addEventListener']>)
  );
}

export function off<T extends EventTarget>(
  object: T | null,
  ...args:
    | Parameters<T['removeEventListener']>
    | [string, EventListenerOrEventListenerObject | CallableFunction, ...any]
): void {
  object?.removeEventListener?.(
    ...(args as Parameters<HTMLElement['removeEventListener']>)
  );
}
