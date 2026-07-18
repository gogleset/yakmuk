import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/shared/config/routes';

export default function Index() {
  const { loading, profile, sessionUserId } = useAuth();

  console.log('[auth-debug] index gate', {
    loading,
    sessionUserId,
    familyId: profile?.familyId ?? null,
  });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator />
      </View>
    );
  }

  if (!sessionUserId || !profile?.familyId) {
    console.warn('[auth-debug] index → welcome');
    return <Redirect href={ROUTES.welcome} />;
  }

  console.log('[auth-debug] index → home');
  return <Redirect href={ROUTES.home} />;
}
