export const conditionLogKeys = {
  all: ['condition-log'] as const,
  submit: () => [...conditionLogKeys.all, 'submit'] as const,
};
