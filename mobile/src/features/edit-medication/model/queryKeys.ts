export const editMedicationKeys = {
  all: ['edit-medication'] as const,
  update: () => [...editMedicationKeys.all, 'update'] as const,
};
