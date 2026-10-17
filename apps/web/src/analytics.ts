/**
 * Cookieless page counts via GoatCounter, only when the build sets `VITE_GOATCOUNTER`
 * (the site code, e.g. `keydojo` for keydojo.goatcounter.com). Local and fork builds send nothing.
 * Routes live in the hash, so each hash change is counted as its own path.
 */
const code = import.meta.env.VITE_GOATCOUNTER as string | undefined;

interface GoatCounter {
  count(vars: { path: string; title?: string }): void;
}
declare global {
  interface Window {
    goatcounter?: GoatCounter & { no_onload?: boolean };
  }
}

/** `#/p/sc2/s/terran%3A...` → `/p/sc2/s/terran:...`; plugin ids and scenario ids only, nothing user-typed. */
const currentPath = () => '/' + decodeURIComponent(location.hash.replace(/^#\/?/, ''));

export function startAnalytics(): void {
  if (!code || import.meta.env.DEV || navigator.webdriver) return;
  window.goatcounter = { no_onload: true } as Window['goatcounter'];
  const count = () => window.goatcounter?.count?.({ path: currentPath() });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  script.onload = count;
  document.head.appendChild(script);
  window.addEventListener('hashchange', count);
}
