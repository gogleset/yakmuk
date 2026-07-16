import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';

export async function signInGuardianOAuth(
  provider: 'google' | 'apple',
): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'yakmuk://auth/callback',
      skipBrowserRedirect: false,
    },
  });
  throwIfError(error);
}
