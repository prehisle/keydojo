import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'plugin'; pluginId: string }
  | { name: 'drill'; pluginId: string };

function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'p' && parts[1]) {
    return parts[2] === 'drill' ? { name: 'drill', pluginId: parts[1] } : { name: 'plugin', pluginId: parts[1] };
  }
  return { name: 'home' };
}

export function href(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'plugin':
      return `#/p/${route.pluginId}`;
    case 'drill':
      return `#/p/${route.pluginId}/drill`;
  }
}

export function navigate(route: Route): void {
  location.hash = href(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parse(location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
