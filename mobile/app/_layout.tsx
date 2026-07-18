import { Stack } from 'expo-router';
import { View } from 'react-native';
import { AppProviders } from '@/providers/AppProviders';
import { COLORS, MOTION } from '@/shared/config/theme';
import { SystemChrome } from '@/shared/lib/systemChrome';
import '../global.css';

export default function RootLayout() {
  return (
    <AppProviders>
      <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
        <SystemChrome />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.canvas },
            animation: 'fade',
            animationDuration: MOTION.duration.normal,
          }}
        />
      </View>
    </AppProviders>
  );
}
