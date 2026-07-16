import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Medication } from '@/entities/medication/model/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** 알림 권한 요청 — 거절 시 false */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const asked = await Notifications.requestPermissionsAsync();
  if (!asked.granted) return false;

  // Android 채널
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication', {
      name: '복약 알림',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return true;
}

function parseHourMinute(scheduledTime: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(scheduledTime.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/** 피보호자 스케줄 기준 로컬 알림 재등록 */
export async function syncMedicationNotifications(
  medications: Medication[],
  takenIds: Set<number>,
): Promise<void> {
  const ok = await ensureNotificationPermission();
  if (!ok) return;

  // 기존 스케줄 전부 취소 후 재등록 (단순·안전)
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const med of medications) {
    if (takenIds.has(med.id)) continue;

    const hm = parseHourMinute(med.scheduledTime);
    if (!hm) {
      console.warn('[notif] bad time', med.scheduledTime);
      continue;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '약 먹을 시간이에요',
          body: `${med.name} · ${med.scheduledTime}`,
          data: { medicationId: med.id },
          ...(Platform.OS === 'android' ? { channelId: 'medication' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hm.hour,
          minute: hm.minute,
        },
      });
    } catch (e) {
      console.error('[notif] schedule', med.id, e);
    }
  }
}
