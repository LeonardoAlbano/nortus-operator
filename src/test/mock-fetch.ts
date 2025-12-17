import { vi } from 'vitest';

export type MockFetchRequest = {
  url: string;
  method: string;
  headers: Headers;
  bodyText: string | null;
  bodyJson: unknown | null;
};

export type MockFetchResponse = {
  status?: number;
  json?: unknown;
  text?: string;
  headers?: Record<string, string>;
};

type Match = string | RegExp | ((req: MockFetchRequest) => boolean);

type Route = {
  method?: string;
  match: Match;
  handler: (req: MockFetchRequest) => MockFetchResponse | Promise<MockFetchResponse>;
};

const routes: Route[] = [];

export function resetMockFetch() {
  routes.splice(0);
}

export function mockFetchRoute(route: Route) {
  routes.push(route);
}

function normalizeUrl(input: RequestInfo | URL): { raw: string; normalized: string } {
  const raw =
    typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  const u = new URL(raw, 'http://localhost');
  return { raw, normalized: `${u.pathname}${u.search}` };
}

function readMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof input !== 'string' && !(input instanceof URL)) return input.method.toUpperCase();
  return 'GET';
}

function matchRoute(route: Route, req: MockFetchRequest): boolean {
  if (route.method && route.method.toUpperCase() !== req.method) return false;

  if (typeof route.match === 'string') {
    return req.url === route.match;
  }

  if (route.match instanceof RegExp) {
    return route.match.test(req.url);
  }

  return route.match(req);
}

function toResponse(res: MockFetchResponse): Response {
  const status = res.status ?? 200;
  const headers = new Headers(res.headers);

  if (typeof res.json !== 'undefined') {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return new Response(JSON.stringify(res.json), { status, headers });
  }

  const text = res.text ?? '';
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'text/plain');
  return new Response(text, { status, headers });
}

export function installMockFetch() {
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const { normalized } = normalizeUrl(input);
    const method = readMethod(input, init);

    const headers = new Headers(init?.headers);
    const bodyText = typeof init?.body === 'string' ? init.body : null;

    let bodyJson: unknown | null = null;
    if (bodyText) {
      try {
        bodyJson = JSON.parse(bodyText) as unknown;
      } catch {
        bodyJson = null;
      }
    }

    const req: MockFetchRequest = { url: normalized, method, headers, bodyText, bodyJson };

    for (let i = routes.length - 1; i >= 0; i--) {
      const route = routes[i];
      if (matchRoute(route, req)) {
        const out = await route.handler(req);
        return toResponse(out);
      }
    }

    throw new Error(`Unhandled fetch: ${method} ${normalized}`);
  });

  vi.stubGlobal('fetch', fn);
}
