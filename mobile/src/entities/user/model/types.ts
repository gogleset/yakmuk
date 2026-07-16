export type UserRole = 'guardian' | 'care_recipient';

export type AppUser = {
  id: string;
  nickname: string;
  role: UserRole;
  familyId: string | null;
  expoPushToken: string | null;
};

export type CareInvite = {
  id: string;
  familyId: string;
  inviteCode: string;
  nickname: string;
  claimedBy: string | null;
  claimedAt: string | null;
};
