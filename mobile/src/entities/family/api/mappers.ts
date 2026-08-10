import type {
  FamilyAlert,
  FamilyAlertKind,
  FamilyFeedDayRead,
} from '@/entities/family/model/types';

export function mapFamilyAlert(row: Record<string, unknown>): FamilyAlert {
  const users = row.users as { nickname?: string } | null | undefined;
  return {
    id: String(row.id),
    familyId: String(row.family_id),
    userId: String(row.user_id),
    kind: row.kind as FamilyAlertKind,
    message: String(row.message),
    payload: (row.payload as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
    ackedAt: row.acked_at ? String(row.acked_at) : null,
    nickname: users?.nickname ?? null,
  };
}

export function mapFamilyFeedDayRead(
  row: Record<string, unknown>,
): FamilyFeedDayRead {
  return {
    familyId: String(row.family_id),
    userId: String(row.user_id),
    logDate: String(row.log_date).slice(0, 10),
    readAt: String(row.read_at),
  };
}
