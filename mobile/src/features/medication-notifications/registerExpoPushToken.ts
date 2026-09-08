import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { updatePushToken } from '@/entities/user/api/update-expo-push-token';

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function pushDebug(event: string, payload?: Record<string, unknown>) {
  if (payload) console.log(`[yakmuk:push] ${event}`, payload);
  else console.log(`[yakmuk:push] ${event}`);
}

function resolveEasProjectId(): string | null {
  const fromEas = Constants.easConfig?.projectId;
  if (typeof fromEas === 'string' && fromEas.length > 0) return fromEas;
  const extra = Constants.expoConfig?.extra as
    | { eas?: { projectId?: string } }
    | undefined;
  const fromExtra = extra?.eas?.projectId;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) return fromExtra;
  return null;
}

/**
 * Expo push token 등록. EAS projectId 없으면 skip (후속).
 * 약 알림과 무관 — 공지 채널용.
 */
export async function registerExpoPushToken(userId: string): Promise<void> {
  if (isExpoGo) {
    pushDebug('skip', { reason: 'expo-go' });
    return;
  }

  const projectId = resolveEasProjectId();
  if (!projectId) {
    pushDebug('skip: no eas projectId');
    return;
  }

  try {
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');

    if (!Device.isDevice) {
      pushDebug('skip', { reason: 'not-physical-device' });
      return;
    }

    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted;
    if (!granted) {
      const asked = await Notifications.requestPermissionsAsync();
      granted = asked.granted;
    }
    if (!granted) {
      pushDebug('skip', { reason: 'permission-denied' });
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('announcement', {
        name: '공지',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
      await Notifications.setNotificationChannelAsync('care-taken', {
        name: '가족 복약 안부',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
      await Notifications.setNotificationChannelAsync('care-stuck', {
        name: '가족 안부 알림',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const tokenResult = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenResult.data;
    if (!token) {
      pushDebug('skip', { reason: 'empty-token' });
      return;
    }

    await updatePushToken(userId, token);
    pushDebug('registered', { tokenPrefix: token.slice(0, 18) });
  } catch (e) {
    pushDebug('register failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

export async function clearExpoPushToken(userId: string): Promise<void> {
  try {
    await updatePushToken(userId, null);
    pushDebug('cleared');
  } catch (e) {
    pushDebug('clear failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
