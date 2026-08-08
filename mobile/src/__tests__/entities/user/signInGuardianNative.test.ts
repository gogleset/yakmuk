import { Platform } from 'react-native';
import { ERRORS } from '@/shared/copy';
import {
  resetGoogleConfigureForTests,
  signInGuardianNative,
} from '@/entities/user/api/sign-in-guardian-native';

const signInWithIdToken = jest.fn();
const getSession = jest.fn();
const authSignOut = jest.fn();

jest.mock('@/shared/api/client', () => ({
  supabase: {
    auth: {
      signInWithIdToken: (...args: unknown[]) => signInWithIdToken(...args),
      getSession: (...args: unknown[]) => getSession(...args),
      signOut: (...args: unknown[]) => authSignOut(...args),
    },
  },
}));

jest.mock('@/shared/config/env', () => ({
  getGoogleWebClientId: () => 'web-client-id.apps.googleusercontent.com',
}));

const googleSignIn = jest.fn();
const googleSignOut = jest.fn();
const hasPlayServices = jest.fn();
const configure = jest.fn();

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: (...args: unknown[]) => configure(...args),
    hasPlayServices: (...args: unknown[]) => hasPlayServices(...args),
    signIn: (...args: unknown[]) => googleSignIn(...args),
    signOut: (...args: unknown[]) => googleSignOut(...args),
  },
  isSuccessResponse: (response: { type: string }) => response.type === 'success',
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

const appleSignInAsync = jest.fn();

jest.mock('expo-apple-authentication', () => ({
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
  signInAsync: (...args: unknown[]) => appleSignInAsync(...args),
}));

describe('signInGuardianNative', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGoogleConfigureForTests();
    signInWithIdToken.mockResolvedValue({ data: {}, error: null });
    getSession.mockResolvedValue({ data: { session: null } });
    authSignOut.mockResolvedValue({ error: null });
    googleSignOut.mockResolvedValue(null);
    hasPlayServices.mockResolvedValue(true);
    (Platform as { OS: string }).OS = 'ios';
  });

  it('google — idToken → signInWithIdToken', async () => {
    googleSignIn.mockResolvedValue({
      type: 'success',
      data: { idToken: 'google-id-token' },
    });

    const result = await signInGuardianNative('google');

    expect(configure).toHaveBeenCalledWith({
      webClientId: 'web-client-id.apps.googleusercontent.com',
    });
    expect(signInWithIdToken).toHaveBeenCalledWith({
      provider: 'google',
      token: 'google-id-token',
    });
    expect(result).toEqual({ cancelled: false });
  });

  it('google — 사용자 취소 → cancelled', async () => {
    googleSignIn.mockResolvedValue({ type: 'cancelled' });

    const result = await signInGuardianNative('google');

    expect(signInWithIdToken).not.toHaveBeenCalled();
    expect(result).toEqual({ cancelled: true });
  });

  it('google — supabase 실패 시 Google signOut + 세션 정리', async () => {
    googleSignIn.mockResolvedValue({
      type: 'success',
      data: { idToken: 'google-id-token' },
    });
    signInWithIdToken.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid id_token' },
    });
    getSession.mockResolvedValue({
      data: { session: { access_token: 'x' } },
    });

    await expect(signInGuardianNative('google')).rejects.toThrow();
    expect(googleSignOut).toHaveBeenCalled();
    expect(authSignOut).toHaveBeenCalled();
  });

  it('apple — iOS identityToken → signInWithIdToken', async () => {
    appleSignInAsync.mockResolvedValue({
      identityToken: 'apple-id-token',
    });

    const result = await signInGuardianNative('apple');

    expect(signInWithIdToken).toHaveBeenCalledWith({
      provider: 'apple',
      token: 'apple-id-token',
    });
    expect(result).toEqual({ cancelled: false });
  });

  it('apple — Android면 거부', async () => {
    (Platform as { OS: string }).OS = 'android';

    await expect(signInGuardianNative('apple')).rejects.toThrow(
      ERRORS.auth.appleIosOnly,
    );
    expect(signInWithIdToken).not.toHaveBeenCalled();
  });

  it('apple — 사용자 취소 → cancelled', async () => {
    appleSignInAsync.mockRejectedValue({ code: 'ERR_REQUEST_CANCELED' });

    const result = await signInGuardianNative('apple');

    expect(signInWithIdToken).not.toHaveBeenCalled();
    expect(result).toEqual({ cancelled: true });
  });
});
