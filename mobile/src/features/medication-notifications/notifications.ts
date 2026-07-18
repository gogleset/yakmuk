import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { parseDaysMask } from '@/entities/medication/lib/daysMask';
import type { Medication } from '@/entities/medication/model/types';
import { COPY } from '@/shared/copy';

/** Expo Go는 SDK 53+ 에서 notifications 제한 — 정적 import 시 경고/오류 발생 */
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;
let handlerReady = false;

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (isExpoGo) return null;
  if (notificationsModule) return notificationsModule;

  try {
    notificationsModule = await import('expo-notifications');
    if (!handlerReady) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      handlerReady = true;
    }
    return notificationsModule;
  } catch (e) {
    console.warn('[notif] expo-notifications unavailable', e);
    return null;
  }
}

/** 알림 권한 요청 — Expo Go/거절 시 false */
export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const asked = await Notifications.requestPermissionsAsync();
  if (!asked.granted) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication', {
      name: COPY.notif.channel,
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return true;
}

function parseHourMinute(
  scheduledTime: string,
): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(scheduledTime.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/**
 * days_mask mon0 (월=0…일=6) → expo WEEKLY weekday (일=1…토=7)
 */
function mon0ToExpoWeekday(mon0: number): number {
  // getDay: 일=0…토=6 → expo: +1
  const getDay = (mon0 + 1) % 7;
  return getDay + 1;
}

/** 피보호자 스케줄 기준 로컬 알림 재등록 (dev build에서만 동작) */
export async function syncMedicationNotifications(
  medications: Medication[],
  takenIds: Set<number>,
): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  const ok = await ensureNotificationPermission();
  if (!ok) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const med of medications) {
    if (takenIds.has(med.id)) continue;

    const hm = parseHourMinute(med.scheduledTime);
    if (!hm) {
      console.warn('[notif] bad time', med.scheduledTime);
      continue;
    }

    const { mode, days } = parseDaysMask(med.daysMask);
    const content = {
      title: COPY.notif.doseTitle,
      body: COPY.notif.doseBody(med.name, med.scheduledTime),
      data: { medicationId: med.id },
      ...(Platform.OS === 'android' ? { channelId: 'medication' } : {}),
    };

    try {
      if (mode === 'daily' || days.length === 0 || days.length === 7) {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hm.hour,
            minute: hm.minute,
          },
        });
        continue;
      }

      // 요일별: 각 weekday에 WEEKLY 트리거
      for (const day of days) {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: mon0ToExpoWeekday(day),
            hour: hm.hour,
            minute: hm.minute,
          },
        });
      }
    } catch (e) {
      console.error('[notif] schedule', med.id, e);
    }
  }
}
