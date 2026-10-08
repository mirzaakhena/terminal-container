/**
 * Development aid: `window.__porttrack` lets a browser console or a test script reach the running
 * simulations directly. Each view adds its own entry. Not present in production builds.
 */
export function debugHandle(): Record<string, unknown> {
  const w = window as unknown as { __porttrack?: Record<string, unknown> };
  return (w.__porttrack ??= {});
}
