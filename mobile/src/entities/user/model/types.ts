export type UserRole = 'family_leader' | 'guardian' | 'care_recipient';

export type InviteTargetRole = 'guardian' | 'care_recipient';

export type AppUser = {
  id: string;
  nickname: string;
  invitedAs: string | null;
  role: UserRole;
  familyId: string | null;
  expoPushToken: string | null;
  /** 리더 초대 재발급 등 — 설정 시 안내 후 강제 로그아웃 */
  forceSignOutAt: string | null;
};

export type FamilyInvite = {
  id: string;
  familyId: string;
  inviteCode: string;
  invitedAs: string;
  targetRole: InviteTargetRole;
  claimedBy: string | null;
  claimedAt: string | null;
  /** 재입장 대기 대상 user id (claimed 재발급 후) */
  reentryUserId: string | null;
};
