import type { AppUser, CareInvite } from '@/entities/user/model/types';

export function mapUser(row: Record<string, unknown>): AppUser {
  return {
    id: String(row.id),
    nickname: String(row.nickname),
    role: row.role as AppUser['role'],
    familyId: row.family_id ? String(row.family_id) : null,
    expoPushToken: row.expo_push_token ? String(row.expo_push_token) : null,
  };
}

export function mapCareInvite(row: Record<string, unknown>): CareInvite {
  return {
    id: String(row.id),
    familyId: String(row.family_id),
    inviteCode: String(row.invite_code),
    nickname: String(row.nickname),
    claimedBy: row.claimed_by ? String(row.claimed_by) : null,
    claimedAt: row.claimed_at ? String(row.claimed_at) : null,
  };
}
