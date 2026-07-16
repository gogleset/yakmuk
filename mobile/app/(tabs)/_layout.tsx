import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/shared/config/routes';
import { COLORS } from '@/shared/config/theme';
import { Icons } from '@/shared/ui';

export default function AppTabsLayout() {
  const { loading, profile } = useAuth();

  if (loading) return null;
  if (!profile?.familyId) return <Redirect href={ROUTES.welcome} />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.canvas },
        headerTitleStyle: { color: COLORS.brand, fontWeight: '700' },
        tabBarActiveTintColor: COLORS.brand,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.canvas,
          borderTopWidth: 0,
          elevation: 0, // Android 상단 그림자 제거
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <Icons.Pill color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: '가족',
          tabBarIcon: ({ color, size }) => (
            <Icons.Users color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            <Icons.Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
