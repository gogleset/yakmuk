import type { CarePushKind } from '@/entities/family/api/invoke-care-push';
import { COPY } from '@/shared/copy';

/** 안심 푸시 카피 — 점수·감시 톤 금지 */
export function buildCarePushCopy(
  kind: CarePushKind,
  actorNickname?: string | null,
): { title: string; body: string } {
  const who = actorNickname?.trim() || COPY.family.memberFallback;
  if (kind === 'taken') {
    return {
      title: COPY.push.careTakenTitle,
      body: COPY.push.careTakenBody(who),
    };
  }
  return {
    title: COPY.push.careStuckTitle,
    body: COPY.push.careStuckBody(who),
  };
}
