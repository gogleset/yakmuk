import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';

/** 개발용: 이메일/비번으로 보호자 세션 */
export async function signInGuardianDev(
  email: string,
  password: string,
): Promise<void> {
  await supabase.auth.signUp({ email, password });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  throwIfError(error);
}
