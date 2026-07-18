import type { AppUser, FamilyInvite } from '@/entities/user/model/types';

export function mapUser(row: Record<string, unknown>): AppUser {
  return {
    id: String(row.id),
    nickname: String(row.nickname),
    invitedAs: row.invited_as ? String(row.invited_as) : null,
    role: row.role as AppUser['role'],
    familyId: row.family_id ? String(row.family_id) : null,
    expoPushToken: row.expo_push_token ? String(row.expo_push_token) : null,
  };
}

export function mapFamilyInvite(row: Record<string, unknown>): FamilyInvite {
  return {
    id: String(row.id),
    familyId: String(row.family_id),
    inviteCode: String(row.invite_code),
    invitedAs: String(row.invited_as),
    targetRole: row.target_role as FamilyInvite['targetRole'],
    claimedBy: row.claimed_by ? String(row.claimed_by) : null,
    claimedAt: row.claimed_at ? String(row.claimed_at) : null,
  };
}
