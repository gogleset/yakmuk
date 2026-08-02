import { supabase } from '@/shared/api/client';

export type CarePushKind = 'taken' | 'stuck_escalate';

export type CarePushInput = {
  kind: CarePushKind;
  familyId: string;
  actorUserId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

/** Edge care-push 호출 — 실패해도 throw 안 함 (체크 기록 우선) */
export async function invokeCarePush(input: CarePushInput): Promise<void> {
  const familyId = input.familyId.trim();
  const actorUserId = input.actorUserId.trim();
  const title = input.title.trim();
  const body = input.body.trim();
  if (!familyId || !actorUserId || !title || !body) {
    console.log('[yakmuk:push] care-push skip', { reason: 'invalid-input' });
    return;
  }

  try {
    const { error } = await supabase.functions.invoke('care-push', {
      body: {
        kind: input.kind,
        family_id: familyId,
        actor_user_id: actorUserId,
        title,
        body,
        data: input.data ?? {},
      },
    });
    if (error) {
      console.log('[yakmuk:push] care-push failed', {
        message: error.message,
      });
      return;
    }
    console.log('[yakmuk:push] care-push ok', { kind: input.kind });
  } catch (e) {
    console.log('[yakmuk:push] care-push failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
