import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteFamily,
  getFamily,
  removeFamilyMember,
  updateFamilyName,
} from '@/entities/family/api/family-ops';
import { familyKeys, familyMutationKeys } from '@/entities/family/model/queryKeys';
import { invalidateFamilyActivity } from '@/entities/family/model/queries';
import {
  listActiveRecoveryCodes,
  reissueMemberRecoveryCode,
} from '@/entities/user/api/member-recovery';
import { updateMyNickname } from '@/entities/user/api/update-my-nickname';
import { userKeys } from '@/entities/user/model/queryKeys';
import { showMutationError } from '@/shared/lib/mutation';
import { ERRORS } from '@/shared/copy';

export function useFamilyInfoQuery(familyId: string | null | undefined) {
  return useQuery({
    queryKey: familyKeys.info(familyId!),
    queryFn: () => getFamily(familyId!),
    enabled: !!familyId,
  });
}

export function useActiveRecoveryCodesQuery(enabled: boolean) {
  return useQuery({
    queryKey: userKeys.recoveryCodes(),
    queryFn: listActiveRecoveryCodes,
    enabled,
  });
}

export function useUpdateMyNicknameMutation(
  refreshProfile: () => Promise<void>,
) {
  return useMutation({
    mutationFn: (nickname: string) => {
      console.log('[nickname] mutation 시작', { nickname });
      return updateMyNickname(nickname);
    },
    onSuccess: async (user) => {
      console.log('[nickname] mutation 성공', {
        userId: user.id,
        nickname: user.nickname,
      });
      await refreshProfile();
    },
    onError: (error, nickname) => {
      console.error('[nickname] mutation 실패', {
        nickname,
        error,
        message: error instanceof Error ? error.message : String(error),
      });
      showMutationError(ERRORS.family.nicknameChangeFailed, error);
    },
  });
}

export function useUpdateFamilyNameMutation(familyId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: familyMutationKeys.updateName(),
    mutationFn: (name: string) => updateFamilyName(name),
    onSuccess: async () => {
      if (familyId) {
        await qc.invalidateQueries({ queryKey: familyKeys.info(familyId) });
      }
      await invalidateFamilyActivity(qc);
    },
    onError: (error) => showMutationError(ERRORS.family.renameFailed, error),
  });
}

export function useRemoveFamilyMemberMutation(
  familyId: string | null | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: familyMutationKeys.removeMember(),
    mutationFn: (userId: string) => removeFamilyMember(userId),
    onSuccess: async () => {
      await invalidateFamilyActivity(qc);
      if (familyId) {
        await qc.invalidateQueries({ queryKey: familyKeys.members(familyId) });
      }
      await qc.invalidateQueries({ queryKey: userKeys.recoveryCodes() });
    },
    onError: (error) =>
      showMutationError(ERRORS.family.removeMemberFailed, error),
  });
}

export function useReissueRecoveryCodeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => reissueMemberRecoveryCode(userId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: userKeys.recoveryCodes() });
    },
    onError: (error) => showMutationError(ERRORS.recovery.createFailed, error),
  });
}

export function useDeleteFamilyMutation(refreshProfile: () => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: familyMutationKeys.deleteFamily(),
    mutationFn: () => deleteFamily(),
    onSuccess: async () => {
      await invalidateFamilyActivity(qc);
      await refreshProfile();
    },
    onError: (error) => showMutationError(ERRORS.family.deleteFailed, error),
  });
}
