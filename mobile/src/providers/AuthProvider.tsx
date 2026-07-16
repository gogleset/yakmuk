import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/shared/api/client';
import type { AppUser } from '@/entities/user/model/types';
import { getProfile } from '@/entities/user/api/get-profile';

type AuthState = {
  loading: boolean;
  sessionUserId: string | null;
  profile: AppUser | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);
    } catch (e) {
      console.error('[auth] profile', e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSessionUserId(data.session?.user?.id ?? null);
      if (data.session?.user?.id) {
        await refreshProfile();
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUserId(session?.user?.id ?? null);
      if (session?.user?.id) {
        void refreshProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const value = useMemo(
    () => ({ loading, sessionUserId, profile, refreshProfile }),
    [loading, sessionUserId, profile, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
