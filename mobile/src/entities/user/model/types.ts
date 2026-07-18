export type UserRole = 'family_leader' | 'guardian' | 'care_recipient';

export type InviteTargetRole = 'guardian' | 'care_recipient';

export type AppUser = {
  id: string;
  nickname: string;
  invitedAs: string | null;
  role: UserRole;
  familyId: string | null;
  expoPushToken: string | null;
};

export type FamilyInvite = {
  id: string;
  familyId: string;
  inviteCode: string;
  invitedAs: string;
  targetRole: InviteTargetRole;
  claimedBy: string | null;
  claimedAt: string | null;
};
