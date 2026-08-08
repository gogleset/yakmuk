import { Platform } from 'react-native';
import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { getGoogleWebClientId } from '@/shared/config/env';
import { ERRORS } from '@/shared/copy';

export type NativeSignInResult = { cancelled: boolean };

let googleConfigured = false;

function ensureGoogleConfigured(): void {
  if (googleConfigured) return;
  GoogleSignin.configure({ webClientId: getGoogleWebClientId() });
  googleConfigured = true;
}

/** 실패 후 Google UI·부분 세션 잔여 제거 (취소는 제외) */
async function cleanupAfterFailedNativeSignIn(
  provider: 'google' | 'apple',
): Promise<void> {
  if (provider === 'google') {
    try {
      await GoogleSignin.signOut();
    } catch {
      /* ignore */
    }
  }
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await supabase.auth.signOut();
    }
  } catch {
    /* ignore */
  }
}

async function signInWithGoogle(): Promise<NativeSignInResult> {
  ensureGoogleConfigured();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      return { cancelled: true };
    }
    const idToken = response.data.idToken;
    if (!idToken) {
      await cleanupAfterFailedNativeSignIn('google');
      throw new Error(ERRORS.auth.loginFailed);
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) {
      await cleanupAfterFailedNativeSignIn('google');
      throwIfError(error, ERRORS.auth.loginFailed);
    }
    return { cancelled: false };
  } catch (error: unknown) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';
    if (
      code === statusCodes.SIGN_IN_CANCELLED ||
      code === statusCodes.IN_PROGRESS
    ) {
      return { cancelled: true };
    }
    if (__DEV__) {
      console.warn('[auth] google native sign-in failed', {
        code,
        message:
          error instanceof Error
            ? error.message
            : error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : String(error),
      });
    }
    // throwIfError 경로에서 이미 cleanup 했을 수 있음 — 한 번 더 무해
    await cleanupAfterFailedNativeSignIn('google');
    // Google Sign-In DEVELOPER_ERROR (보통 code 10) — SHA-1/패키지 불일치
    if (code === '10' || /DEVELOPER_ERROR/i.test(String(error))) {
      throw new Error(ERRORS.auth.googleDeveloperError);
    }
    if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error(ERRORS.auth.googlePlayServicesMissing);
    }
    throw error;
  }
}

async function signInWithApple(): Promise<NativeSignInResult> {
  if (Platform.OS !== 'ios') {
    throw new Error(ERRORS.auth.appleIosOnly);
  }
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) {
      await cleanupAfterFailedNativeSignIn('apple');
      throw new Error(ERRORS.auth.loginFailed);
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    if (error) {
      await cleanupAfterFailedNativeSignIn('apple');
      throwIfError(error, ERRORS.auth.loginFailed);
    }
    return { cancelled: false };
  } catch (error: unknown) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';
    if (code === 'ERR_REQUEST_CANCELED') {
      return { cancelled: true };
    }
    await cleanupAfterFailedNativeSignIn('apple');
    throw error;
  }
}

/** 가족장 네이티브 로그인 (Google all / Apple iOS). 취소 시 cancelled: true. */
export async function signInGuardianNative(
  provider: 'google' | 'apple',
): Promise<NativeSignInResult> {
  if (provider === 'google') return signInWithGoogle();
  return signInWithApple();
}

/** @internal tests */
export function resetGoogleConfigureForTests(): void {
  googleConfigured = false;
}
