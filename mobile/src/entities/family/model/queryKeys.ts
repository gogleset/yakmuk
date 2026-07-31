export const familyKeys = {
  all: ['family'] as const,
  info: (familyId: string) => [...familyKeys.all, 'info', familyId] as const,
  status: (familyId: string, dateKst: string) =>
    [...familyKeys.all, 'status', familyId, dateKst] as const,
  alerts: (familyId: string) => [...familyKeys.all, 'alerts', familyId] as const,
  feed: (familyId: string, sinceLogDate: string) =>
    [...familyKeys.all, 'feed', familyId, sinceLogDate] as const,
  members: (familyId: string) =>
    [...familyKeys.all, 'members', familyId] as const,
};

export const familyMutationKeys = {
  all: ['family-mutation'] as const,
  ackAlert: () => [...familyMutationKeys.all, 'ack-alert'] as const,
  updateName: () => [...familyMutationKeys.all, 'update-name'] as const,
  removeMember: () => [...familyMutationKeys.all, 'remove-member'] as const,
  deleteFamily: () => [...familyMutationKeys.all, 'delete-family'] as const,
};
