import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ackAlert } from '@/entities/family/api/ack-alert';
import { invalidateFamilyActivity } from '@/entities/family/model/queries';
import { ERRORS } from '@/shared/copy';
import { showExceptionToast } from '@/shared/lib/mutation';

export const ackFamilyAlertKeys = {
  all: ['ack-family-alert'] as const,
  ack: () => [...ackFamilyAlertKeys.all, 'ack'] as const,
};

export function useAckFamilyAlertMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ackFamilyAlertKeys.ack(),
    mutationFn: ackAlert,
    onSuccess: () => void invalidateFamilyActivity(qc),
    onError: (error) => showExceptionToast(error, ERRORS.family.ackFailed),
  });
}
