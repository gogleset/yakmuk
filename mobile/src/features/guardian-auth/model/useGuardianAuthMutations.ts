import { useMutation } from '@tanstack/react-query';
import { createFamily } from '@/entities/user/api/create-family';
import { signInGuardianDev } from '@/entities/user/api/sign-in-guardian-dev';
import { signInGuardianOAuth } from '@/entities/user/api/sign-in-guardian-oauth';
import { signOut } from '@/entities/user/api/sign-out';
import { showMutationError } from '@/shared/lib/mutation';

export const guardianAuthKeys = {
  all: ['guardian-auth'] as const,
  signInDev: () => [...guardianAuthKeys.all, 'sign-in-dev'] as const,
  signInOAuth: () => [...guardianAuthKeys.all, 'sign-in-oauth'] as const,
  createFamily: () => [...guardianAuthKeys.all, 'create-family'] as const,
  signOut: () => [...guardianAuthKeys.all, 'sign-out'] as const,
};

export function useGuardianSignInDevMutation() {
  return useMutation({
    mutationKey: guardianAuthKeys.signInDev(),
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInGuardianDev(email, password),
    onError: (error) => showMutationError('로그인하지 못했어요', error),
  });
}

export function useGuardianSignInOAuthMutation() {
  return useMutation({
    mutationKey: guardianAuthKeys.signInOAuth(),
    mutationFn: (provider: 'google' | 'apple') => signInGuardianOAuth(provider),
    onError: (error) => showMutationError('로그인하지 못했어요', error),
  });
}

export function useCreateFamilyMutation(refreshProfile: () => Promise<void>) {
  return useMutation({
    mutationKey: guardianAuthKeys.createFamily(),
    mutationFn: async (nickname: string) => {
      await createFamily(nickname);
      await refreshProfile();
    },
    onError: (error) => showMutationError('만들지 못했어요', error),
  });
}

export function useSignOutMutation() {
  return useMutation({
    mutationKey: guardianAuthKeys.signOut(),
    mutationFn: signOut,
    onError: (error) => showMutationError('로그아웃하지 못했어요', error),
  });
}
