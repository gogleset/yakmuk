import { supabase } from '@/shared/api/client';

/** 초대 클레임·멤버 입퇴장 → 자리표/멤버 목록 즉시 갱신 */
export function subscribeFamilyRoster(
  familyId: string,
  onChange: () => void,
): () => void {
  const topic = `roster:${familyId}:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const channel = supabase
    .channel(topic)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'family_invites',
        filter: `family_id=eq.${familyId}`,
      },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `family_id=eq.${familyId}`,
      },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
