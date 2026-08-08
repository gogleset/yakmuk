import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { ERRORS } from '@/shared/copy';

/** 에뮬레이터에서 host 루프백 주소 보정 */
function resolveLocalSupabaseUrl(url: string): string {
  if (
    Platform.OS === 'android' &&
    (url.includes('127.0.0.1') || url.includes('localhost'))
  ) {
    // Android 에뮬 → 호스트 머신
    return url
      .replace('127.0.0.1', '10.0.2.2')
      .replace('localhost', '10.0.2.2');
  }
  return url;
}

/** 환경변수 로드. 없으면 로컬 supabase 기본값 */
export function getSupabaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  if (url) return resolveLocalSupabaseUrl(url);
  // Expo Go / 시뮬 기본
  return resolveLocalSupabaseUrl('http://127.0.0.1:54421');
}

export function getSupabaseAnonKey(): string {
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (key) return key;
  // supabase start 기본 anon (로컬 전용 — prod 금지)
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
}

export const appScheme =
  Constants.expoConfig?.scheme?.toString() ?? 'yakmuk';

/**
 * Google 네이티브 Sign-In용 Web Client ID (Secret 아님).
 * 미설정 시 Google 로그인 버튼은 실패 — supabase/.env.example · mobile/.env.example 참고.
 */
export function getGoogleWebClientId(): string {
  const id = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!id) {
    throw new Error(ERRORS.auth.googleWebClientMissing);
  }
  return id;
}

/**
 * 공공데이터포털 인증키 (식약처 e약은요).
 * 포털에서 발급한 URL-인코딩 키를 그대로 보관 — 요청 시 재인코딩 금지.
 */
export function getDataGoKrServiceKey(): string {
  const key = process.env.EXPO_PUBLIC_DATA_GO_KR_SERVICE_KEY?.trim();
  if (!key) {
    throw new Error('공공 API 키가 없어요. EXPO_PUBLIC_DATA_GO_KR_SERVICE_KEY를 설정해 주세요.');
  }
  return key;
}
