// The app is a single-page app, so Cloudflare Pages answers every unknown URL with the
// app shell and HTTP 200. This middleware keeps that shell (so the in-app "not found"
// page still renders) but changes the status to a real 404 for paths the app doesn't route.
// Keep the route list below in sync with <Routes> in src/App.tsx. API functions answer with JSON,
// so only an HTML response (no function matched, SPA shell served instead) is turned into a 404.
const EXACT_ROUTES = new Set(['/', '/privacy', '/terms', '/cancellation', '/studio']);
const ROUTE_PREFIXES = ['/studio/', '/agreement/', '/brief/', '/review/', '/project/'];

export const onRequest = async ({ request, next }: { request: Request; next: () => Promise<Response> }): Promise<Response> => {
  const response = await next();
  if (request.method !== 'GET' && request.method !== 'HEAD') return response;

  const { pathname } = new URL(request.url);
  // React Router matches case-insensitively, so /Terms is a real page and must not be turned into a 404.
  const path = (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname).toLowerCase();
  if (EXACT_ROUTES.has(path) || ROUTE_PREFIXES.some(prefix => path.startsWith(prefix))) return response;
  if (/\.[a-z0-9]+$/i.test(path)) return response; // real files: assets, images, robots.txt, sitemap.xml
  if (response.status !== 200) return response; // never re-wrap a 304, redirect or error from the platform
  if (!(response.headers.get('content-type') ?? '').includes('text/html')) return response;

  return new Response(response.body, { status: 404, statusText: 'Not Found', headers: response.headers });
};
