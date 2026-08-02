import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/shared/config/routes';
import { getStartTab, startTabHref, type StartTabHref } from '@/shared/lib/startTab';

export default function Index() {
  const { loading, profile, sessionUserId } = useAuth();
  const [startHref, setStartHref] = useState<StartTabHref | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getStartTab().then((tab) => {
      if (!cancelled) setStartHref(startTabHref(tab));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // auth · 첫 화면 pref 둘 다 준비될 때까지 스피너 (깜빡임 방지)
  if (loading || startHref == null) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator />
      </View>
    );
  }

  if (!sessionUserId || !profile?.familyId) {
    return <Redirect href={ROUTES.welcome} />;
  }

  return <Redirect href={startHref} />;
}
