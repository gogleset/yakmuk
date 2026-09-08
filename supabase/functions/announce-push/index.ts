// 공지 전용 FCM stub.
// POST /functions/v1/announce-push
// Headers: Authorization: Bearer <service_role> 또는 x-announce-secret: <ANNOUNCE_PUSH_SECRET>
// body: { "title": "...", "body": "...", "user_ids"?: ["uuid", ...] }
// 약 알림 스케줄러 아님. FCM HTTP v1 (`FIREBASE_SERVICE_ACCOUNT`).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fcmConfigured, sendFcmMany } from '../_shared/fcm.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-announce-secret',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function authorize(req: Request): boolean {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const announceSecret = Deno.env.get('ANNOUNCE_PUSH_SECRET') ?? '';
  const auth = req.headers.get('Authorization') ?? '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (serviceKey && bearer === serviceKey) return true;
  const headerSecret = req.headers.get('x-announce-secret') ?? '';
  if (announceSecret && headerSecret === announceSecret) return true;
  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ error: 'POST only' }, 405);
  }

  if (!authorize(req)) {
    return json({ error: 'unauthorized' }, 401);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const title = String(body.title ?? '').trim();
    const message = String(body.body ?? '').trim();
    const userIds = Array.isArray(body.user_ids)
      ? body.user_ids.map(String)
      : null;

    if (!title || !message) {
      return json({ error: 'title and body required' }, 400);
    }

    let query = admin
      .from('users')
      .select('id, push_token')
      .not('push_token', 'is', null);

    if (userIds && userIds.length > 0) {
      query = query.in('id', userIds);
    }

    const { data: rows, error } = await query;
    if (error) {
      return json({ error: error.message }, 500);
    }

    const tokens = (rows ?? [])
      .map((r: { push_token: string | null }) => r.push_token)
      .filter((t: string | null): t is string => !!t && t.length > 0);

    if (tokens.length === 0) {
      return json({ sent: 0, message: 'no tokens' });
    }

    if (!fcmConfigured()) {
      return json({ sent: 0, message: 'fcm not configured' });
    }

    const result = await sendFcmMany(
      tokens,
      title,
      message,
      'announcement',
      { kind: 'announcement' },
    );
    return json(result);
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : String(e) },
      500,
    );
  }
});
