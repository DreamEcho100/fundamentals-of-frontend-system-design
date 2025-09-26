/**
 * @param {(...args: any[]) => any} cb
 * @param {number} delay
 * @param {object} [options]
 * @param {(timeoutId: number) => void} [options.registerTimeoutId]
 */
export function debounce(cb, delay, options) {
  let timer = 0;
  /**
   * @param {...any} args
   */
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => cb(...args), delay);
    options?.registerTimeoutId?.(timer);
  };
}
