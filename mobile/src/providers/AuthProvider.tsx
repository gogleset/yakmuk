import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/shared/api/client";
import type { AppUser } from "@/entities/user/model/types";
import { getProfile } from "@/entities/user/api/get-profile";
import { signOut } from "@/entities/user/api/sign-out";
import { ROUTES } from "@/shared/config/routes";
import { COPY } from "@/shared/copy";

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
  const forceSignOutBusy = useRef(false);

  /** 리더 초대 재발급 등으로 force_sign_out_at 설정 시 안내 후 로그아웃 */
  const handleForceSignOut = useCallback(async (fromProfile: AppUser) => {
    if (!fromProfile.forceSignOutAt) return;
    if (forceSignOutBusy.current) return;
    forceSignOutBusy.current = true;
    try {
      await new Promise<void>((resolve) => {
        Alert.alert(
          COPY.auth.forceSignOutTitle,
          COPY.auth.forceSignOutBody,
          [{ text: "확인", onPress: () => resolve() }],
          { cancelable: false },
        );
      });
      await signOut();
      setSessionUserId(null);
      setIsAnonymous(false);
      setProfile(null);
      router.replace(ROUTES.welcome);
    } catch (e) {
      console.warn("[auth] forceSignOut failed", e);
    } finally {
      forceSignOutBusy.current = false;
    }
  }, []);

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
      const nextProfile = await getProfile();
      console.log(`${tag} got`, {
        userId,
        isAnonymous: !!user?.is_anonymous,
        familyId: nextProfile?.familyId ?? null,
        role: nextProfile?.role ?? null,
        nickname: nextProfile?.nickname ?? null,
        forceSignOutAt: nextProfile?.forceSignOutAt ?? null,
      });

      // db reset 등으로 auth.users가 사라진 stale 세션 정리
      if (!nextProfile) {
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

      setProfile(nextProfile);
      console.log(`${tag} done setProfile`, nextProfile?.familyId ?? null);

      if (nextProfile?.forceSignOutAt) {
        await handleForceSignOut(nextProfile);
      }
    } catch (e) {
      console.error(`${tag} error`, e);
      setProfile(null);
    }
  }, [handleForceSignOut]);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      await refreshProfile();
      if (!mounted) return;
      setLoading(false);
      console.log("[auth-debug] initial loading=false");
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[auth-debug] onAuthStateChange", {
        event,
        userId: session?.user?.id ?? null,
        isAnonymous: !!session?.user?.is_anonymous,
      });
      if (session?.user?.id) {
        void refreshProfile();
      } else {
        console.log("[auth-debug] session cleared");
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

  // 본인 users 행 Realtime — 초대 재발급 즉시 킥
  useEffect(() => {
    if (!sessionUserId) return;

    const channel = supabase
      .channel(`force-sign-out:${sessionUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${sessionUserId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown> | null;
          if (!row?.force_sign_out_at) return;
          void handleForceSignOut({
            id: String(row.id),
            nickname: String(row.nickname ?? ""),
            invitedAs: row.invited_as ? String(row.invited_as) : null,
            role: row.role as AppUser["role"],
            familyId: row.family_id ? String(row.family_id) : null,
            expoPushToken: row.expo_push_token
              ? String(row.expo_push_token)
              : null,
            forceSignOutAt: String(row.force_sign_out_at),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sessionUserId, handleForceSignOut]);

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
