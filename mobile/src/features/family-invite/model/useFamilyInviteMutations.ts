import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFamily } from '@/entities/user/api/create-family';
import { createInvite } from '@/entities/user/api/create-invite';
import { invalidateCareInvites } from '@/entities/user/model/queries';
import { invalidateFamilyActivity } from '@/entities/family/model/queries';
import { showMutationError } from '@/shared/lib/mutation';

export const familyInviteKeys = {
  all: ['family-invite'] as const,
  ensureFamily: () => [...familyInviteKeys.all, 'ensure-family'] as const,
  create: () => [...familyInviteKeys.all, 'create'] as const,
};

type Params = {
  guardianNickname: string;
  refreshProfile: () => Promise<void>;
};

/** 가족 초대 use case */
export function useFamilyInviteMutations({
  guardianNickname,
  refreshProfile,
}: Params) {
  const qc = useQueryClient();

  const ensureFamily = useMutation({
    mutationKey: familyInviteKeys.ensureFamily(),
    mutationFn: async () => {
      await createFamily(guardianNickname);
      await refreshProfile();
    },
    onError: (error) => showMutationError('만들지 못했어요', error),
  });

  const createInviteMutation = useMutation({
    mutationKey: familyInviteKeys.create(),
    mutationFn: (nickname: string) => createInvite(nickname),
    onSuccess: async () => {
      await invalidateCareInvites(qc);
      await invalidateFamilyActivity(qc);
    },
    onError: (error) => showMutationError('초대하지 못했어요', error),
  });

  return { ensureFamily, createInvite: createInviteMutation };
}
