import { supabase } from '@/shared/api/client';

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
