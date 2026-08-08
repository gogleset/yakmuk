import { useMutation } from '@tanstack/react-query';
import { createFamily } from '@/entities/user/api/create-family';
import { signInGuardianDev } from '@/entities/user/api/sign-in-guardian-dev';
import { signInGuardianNative } from '@/entities/user/api/sign-in-guardian-native';
import { signOut } from '@/entities/user/api/sign-out';
import { withdrawMyAccount } from '@/entities/user/api/withdraw-my-account';
import { showMutationError } from '@/shared/lib/mutation';
import { ERRORS } from '@/shared/copy';

export const guardianAuthKeys = {
  all: ['guardian-auth'] as const,
  signInDev: () => [...guardianAuthKeys.all, 'sign-in-dev'] as const,
  signInNative: () => [...guardianAuthKeys.all, 'sign-in-native'] as const,
  createFamily: () => [...guardianAuthKeys.all, 'create-family'] as const,
  signOut: () => [...guardianAuthKeys.all, 'sign-out'] as const,
  withdraw: () => [...guardianAuthKeys.all, 'withdraw'] as const,
};

export function useGuardianSignInDevMutation() {
  return useMutation({
    mutationKey: guardianAuthKeys.signInDev(),
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInGuardianDev(email, password),
    onError: (error) => showMutationError(ERRORS.auth.loginFailed, error),
  });
}

export function useGuardianSignInNativeMutation(onAuthFailureDismiss?: () => void) {
  return useMutation({
    mutationKey: guardianAuthKeys.signInNative(),
    mutationFn: (provider: 'google' | 'apple') =>
      signInGuardianNative(provider),
    onError: (error) =>
      showMutationError(ERRORS.auth.loginFailed, error, onAuthFailureDismiss),
  });
}

export function useCreateFamilyMutation(refreshProfile: () => Promise<void>) {
  return useMutation({
    mutationKey: guardianAuthKeys.createFamily(),
    mutationFn: async ({
      familyName,
      nickname,
    }: {
      familyName: string;
      nickname: string;
    }) => {
      await createFamily(familyName, nickname);
      await refreshProfile();
    },
    onError: (error) => showMutationError(ERRORS.family.createFailed, error),
  });
}

export function useSignOutMutation() {
  return useMutation({
    mutationKey: guardianAuthKeys.signOut(),
    mutationFn: signOut,
    onError: (error) => showMutationError(ERRORS.auth.logoutFailed, error),
  });
}

/** 탈퇴 후 세션도 정리 */
export function useWithdrawAccountMutation() {
  return useMutation({
    mutationKey: guardianAuthKeys.withdraw(),
    mutationFn: async () => {
      await withdrawMyAccount();
      await signOut();
    },
    onError: (error) => showMutationError(ERRORS.auth.withdrawFailed, error),
  });
}
