import { supabase } from '@/shared/api/client';
import type { FamilyAlertKind } from '@/entities/family/model/types';
import { todayKstDateString } from '@/shared/lib/kst';

export async function upsertAlert(input: {
  familyId: string;
  userId: string;
  kind: FamilyAlertKind;
  message: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const since = `${todayKstDateString()}T00:00:00+09:00`;

  const { data: existing, error: findError } = await supabase
    .from('family_alerts')
    .select('id')
    .eq('family_id', input.familyId)
    .eq('user_id', input.userId)
    .eq('kind', input.kind)
    .is('acked_at', null)
    .gte('created_at', since)
    .limit(1)
    .maybeSingle();

  if (findError) {
    console.error('[alert] find', findError.message);
    return;
  }

  if (existing?.id) {
    const { error } = await supabase
      .from('family_alerts')
      .update({
        message: input.message,
        payload: input.payload ?? {},
      })
      .eq('id', existing.id);
    if (error) console.error('[alert] update', error.message);
    return;
  }

  const { error } = await supabase.from('family_alerts').insert({
    family_id: input.familyId,
    user_id: input.userId,
    kind: input.kind,
    message: input.message,
    payload: input.payload ?? {},
  });
  if (error) console.error('[alert] insert', error.message);
}
