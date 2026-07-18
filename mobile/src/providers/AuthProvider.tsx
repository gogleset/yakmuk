import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/shared/api/client";
import type { AppUser } from "@/entities/user/model/types";
import { getProfile } from "@/entities/user/api/get-profile";

type AuthState = {
  loading: boolean;
  sessionUserId: string | null;
  /** anon 세션 여부 — 강퇴/복구 후 stale 세션 정리용 */
  isAnonymous: boolean;
  profile: AppUser | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [profile, setProfile] = useState<AppUser | null>(null);

  const refreshProfile = useCallback(async () => {
    const tag = `[auth-debug] refresh#${Date.now().toString(36)}`;
    try {
      console.log(`${tag} start`);
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user ?? null;
      const userId = user?.id ?? null;

      if (!userId) {
        console.log(`${tag} no session → clear`);
        setSessionUserId(null);
        setIsAnonymous(false);
        setProfile(null);
        return;
      }

      setSessionUserId(userId);
      setIsAnonymous(!!user?.is_anonymous);
      const profile = await getProfile();
      console.log(`${tag} got`, {
        userId,
        isAnonymous: !!user?.is_anonymous,
        familyId: profile?.familyId ?? null,
        role: profile?.role ?? null,
        nickname: profile?.nickname ?? null,
      });

      // db reset 등으로 auth.users가 사라진 stale 세션 정리
      if (!profile) {
        const { error } = await supabase.auth.getUser();
        if (error) {
          console.warn(`${tag} getUser error → signOut`, error.message);
          await supabase.auth.signOut();
          setSessionUserId(null);
          setIsAnonymous(false);
          setProfile(null);
          return;
        }
        console.log(`${tag} profile null but getUser ok → setProfile(null)`);
      }

      setProfile(profile);
      console.log(`${tag} done setProfile`, profile?.familyId ?? null);
    } catch (e) {
      console.error(`${tag} error`, e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      await refreshProfile();
      if (!mounted) return;
      setLoading(false);
      console.log('[auth-debug] initial loading=false');
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[auth-debug] onAuthStateChange', {
        event,
        userId: session?.user?.id ?? null,
        isAnonymous: !!session?.user?.is_anonymous,
      });
      if (session?.user?.id) {
        void refreshProfile();
      } else {
        console.log('[auth-debug] session cleared');
        setSessionUserId(null);
        setIsAnonymous(false);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const value = useMemo(
    () => ({ loading, sessionUserId, isAnonymous, profile, refreshProfile }),
    [loading, sessionUserId, isAnonymous, profile, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
