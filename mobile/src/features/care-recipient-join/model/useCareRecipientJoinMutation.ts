import { useMutation } from '@tanstack/react-query';
import { joinWithInviteCode } from '@/entities/user/api/join-with-invite';
import { showMutationError } from '@/shared/lib/mutation';
import { ERRORS } from '@/shared/copy';

export const careRecipientJoinKeys = {
  all: ['care-recipient-join'] as const,
  join: () => [...careRecipientJoinKeys.all, 'join'] as const,
};

export function useCareRecipientJoinMutation() {
  return useMutation({
    mutationKey: careRecipientJoinKeys.join(),
    mutationFn: ({
      inviteCode,
      nickname,
    }: {
      inviteCode: string;
      nickname?: string;
    }) => joinWithInviteCode(inviteCode, nickname),
    onError: (error) => showMutationError(ERRORS.invite.joinFailed, error),
  });
}
