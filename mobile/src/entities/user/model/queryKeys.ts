export const userKeys = {
  all: ['user'] as const,
  invites: () => [...userKeys.all, 'invites'] as const,
};

export const userMutationKeys = {
  all: ['user-mutation'] as const,
  ensureFamily: () => [...userMutationKeys.all, 'ensure-family'] as const,
  createInvite: () => [...userMutationKeys.all, 'create-invite'] as const,
};
