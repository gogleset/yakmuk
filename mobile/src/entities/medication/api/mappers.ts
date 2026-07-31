import { MED_COLOR_DEFAULT } from '@/shared/constants/medColors';
import type {
  ConditionValue,
  DailyLog,
  Medication,
} from '@/entities/medication/model/types';

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function nullableNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapMedication(row: Record<string, unknown>): Medication {
  return {
    id: Number(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    scheduledTime: String(row.scheduled_time).slice(0, 5),
    daysMask: String(row.days_mask),
    createdAt: String(row.created_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
    itemSeq: nullableString(row.item_seq),
    color: nullableString(row.color) ?? MED_COLOR_DEFAULT,
    efficacy: nullableString(row.efficacy),
    useMethod: nullableString(row.use_method),
    storage: nullableString(row.storage),
    warning: nullableString(row.warning),
    doseAmount: nullableNumber(row.dose_amount),
    doseUnit: nullableString(row.dose_unit),
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
