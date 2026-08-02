/**
 * Expo Router entry 래퍼 — Notifee onBackgroundEvent는 React보다 먼저 등록.
 * (잠금/백그라운드 FSI 시 handler 없으면 WARN만 나고 라우팅 누락)
 *
 * Metro는 index.ts를 index.js보다 우선하므로 entry는 여기로 둔다.
 */
import { LogBox, Platform } from 'react-native';

// expo-router Android: getInitialURL Promise.then → setLastUnhandledLink
// LogBox만으론 Metro HMR 콘솔에 그대로 찍혀서 console.error도 필터.
const EXPO_ROUTER_MOUNT_WARN =
  "Can't perform a React state update on a component that hasn't mounted yet";
LogBox.ignoreLogs([EXPO_ROUTER_MOUNT_WARN]);
const prevConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const first = args[0];
  const msg =
    typeof first === 'string'
      ? first
      : first instanceof Error
        ? first.message
        : String(first);
  if (msg.includes(EXPO_ROUTER_MOUNT_WARN)) return;
  prevConsoleError(...args);
};

if (Platform.OS === 'android') {
  // sync require — dynamic import면 등록이 늦음
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./src/features/medication-notifications/registerNotifeeBackground').registerNotifeeBackgroundHandler();
}

import 'expo-router/entry';
