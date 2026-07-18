import {
  logApi,
  newRequestId,
  redactRequestHeaders,
  sanitizeBody,
  startApiLogger,
} from '@/shared/lib/apiLogger';

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function resolveMethod(
  input: RequestInfo | URL,
  init?: RequestInit,
): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof input !== 'string' && !(input instanceof URL) && input.method) {
    return input.method.toUpperCase();
  }
  return 'GET';
}

function resolveHeaders(
  input: RequestInfo | URL,
  init?: RequestInit,
): HeadersInit | undefined {
  if (init?.headers) return init.headers;
  if (typeof input !== 'string' && !(input instanceof URL)) {
    return input.headers;
  }
  return undefined;
}

async function resolveRequestBody(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<unknown> {
  if (init?.body != null) {
    if (typeof init.body === 'string') return sanitizeBody(init.body);
    return sanitizeBody('[non-string body]');
  }
  if (typeof input !== 'string' && !(input instanceof URL)) {
    try {
      const cloned = input.clone();
      const text = await cloned.text();
      return sanitizeBody(text);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/** Supabase / fetchJson 공통 — __DEV__에서만 콘솔 + logs/api.log 기록 */
export async function loggedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  // prod: 오버헤드 없이 native fetch
  if (!__DEV__) return fetch(input, init);

  startApiLogger();

  const id = newRequestId();
  const method = resolveMethod(input, init);
  const url = resolveUrl(input);
  const startedAt = Date.now();

  logApi({
    ts: new Date().toISOString(),
    phase: 'request',
    id,
    method,
    url,
    headers: redactRequestHeaders(resolveHeaders(input, init)),
    body: await resolveRequestBody(input, init),
  });

  try {
    const res = await fetch(input, init);
    let body: unknown;
    try {
      const text = await res.clone().text();
      body = sanitizeBody(text);
    } catch {
      body = undefined;
    }

    logApi({
      ts: new Date().toISOString(),
      phase: 'response',
      id,
      method,
      url,
      status: res.status,
      durationMs: Date.now() - startedAt,
      body,
    });

    return res;
  } catch (e) {
    logApi({
      ts: new Date().toISOString(),
      phase: 'error',
      id,
      method,
      url,
      durationMs: Date.now() - startedAt,
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
}
