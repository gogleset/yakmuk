import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapUser } from '@/entities/user/api/mappers';
import type { AppUser } from '@/entities/user/model/types';

export async function getProfile(): Promise<AppUser | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  throwIfError(error);
  return data ? mapUser(data) : null;
}
