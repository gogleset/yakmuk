import { supabase } from '@/shared/api/client';

export function subscribeFeed(
  familyId: string,
  onChange: () => void,
): () => void {
  const topic = `feed:${familyId}:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const channel = supabase
    .channel(topic)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'daily_logs',
        filter: `family_id=eq.${familyId}`,
      },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'family_alerts',
        filter: `family_id=eq.${familyId}`,
      },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
