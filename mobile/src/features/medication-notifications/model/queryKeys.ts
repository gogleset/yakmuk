export const medicationAlarmKeys = {
  all: ['medication-alarm'] as const,
  take: () => [...medicationAlarmKeys.all, 'take'] as const,
};
