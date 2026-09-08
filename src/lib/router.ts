import { useEffect, useState } from 'react';

export const ROUTES = [
  'heute',
  'kompass',
  'saison',
  'bereiche',
  'projekte',
  'woche',
  'journal',
  'archiv',
] as const;

export type Route = (typeof ROUTES)[number];

function parse(hash: string): { route: Route; param?: string } {
  const clean = hash.replace(/^#\/?/, '');
  const [head, param] = clean.split('/');
  const route = (ROUTES as readonly string[]).includes(head)
    ? (head as Route)
    : 'heute';
  return { route, param: param || undefined };
}

/** Sehr kleiner Hash-Router — genug für acht Seiten, keine Abhängigkeit. */
export function useRoute() {
  const [location, setLocation] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setLocation(parse(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return location;
}

export function navigate(route: Route, param?: string) {
  window.location.hash = param ? `/${route}/${param}` : `/${route}`;
}
