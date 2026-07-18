export const userKeys = {
  all: ['user'] as const,
  invites: () => [...userKeys.all, 'invites'] as const,
  recoveryCodes: () => [...userKeys.all, 'recovery-codes'] as const,
};

export const userMutationKeys = {
  all: ['user-mutation'] as const,
  createInvite: () => [...userMutationKeys.all, 'create-invite'] as const,
  reissueRecovery: () => [...userMutationKeys.all, 'reissue-recovery'] as const,
};
