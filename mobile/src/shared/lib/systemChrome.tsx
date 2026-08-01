import { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { COLORS } from '@/shared/config/theme';

/**
 * 시스템 크롬 맞춤.
 * Android/Expo Go: content가 statusBar 아래부터 그려지고
 * `android:id/statusBarBackground` 가 검정으로 남는 경우가 있음.
 * → RN StatusBar로 배경색을 canvas로 강제.
 */
export function SystemChrome() {
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(COLORS.canvas);

    if (Platform.OS !== 'android') return;

    RNStatusBar.setBarStyle('dark-content');
    // edge-to-edge면 no-op — 그래도 Expo Go(API34) non-edge 레이아웃에선 먹힘
    RNStatusBar.setBackgroundColor(COLORS.canvas);
    RNStatusBar.setTranslucent(false);
    NavigationBar.setStyle('dark');
  }, []);

  if (Platform.OS === 'android') {
    return (
      <>
        <RNStatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.canvas}
          translucent={false}
        />
        <NavigationBar style="dark" />
      </>
    );
  }

  return <ExpoStatusBar style="dark" />;
}
