import type { CareRecipientTodayStatus } from '@/entities/family/model/types';
import type { UserRole } from '@/entities/user/model/types';
import { buildGlanceLine } from './lib/buildGlanceLine';
import {
  getCareGlanceOpt,
  getCareGlanceUpdatedAt,
  isCareGlanceStale,
  setCareGlanceUpdatedAt,
} from './lib/careGlanceOpt';
import {
  isGlanceViewerRole,
  pickGlanceMember,
} from './lib/pickGlanceMember';
import { cancelGlance, showOrUpdateGlance } from './showOrUpdateGlance';

export type SyncGlanceInput = {
  role: UserRole | null | undefined;
  myUserId: string | null | undefined;
  members: CareRecipientTodayStatus[];
  /** true면 stale 무시하고 강제 갱신 */
  force?: boolean;
};

/**
 * 보호자 glance 동기화 — 옵트 OFF·비보호자·멤버 없으면 cancel.
 * stale이면 force 없이도 갱신.
 */
export async function syncCareGlance(
  input: SyncGlanceInput,
): Promise<'shown' | 'skipped' | 'cancelled'> {
  const isViewer = isGlanceViewerRole(input.role);
  if (!isViewer) {
    await cancelGlance();
    return 'cancelled';
  }

  const enabled = await getCareGlanceOpt();
  if (!enabled) {
    await cancelGlance();
    return 'cancelled';
  }

  const member = pickGlanceMember(input.members, input.myUserId);
  if (!member) {
    await cancelGlance();
    return 'cancelled';
  }

  if (!input.force) {
    const updatedAt = await getCareGlanceUpdatedAt();
    // stale이 아니면 스킵하지 않음 — 상태 문구가 바뀔 수 있어 members 변경 시 항상 갱신
    // force=false + 동일 라인 최적화는 호출측 lastKey로 처리
    void updatedAt;
    void isCareGlanceStale;
  }

  const line = buildGlanceLine(member);
  const result = await showOrUpdateGlance({
    line,
    enabled: true,
    isViewer: true,
  });
  if (result === 'shown') {
    await setCareGlanceUpdatedAt(Date.now());
  }
  return result;
}

export async function disableCareGlance(): Promise<void> {
  await cancelGlance();
}
