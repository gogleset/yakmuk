import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInvite } from '@/entities/user/api/create-invite';
import { deleteInvite } from '@/entities/user/api/delete-invite';
import { reissueInviteCode } from '@/entities/user/api/reissue-invite';
import { invalidateFamilyInvites } from '@/entities/user/model/queries';
import type { InviteTargetRole } from '@/entities/user/model/types';
import { invalidateFamilyActivity } from '@/entities/family/model/queries';
import { showMutationError } from '@/shared/lib/mutation';
import { ERRORS } from '@/shared/copy';

export const familyInviteKeys = {
  all: ['family-invite'] as const,
  create: () => [...familyInviteKeys.all, 'create'] as const,
  delete: () => [...familyInviteKeys.all, 'delete'] as const,
  reissue: () => [...familyInviteKeys.all, 'reissue'] as const,
};

/** 가족장 초대 use case */
export function useFamilyInviteMutations() {
  const qc = useQueryClient();

  const createInviteMutation = useMutation({
    mutationKey: familyInviteKeys.create(),
    mutationFn: ({
      invitedAs,
      targetRole,
    }: {
      invitedAs: string;
      targetRole: InviteTargetRole;
    }) => createInvite(invitedAs, targetRole),
    onSuccess: async () => {
      await invalidateFamilyInvites(qc);
      await invalidateFamilyActivity(qc);
    },
    onError: (error) => showMutationError(ERRORS.invite.createFailed, error),
  });

  const deleteInviteMutation = useMutation({
    mutationKey: familyInviteKeys.delete(),
    mutationFn: (inviteId: string) => deleteInvite(inviteId),
    onSuccess: async () => {
      await invalidateFamilyInvites(qc);
      await invalidateFamilyActivity(qc);
    },
    onError: (error) => showMutationError(ERRORS.invite.deleteFailed, error),
  });

  const reissueInviteMutation = useMutation({
    mutationKey: familyInviteKeys.reissue(),
    mutationFn: (inviteId: string) => reissueInviteCode(inviteId),
    onSuccess: async () => {
      await invalidateFamilyInvites(qc);
    },
    onError: (error) => showMutationError(ERRORS.invite.reissueFailed, error),
  });

  return {
    createInvite: createInviteMutation,
    deleteInvite: deleteInviteMutation,
    reissueInvite: reissueInviteMutation,
  };
}
