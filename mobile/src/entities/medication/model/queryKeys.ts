export const medicationKeys = {
  all: ['medication'] as const,
  lists: () => [...medicationKeys.all, 'list'] as const,
  list: (userId: string) => [...medicationKeys.lists(), userId] as const,
  calendars: () => [...medicationKeys.all, 'calendar'] as const,
  calendar: (userId: string) => [...medicationKeys.calendars(), userId] as const,
  taken: (userId: string, dateKst: string) =>
    [...medicationKeys.all, 'taken', userId, dateKst] as const,
  logs: (userId: string, yearMonth: string) =>
    [...medicationKeys.all, 'logs', userId, yearMonth] as const,
};

export const medicationMutationKeys = {
  all: ['medication-mutation'] as const,
  toggle: () => [...medicationMutationKeys.all, 'toggle'] as const,
  condition: () => [...medicationMutationKeys.all, 'condition'] as const,
  delete: () => [...medicationMutationKeys.all, 'delete'] as const,
  add: () => [...medicationMutationKeys.all, 'add'] as const,
};
