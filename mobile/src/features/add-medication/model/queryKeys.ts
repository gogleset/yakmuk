export const addMedicationKeys = {
  all: ['add-medication'] as const,
  add: () => [...addMedicationKeys.all, 'add'] as const,
};
