export const editMedicationKeys = {
  all: ['edit-medication'] as const,
  update: () => [...editMedicationKeys.all, 'update'] as const,
  replace: () => [...editMedicationKeys.all, 'replace'] as const,
};
