import { useMutation } from '@tanstack/react-query';
import { joinAsCareRecipient } from '@/entities/user/api/join-care-recipient';
import { showMutationError } from '@/shared/lib/mutation';

export const careRecipientJoinKeys = {
  all: ['care-recipient-join'] as const,
  join: () => [...careRecipientJoinKeys.all, 'join'] as const,
};

export function useCareRecipientJoinMutation() {
  return useMutation({
    mutationKey: careRecipientJoinKeys.join(),
    mutationFn: (inviteCode: string) => joinAsCareRecipient(inviteCode),
    onError: (error) => showMutationError('참여하지 못했어요', error),
  });
}
