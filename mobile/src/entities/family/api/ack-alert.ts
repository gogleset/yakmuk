import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';

export async function ackAlert(alertId: string): Promise<void> {
  const { error } = await supabase
    .from('family_alerts')
    .update({ acked_at: new Date().toISOString() })
    .eq('id', alertId);
  throwIfError(error);
}
