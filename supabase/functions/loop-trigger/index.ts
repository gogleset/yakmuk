-- HTTP trigger: POST /functions/v1/loop-trigger
-- body: { "user_id": "...", "date_kst": "YYYY-MM-DD" } (optional date)
-- 서비스 롤로 verify만 수행 (루프 턴은 클라 act와 함께 쌓임). pre 체크리스트용 최소 HTTP 경로.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const userId = body.user_id as string | undefined;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'user_id required' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const dateKst =
      (body.date_kst as string | undefined) ??
      new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

    // HTTP trigger로 running run 오픈 (없으면)
    const { data: existing } = await admin
      .from('runs')
      .select('id')
      .eq('owner_user_id', userId)
      .eq('goal_date', dateKst)
      .eq('status', 'running')
      .maybeSingle();

    let runId = existing?.id as string | undefined;
    if (!runId) {
      const { data: created, error } = await admin
        .from('runs')
        .insert({
          goal: `verify_day:${userId}:${dateKst}`,
          status: 'running',
          trigger: 'http',
          owner_user_id: userId,
          goal_date: dateKst,
          max_iterations: 10,
          max_wall_clock_ms: 86_400_000,
        })
        .select('id')
        .single();
      if (error) throw error;
      runId = created.id;
    }

    return new Response(
      JSON.stringify({ ok: true, run_id: runId, trigger: 'http', date_kst: dateKst }),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
