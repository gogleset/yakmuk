import type { ConditionValue } from '@/entities/medication/model/types';
import type { UserRole } from '@/entities/user/model/types';

export type FamilyAlertKind = 'bad_condition' | 'stuck_escalate';

export type FamilyAlert = {
  id: string;
  familyId: string;
  userId: string;
  kind: FamilyAlertKind;
  message: string;
  payload: Record<string, unknown>;
  createdAt: string;
  ackedAt: string | null;
  nickname?: string | null;
};

/** 가족 멤버 (프로필·캘린더 조회용) */
export type FamilyMember = {
  userId: string;
  nickname: string;
  invitedAs: string | null;
  role: UserRole;
};

export type CareRecipientTodayStatus = {
  userId: string;
  nickname: string;
  invitedAs: string | null;
  role: UserRole;
  totalMeds: number;
  takenCount: number;
  pendingCount: number;
  condition: ConditionValue | null;
  conditionMessage: string | null;
  hasUnackedAlert: boolean;
};

/** 보호자별 최근 소식 일자 읽음 */
export type FamilyFeedDayRead = {
  familyId: string;
  userId: string;
  logDate: string;
  readAt: string;
};
