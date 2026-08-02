import { Platform } from 'react-native';
import { notifDebug } from '@/features/medication-notifications/notifDebug';
import { stashPendingAlarmOpen } from '@/features/medication-notifications/pendingAlarmOpen';

let registered = false;

/** Notifee data → 네이티브 Bundle용 문자열 맵 */
function flatAlarmData(
  data: Record<string, unknown> | null | undefined,
): Record<string, string> | null {
  if (!data || typeof data !== 'object') return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v == null) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[k] = String(v);
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * Notifee 백그라운드 이벤트 — entry에서 React보다 먼저 등록 필수.
 * DELIVERED 시 pending stash + 네이티브 FSI 알림/Activity 기동.
 */
export function registerNotifeeBackgroundHandler(): void {
  if (registered || Platform.OS !== 'android') return;
  registered = true;

  try {
    // entry에서 sync require — dynamic import면 등록이 늦어 WARN 재발
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const notifeeModule = require('@notifee/react-native') as typeof import('@notifee/react-native');
    const api = notifeeModule.default ?? notifeeModule;
    const { EventType } = notifeeModule;

    if (!api || typeof api.onBackgroundEvent !== 'function') {
      notifDebug('bg handler skip', { reason: 'no-api' });
      return;
    }

    api.onBackgroundEvent(async ({ type, detail }) => {
      notifDebug('bg event', {
        type,
        id: detail.notification?.id,
        kind: (detail.notification?.data as { kind?: string } | undefined)
          ?.kind,
      });

      const isOpenEvent =
        type === EventType.PRESS ||
        type === EventType.ACTION_PRESS ||
        type === EventType.DELIVERED;

      if (!isOpenEvent) return;

      const data = detail.notification?.data;
      if (data && typeof data === 'object') {
        await stashPendingAlarmOpen(data as Record<string, unknown>);
      }

      // PRESS만 Notifee 알림 취소. DELIVERED에서 취소하면 FSI PendingIntent가 죽을 수 있음.
      if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        const id = detail.notification?.id;
        if (id) {
          void api.cancelDisplayedNotification(id).then(
            () => notifDebug('cancel displayed on press', { id }),
            (e: unknown) =>
              notifDebug('cancel displayed failed', {
                error: e instanceof Error ? e.message : String(e),
              }),
          );
        }
      }

      // DELIVERED에서 launchAlarmUi/startActivity는 API34+ BAL_BLOCK.
      // 강제 기동은 setAlarmClock(Activity PI) + Notifee fullScreenIntent에만 맡김.
      if (type === EventType.DELIVERED) {
        const flat = flatAlarmData(data as Record<string, unknown> | undefined);
        notifDebug('delivered stash-only', {
          reason: 'no-bal-launch',
          keys: flat ? Object.keys(flat) : [],
        });
      }
    });

    notifDebug('bg handler registered');
  } catch (e) {
    notifDebug('bg handler failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
