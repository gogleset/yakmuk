import { Stack } from 'expo-router';
import { View } from 'react-native';
import { AppProviders } from '@/providers/AppProviders';
import { COLORS, MOTION } from '@/shared/config/theme';
import { SystemChrome } from '@/shared/lib/systemChrome';
import '../global.css';

/** 시트 라우트 — 이전 화면이 보이게, 애니는 BottomSheet가 담당 */
const sheetScreenOptions = {
  presentation: 'transparentModal' as const,
  animation: 'none' as const,
  contentStyle: { backgroundColor: 'transparent' },
  headerShown: false,
};

/** 가족 스택 상세 — 우측 슬라이드 푸시 */
const familyPushOptions = {
  animation: 'slide_from_right' as const,
  animationDuration: MOTION.duration.normal,
};

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
        >
          <Stack.Screen name="add-medication" options={sheetScreenOptions} />
          <Stack.Screen name="edit-medication" options={sheetScreenOptions} />
          <Stack.Screen name="view-medication" options={sheetScreenOptions} />
          <Stack.Screen
            name="family-member/[userId]"
            options={familyPushOptions}
          />
          <Stack.Screen name="family-feed" options={familyPushOptions} />
          <Stack.Screen name="settings-family" options={familyPushOptions} />
        </Stack>
      </View>
    </AppProviders>
  );
}
