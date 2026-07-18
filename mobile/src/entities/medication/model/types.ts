export type ConditionValue = 'GOOD' | 'NORMAL' | 'BAD';

export type Medication = {
  id: number;
  userId: string;
  name: string;
  scheduledTime: string;
  daysMask: string;
  createdAt: string;
  deletedAt: string | null;
};

export type DailyLog = {
  id: number;
  medicationId: number | null;
  userId: string;
  logDate: string;
  status: 'TAKEN' | 'SKIPPED' | null;
  condition: ConditionValue | null;
  message: string | null;
  familyId: string;
  createdAt: string;
  nickname?: string | null;
  medicationName?: string | null;
};

export type DayMedStatus =
  | 'done'
  | 'partial'
  | 'missed'
  /** 스케줄 있음 · 오늘 미체크 또는 미래 */
  | 'scheduled'
  | 'empty';

export type DrugSearchItem = {
  itemSeq: string;
  itemName: string;
  entpName: string;
  itemImage: string | null;
  efficacy: string | null;
  useMethod: string | null;
  storage: string | null;
  warning: string | null;
};
