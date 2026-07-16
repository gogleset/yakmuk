import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/shared/config/routes';

export default function Index() {
  const { loading, profile, sessionUserId } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator />
      </View>
    );
  }

  if (!sessionUserId || !profile?.familyId) {
    return <Redirect href={ROUTES.welcome} />;
  }

  return <Redirect href={ROUTES.home} />;
}
