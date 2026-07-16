import type { ConditionValue } from '@/entities/medication/model/types';

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

export type CareRecipientTodayStatus = {
  userId: string;
  nickname: string;
  totalMeds: number;
  takenCount: number;
  pendingCount: number;
  condition: ConditionValue | null;
  conditionMessage: string | null;
  hasUnackedAlert: boolean;
};
