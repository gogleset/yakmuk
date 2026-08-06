import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { CARE_GLANCE } from '@/shared/constants';
import { COPY } from '@/shared/copy';

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type ShowInput = {
  line: string;
  /** false면 표시하지 않음 */
  enabled: boolean;
  /** 보호자 아니면 cancel만 */
  isViewer: boolean;
};

async function loadNotifee() {
  try {
    const ns = await import('@notifee/react-native');
    const api = ns.default ?? (ns as unknown as typeof ns.default);
    if (!api || typeof api.displayNotification !== 'function') return null;
    return { api, ns };
  } catch {
    return null;
  }
}

async function loadExpoNotifications() {
  if (isExpoGo) return null;
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

/** Android ongoing / iOS 동일 id 교체. 권한·옵트·역할 가드. */
export async function showOrUpdateGlance(input: ShowInput): Promise<'shown' | 'skipped' | 'cancelled'> {
  if (!input.isViewer || !input.enabled) {
    await cancelGlance();
    return 'cancelled';
  }

  const line = input.line.trim();
  if (!line) {
    await cancelGlance();
    return 'skipped';
  }

  if (Platform.OS === 'android') {
    const loaded = await loadNotifee();
    if (!loaded) return 'skipped';
    const { AndroidImportance } = loaded.ns;
    try {
      await loaded.api.createChannel({
        id: CARE_GLANCE.channelId,
        name: COPY.glance.channel,
        importance: AndroidImportance.LOW,
      });
      await loaded.api.displayNotification({
        id: CARE_GLANCE.notificationId,
        title: COPY.glance.title,
        body: line,
        data: { kind: CARE_GLANCE.kind },
        android: {
          channelId: CARE_GLANCE.channelId,
          ongoing: true,
          autoCancel: false,
          pressAction: { id: 'default' },
          importance: AndroidImportance.LOW,
        },
      });
      return 'shown';
    } catch {
      return 'skipped';
    }
  }

  // iOS — 진짜 고정 불가, 같은 identifier로 내용 교체 (OS 제약)
  const Notifications = await loadExpoNotifications();
  if (!Notifications) return 'skipped';
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return 'skipped';

    await Notifications.scheduleNotificationAsync({
      identifier: CARE_GLANCE.notificationId,
      content: {
        title: COPY.glance.title,
        body: line,
        data: { kind: CARE_GLANCE.kind },
        sound: false,
      },
      trigger: null,
    });
    return 'shown';
  } catch {
    return 'skipped';
  }
}

export async function cancelGlance(): Promise<void> {
  if (Platform.OS === 'android') {
    const loaded = await loadNotifee();
    if (!loaded) return;
    try {
      await loaded.api.cancelDisplayedNotifications([
        CARE_GLANCE.notificationId,
      ]);
      await loaded.api.cancelNotification(CARE_GLANCE.notificationId);
    } catch {
      // no-op
    }
    return;
  }

  const Notifications = await loadExpoNotifications();
  if (!Notifications) return;
  try {
    await Notifications.dismissNotificationAsync(CARE_GLANCE.notificationId);
    await Notifications.cancelScheduledNotificationAsync(
      CARE_GLANCE.notificationId,
    );
  } catch {
    // no-op
  }
}
