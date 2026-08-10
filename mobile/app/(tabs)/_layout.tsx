import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/providers/AuthProvider";
import { ROUTES } from "@/shared/config/routes";
import { COLORS, NAV } from "@/shared/config/theme";
import { Icons, ScreenLoading } from "@/shared/ui";

export default function AppTabsLayout() {
  const { loading, profile } = useAuth();
  const insets = useSafeAreaInsets();

  console.log("[auth-debug] tabs gate", {
    loading,
    familyId: profile?.familyId ?? null,
    role: profile?.role ?? null,
    userId: profile?.id ?? null,
  });
  if (loading) return <ScreenLoading />;
  if (!profile?.familyId) {
    console.warn("[auth-debug] tabs → Redirect welcome (no familyId)");
    return <Redirect href={ROUTES.welcome} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.brand,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        sceneStyle: { backgroundColor: COLORS.canvas },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: NAV.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: NAV.tabBarPaddingTop,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "기록",
          tabBarIcon: ({ color, size }) => (
            <Icons.Pill color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: "가족",
          tabBarIcon: ({ color, size }) => (
            <Icons.Users color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color, size }) => (
            <Icons.Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
