import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { LIMITS } from '@/shared/constants';
import { ERRORS } from '@/shared/copy';

export type JoinPeekKind = 'invite' | 'recovery';

export type InvitePeek = {
  kind: JoinPeekKind;
  familyName: string;
  invitedAs: string;
  targetRole: 'guardian' | 'care_recipient' | 'family_leader';
  leaderNickname: string;
  /** 복구 시에만 — 기존 닉네임 */
  nickname?: string | null;
  /** 가족 멤버 닉네임 (프리뷰 카드 서브) */
  memberNicknames: string[];
};

function parseMemberNicknames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v.length > 0);
}

/** 조인 전 초대/복구 프리뷰 */
export async function peekFamilyInvite(code: string): Promise<InvitePeek> {
  const trimmed = code.trim().toUpperCase();
  if (trimmed.length !== LIMITS.inviteCodeLength) {
    throw new Error(ERRORS.invite.codeLength);
  }
  const { data, error } = await supabase.rpc('peek_join_code', {
    p_code: trimmed,
  });
  throwIfError(error, ERRORS.invite.peekFailed);
  if (!data || typeof data !== 'object') {
    throw new Error(ERRORS.invite.peekFailed);
  }

  const row = data as Record<string, unknown>;
  return {
    kind: (row.kind as JoinPeekKind) ?? 'invite',
    familyName: String(row.family_name ?? ''),
    invitedAs: String(row.invited_as ?? ''),
    targetRole: row.target_role as InvitePeek['targetRole'],
    leaderNickname: String(row.leader_nickname ?? '가족장'),
    nickname: row.nickname ? String(row.nickname) : null,
    memberNicknames: parseMemberNicknames(row.member_nicknames),
  };
}
