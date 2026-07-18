export const dailyMedicationCheckKeys = {
  all: ['daily-medication-check'] as const,
  toggle: () => [...dailyMedicationCheckKeys.all, 'toggle'] as const,
  remove: () => [...dailyMedicationCheckKeys.all, 'remove'] as const,
  markAll: () => [...dailyMedicationCheckKeys.all, 'mark-all'] as const,
};
