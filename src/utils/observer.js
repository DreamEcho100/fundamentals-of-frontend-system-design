const defaultObserverConfig = { threshold: 0.25 };

/**
 * @param target   {HTMLElement[]}
 * @param callback {IntersectionObserverCallback}
 * @param config   {IntersectionObserverInit}
 * @return {[IntersectionObserver, timeoutId: number]}
 */
export function intersectionObserver(target, callback, config) {
  const observerInit = Object.assign({}, defaultObserverConfig, config ?? {});
  const observer = new IntersectionObserver(callback, observerInit);
  const timeoutId = setTimeout(() => {
    for (const t of target) {
      observer.observe(t);
    }
  }, 100);
  return [observer, timeoutId];
}
