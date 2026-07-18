import { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/shared/config/theme';

/** 상태바·내비게이션바·루트 배경을 canvas로 맞춤 (Android edge-to-edge) */
export function SystemChrome() {
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(COLORS.canvas);
    if (Platform.OS === 'android') {
      NavigationBar.setStyle('dark');
    }
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      {Platform.OS === 'android' ? <NavigationBar style="dark" /> : null}
    </>
  );
}
