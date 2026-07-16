export const familyKeys = {
  all: ['family'] as const,
  status: (familyId: string, dateKst: string) =>
    [...familyKeys.all, 'status', familyId, dateKst] as const,
  alerts: (familyId: string) => [...familyKeys.all, 'alerts', familyId] as const,
  feed: (familyId: string) => [...familyKeys.all, 'feed', familyId] as const,
};

export const familyMutationKeys = {
  all: ['family-mutation'] as const,
  ackAlert: () => [...familyMutationKeys.all, 'ack-alert'] as const,
};
