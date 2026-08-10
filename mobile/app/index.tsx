import { useEffect, useState } from 'react';
import { Redirect, useRootNavigationState, type Href } from 'expo-router';
import { notifDebug } from '@/features/medication-notifications/notifDebug';
import { resolveColdStartAlarmHref } from '@/features/medication-notifications/resolveColdStartAlarmHref';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/shared/config/routes';
import { getStartTab, startTabHref, type StartTabHref } from '@/shared/lib/startTab';
import { ScreenLoading } from '@/shared/ui';

export default function Index() {
  const { loading, profile, sessionUserId } = useAuth();
  const navigationState = useRootNavigationState();
  const navReady = !!navigationState?.key;
  const [startHref, setStartHref] = useState<StartTabHref | null>(null);
  // undefined=조회중 · null=없음 · string=알람 모달
  const [alarmHref, setAlarmHref] = useState<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;
    void getStartTab().then((tab) => {
      if (!cancelled) setStartHref(startTabHref(tab));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // auth 끝난 뒤 폴링 — headless stash와 레이스할 시간 확보
  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    void resolveColdStartAlarmHref().then((href) => {
      if (!cancelled) setAlarmHref(href);
    });
    return () => {
      cancelled = true;
    };
  }, [loading]);

  // auth · 첫 화면 pref · cold-start 알람 조회 · 네비 준비까지 대기
  if (loading || startHref == null || alarmHref === undefined || !navReady) {
    return <ScreenLoading />;
  }

  if (!sessionUserId || !profile?.familyId) {
    return <Redirect href={ROUTES.welcome} />;
  }

  // router.push 금지 — 마운트 전 useLinking setState 경고/레이스 유발.
  // Redirect면 NavigationContainer 커밋 이후 트리 안에서만 이동.
  if (alarmHref) {
    notifDebug('index redirect alarm', { href: alarmHref });
    return <Redirect href={alarmHref as Href} />;
  }

  return <Redirect href={startHref} />;
}
