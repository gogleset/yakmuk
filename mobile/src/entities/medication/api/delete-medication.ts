import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';

export async function deleteMedication(medicationId: number): Promise<void> {
  const { error } = await supabase
    .from('medications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', medicationId)
    .is('deleted_at', null);
  throwIfError(error);
}
