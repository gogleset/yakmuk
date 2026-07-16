import type {
  ConditionValue,
  DailyLog,
  Medication,
} from '@/entities/medication/model/types';

export function mapMedication(row: Record<string, unknown>): Medication {
  return {
    id: Number(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    scheduledTime: String(row.scheduled_time).slice(0, 5),
    daysMask: String(row.days_mask),
    createdAt: String(row.created_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
  };
}

export function mapDailyLog(row: Record<string, unknown>): DailyLog {
  const users = row.users as { nickname?: string } | null | undefined;
  const medications = row.medications as { name?: string } | null | undefined;
  return {
    id: Number(row.id),
    medicationId: row.medication_id == null ? null : Number(row.medication_id),
    userId: String(row.user_id),
    logDate: String(row.log_date),
    status: (row.status as DailyLog['status']) ?? null,
    condition: (row.condition as ConditionValue) ?? null,
    message: row.message ? String(row.message) : null,
    familyId: String(row.family_id),
    createdAt: String(row.created_at),
    nickname: users?.nickname ?? null,
    medicationName: medications?.name ?? null,
  };
}
