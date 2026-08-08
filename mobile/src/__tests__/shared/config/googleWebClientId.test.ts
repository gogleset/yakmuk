import { ERRORS } from '@/shared/copy';
import { getGoogleWebClientId } from '@/shared/config/env';

describe('getGoogleWebClientId', () => {
  const prev = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    } else {
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = prev;
    }
  });

  it('env 있으면 반환', () => {
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID =
      ' 123-web.apps.googleusercontent.com ';
    expect(getGoogleWebClientId()).toBe(
      '123-web.apps.googleusercontent.com',
    );
  });

  it('없으면 안내 에러', () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    expect(() => getGoogleWebClientId()).toThrow(
      ERRORS.auth.googleWebClientMissing,
    );
  });
});
