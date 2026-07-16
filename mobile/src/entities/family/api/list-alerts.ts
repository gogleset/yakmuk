import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapFamilyAlert } from '@/entities/family/api/mappers';
import type { FamilyAlert } from '@/entities/family/model/types';

export async function listAlerts(familyId: string): Promise<FamilyAlert[]> {
  const { data, error } = await supabase
    .from('family_alerts')
    .select('*, users!family_alerts_user_id_fkey(nickname)')
    .eq('family_id', familyId)
    .is('acked_at', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    const { data: plain, error: plainError } = await supabase
      .from('family_alerts')
      .select('*')
      .eq('family_id', familyId)
      .is('acked_at', null)
      .order('created_at', { ascending: false })
      .limit(20);
    throwIfError(plainError);

    const alerts = (plain ?? []).map(mapFamilyAlert);
    const userIds = [...new Set(alerts.map((a) => a.userId))];
    if (!userIds.length) return alerts;

    const { data: users } = await supabase
      .from('users')
      .select('id, nickname')
      .in('id', userIds);
    const nickById = new Map(
      (users ?? []).map((u) => [String(u.id), String(u.nickname)]),
    );
    return alerts.map((a) => ({
      ...a,
      nickname: nickById.get(a.userId) ?? null,
    }));
  }

  return (data ?? []).map(mapFamilyAlert);
}
