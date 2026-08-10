import { Stack } from 'expo-router';
import { View } from 'react-native';
import { MedicationNotificationResponseBridge } from '@/features/medication-notifications';
import { AppProviders } from '@/providers/AppProviders';
import { COLORS, MOTION } from '@/shared/config/theme';
import { SystemChrome } from '@/shared/lib/systemChrome';
import '../global.css';

/**
 * 모달/시트 리로드 시 뒤에 깔릴 앵커.
 * 없으면 Stack.Screen 선언 순서상 add-medication이 초기 루트가 되어
 * Expo 리로드마다 약 등록 시트가 먼저 뜬다.
 */
export const unstable_settings = {
  anchor: 'index',
  initialRouteName: 'index',
};

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
      <MedicationNotificationResponseBridge />
      <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
        <SystemChrome />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.canvas },
            // statusBarStyle은 Stack에 넣지 않음 —
            // Expo Go iOS에서 UIViewControllerBasedStatusBarAppearance 경고 배너가 뜸.
            // 스타일은 SystemChrome(expo-status-bar / RN StatusBar)이 담당.
            animation: 'fade',
            animationDuration: MOTION.duration.normal,
          }}
        >
          {/* 앵커 라우트를 시트보다 먼저 선언 */}
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="join" />
          <Stack.Screen name="join-link" />
          <Stack.Screen name="invite-create" />
          <Stack.Screen name="invite-detail" options={familyPushOptions} />
          <Stack.Screen name="add-medication" options={sheetScreenOptions} />
          <Stack.Screen name="edit-medication" options={sheetScreenOptions} />
          <Stack.Screen name="view-medication" options={sheetScreenOptions} />
          <Stack.Screen
            name="medication-alarm"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
              animationDuration: MOTION.duration.normal,
            }}
          />
          <Stack.Screen
            name="family-member/[userId]"
            options={familyPushOptions}
          />
          <Stack.Screen name="family-feed" options={familyPushOptions} />
          <Stack.Screen name="family-manage" options={familyPushOptions} />
        </Stack>
      </View>
    </AppProviders>
  );
}
