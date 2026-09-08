// FCM HTTP v1. FIREBASE_SERVICE_ACCOUNT = 서비스 계정 JSON.
// 없으면 skip (200). 발송 실패해도 throw 하지 않음.

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

type FcmSendInput = {
  token: string;
  title: string;
  body: string;
  channelId: string;
  data: Record<string, string>;
};

type FcmSendResult = {
  tokenPrefix: string;
  ok: boolean;
  status: number;
  error?: string;
};

let cachedToken: { access: string; expMs: number } | null = null;

function jsonEnv(): ServiceAccount | null {
  let raw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT') ?? '';
  raw = raw.trim();
  if (
    (raw.startsWith("'") && raw.endsWith("'")) ||
    (raw.startsWith('"') && raw.endsWith('"'))
  ) {
    raw = raw.slice(1, -1);
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      return null;
    }
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    return parsed;
  } catch {
    return null;
  }
}

function b64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlText(text: string): string {
  return b64url(new TextEncoder().encode(text));
}

async function importPkcs8(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const raw = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    raw.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function accessToken(sa: ServiceAccount): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expMs - 60_000 > now) {
    return cachedToken.access;
  }
  const iat = Math.floor(now / 1000);
  const header = b64urlText(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64urlText(
    JSON.stringify({
      iss: sa.client_email,
      sub: sa.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat,
      exp: iat + 3600,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
    }),
  );
  const unsigned = `${header}.${payload}`;
  const key = await importPkcs8(sa.private_key);
  const sig = new Uint8Array(
    await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      key,
      new TextEncoder().encode(unsigned),
    ),
  );
  const jwt = `${unsigned}.${b64url(sig)}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const json = await res.json().catch(() => ({}));
  const access = String((json as { access_token?: string }).access_token ?? '');
  if (!res.ok || !access) {
    throw new Error(
      `fcm oauth ${res.status}: ${JSON.stringify(json).slice(0, 200)}`,
    );
  }
  cachedToken = { access, expMs: now + 3_000_000 };
  return access;
}

export function fcmConfigured(): boolean {
  return jsonEnv() !== null;
}

export async function sendFcm(input: FcmSendInput): Promise<FcmSendResult> {
  const prefix = input.token.slice(0, 12);
  const sa = jsonEnv();
  if (!sa) {
    return { tokenPrefix: prefix, ok: false, status: 0, error: 'fcm not configured' };
  }
  try {
    const token = await accessToken(sa);
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: input.token,
            notification: { title: input.title, body: input.body },
            android: {
              priority: 'HIGH',
              notification: {
                channel_id: input.channelId,
                sound: 'default',
              },
            },
            data: input.data,
          },
        }),
      },
    );
    if (res.ok) {
      return { tokenPrefix: prefix, ok: true, status: res.status };
    }
    const errBody = await res.text().catch(() => '');
    return {
      tokenPrefix: prefix,
      ok: false,
      status: res.status,
      error: errBody.slice(0, 300),
    };
  } catch (e) {
    return {
      tokenPrefix: prefix,
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function sendFcmMany(
  tokens: string[],
  title: string,
  body: string,
  channelId: string,
  data: Record<string, string>,
): Promise<{ sent: number; failed: number; results: FcmSendResult[] }> {
  const results: FcmSendResult[] = [];
  for (const token of tokens) {
    results.push(await sendFcm({ token, title, body, channelId, data }));
  }
  return {
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}
