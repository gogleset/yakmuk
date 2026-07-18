import Constants from 'expo-constants';

const TAG = '[api]';
const MAX_BODY_CHARS = 4_000;
const SENSITIVE_HEADER =
  /^(authorization|apikey|x-api-key|cookie|set-cookie)$/i;
const SENSITIVE_JSON_KEY =
  /password|token|secret|authorization|refresh_token|access_token|apikey/i;

export type ApiLogPhase = 'request' | 'response' | 'error';

export type ApiLogEntry = {
  ts: string;
  phase: ApiLogPhase;
  id: string;
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
  headers?: Record<string, string>;
  body?: unknown;
  error?: string;
};

let started = false;
let fileSinkWarned = false;

type ExpoHostConstants = {
  expoConfig?: { hostUri?: string | null };
  manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
  manifest?: { debuggerHost?: string };
};

/** Metro debuggerHost → 호스트 머신 로그 싱크 origin */
function getMetroOrigin(): string | null {
  const c = Constants as ExpoHostConstants;
  const hostUri =
    c.expoConfig?.hostUri ??
    c.manifest2?.extra?.expoGo?.debuggerHost ??
    c.manifest?.debuggerHost ??
    null;
  if (!hostUri) return null;
  return (hostUri.includes('://') ? hostUri : `http://${hostUri}`).replace(
    /\/$/,
    '',
  );
}

function redactHeaders(
  headers: HeadersInit | undefined,
): Record<string, string> | undefined {
  if (!headers) return undefined;
  const out: Record<string, string> = {};
  const entries =
    headers instanceof Headers
      ? [...headers.entries()]
      : Array.isArray(headers)
        ? headers
        : Object.entries(headers);
  for (const [key, value] of entries) {
    out[key] = SENSITIVE_HEADER.test(key) ? '[redacted]' : String(value);
  }
  return out;
}

function redactValue(value: unknown): unknown {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(redactValue);
  if (typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SENSITIVE_JSON_KEY.test(k) ? '[redacted]' : redactValue(v);
  }
  return out;
}

function truncate(text: string): string {
  if (text.length <= MAX_BODY_CHARS) return text;
  return `${text.slice(0, MAX_BODY_CHARS)}…(+${text.length - MAX_BODY_CHARS})`;
}

/** body 문자열/JSON 파싱 후 민감키 마스킹 */
export function sanitizeBody(raw: unknown): unknown {
  if (raw == null || raw === '') return undefined;
  if (typeof raw !== 'string') {
    try {
      return redactValue(JSON.parse(JSON.stringify(raw)));
    } catch {
      return String(raw);
    }
  }
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  try {
    return redactValue(JSON.parse(trimmed));
  } catch {
    return truncate(trimmed);
  }
}

function consoleLine(entry: ApiLogEntry): void {
  const base = `${TAG} ${entry.phase} ${entry.method} ${entry.url}`;
  if (entry.phase === 'request') {
    console.log(base, {
      id: entry.id,
      headers: entry.headers,
      body: entry.body,
    });
    return;
  }
  if (entry.phase === 'error') {
    console.warn(base, {
      id: entry.id,
      durationMs: entry.durationMs,
      error: entry.error,
    });
    return;
  }
  const payload = {
    id: entry.id,
    status: entry.status,
    durationMs: entry.durationMs,
    body: entry.body,
  };
  if ((entry.status ?? 0) < 400) console.log(base, payload);
  else console.warn(base, payload);
}

/** Metro enhanceMiddleware → mobile/logs/api.log */
async function appendToHostFile(line: string): Promise<void> {
  if (!__DEV__) return;
  const origin = getMetroOrigin();
  if (!origin) {
    if (!fileSinkWarned) {
      fileSinkWarned = true;
      console.warn(`${TAG} Metro host 없음 — 파일 싱크 스킵 (콘솔만)`);
    }
    return;
  }
  try {
    await fetch(`${origin}/__yakmuk_api_log`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: line,
    });
  } catch (e) {
    if (!fileSinkWarned) {
      fileSinkWarned = true;
      console.warn(`${TAG} 파일 싱크 실패`, e);
    }
  }
}

export function startApiLogger(): void {
  if (started || !__DEV__) return;
  started = true;
  const origin = getMetroOrigin();
  console.log(
    `${TAG} enabled → console + mobile/logs/api.log`,
    origin ? `(sink ${origin})` : '(no metro host)',
  );
}

export function logApi(entry: ApiLogEntry): void {
  if (!__DEV__) return;
  startApiLogger();
  const line = JSON.stringify(entry);
  consoleLine(entry);
  void appendToHostFile(line);
}

export function newRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function redactRequestHeaders(
  headers: HeadersInit | undefined,
): Record<string, string> | undefined {
  return redactHeaders(headers);
}
