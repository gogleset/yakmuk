import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { appScheme } from '@/shared/config/env';

export async function signInGuardianOAuth(
  provider: 'google' | 'apple',
): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${appScheme}://auth/callback`,
      skipBrowserRedirect: false,
    },
  });
  throwIfError(error);
}
