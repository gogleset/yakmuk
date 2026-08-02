// 가족 안심 푸시 — taken / stuck_escalate
// POST /functions/v1/care-push
// Authorization: Bearer <user JWT>
// body: { kind, family_id, actor_user_id, title, body, data? }
// 약 스케줄 발송 아님 · announce-push와 분리.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

type CareKind = 'taken' | 'stuck_escalate';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function isCareKind(v: unknown): v is CareKind {
  return v === 'taken' || v === 'stuck_escalate';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ error: 'POST only' }, 405);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'unauthorized' }, 401);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return json({ error: 'unauthorized' }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const kind = body.kind;
    const familyId = String(body.family_id ?? '').trim();
    const actorUserId = String(body.actor_user_id ?? '').trim();
    const title = String(body.title ?? '').trim();
    const message = String(body.body ?? '').trim();
    const data =
      body.data && typeof body.data === 'object' && !Array.isArray(body.data)
        ? (body.data as Record<string, unknown>)
        : {};

    if (!isCareKind(kind) || !familyId || !actorUserId || !title || !message) {
      return json(
        {
          error:
            'kind, family_id, actor_user_id, title, body required',
        },
        400,
      );
    }

    // 호출자 = 행위자 · 같은 가족인지 확인
    if (actorUserId !== user.id) {
      return json({ error: 'actor mismatch' }, 403);
    }

    const { data: actorRow, error: actorErr } = await admin
      .from('users')
      .select('id, family_id')
      .eq('id', user.id)
      .maybeSingle();

    if (actorErr) {
      return json({ error: actorErr.message }, 500);
    }
    if (!actorRow?.family_id || actorRow.family_id !== familyId) {
      return json({ error: 'forbidden family' }, 403);
    }

    const { data: rows, error: tokenErr } = await admin
      .from('users')
      .select('id, expo_push_token')
      .eq('family_id', familyId)
      .neq('id', actorUserId)
      .not('expo_push_token', 'is', null);

    if (tokenErr) {
      return json({ error: tokenErr.message }, 500);
    }

    const tokens = (rows ?? [])
      .map((r: { expo_push_token: string | null }) => r.expo_push_token)
      .filter((t: string | null): t is string => !!t && t.length > 0);

    if (tokens.length === 0) {
      return json({ sent: 0, message: 'no tokens' });
    }

    const channelId =
      kind === 'stuck_escalate' ? 'care-stuck' : 'care-taken';

    const messages = tokens.map((to: string) => ({
      to,
      title,
      body: message,
      sound: 'default',
      channelId,
      data: { kind, family_id: familyId, ...data },
    }));

    const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const pushJson = await pushRes.json().catch(() => null);
    return json({
      sent: tokens.length,
      expoStatus: pushRes.status,
      expo: pushJson,
    });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : String(e) },
      500,
    );
  }
});
