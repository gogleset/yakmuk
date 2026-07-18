import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { loggedFetch } from '@/shared/api/loggedFetch';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/shared/config/env';

/** Supabase 클라이언트 — entity api에서만 직접 사용 */
export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // __DEV__에서만 요청 로깅 fetch 주입
  ...(__DEV__
    ? { global: { fetch: loggedFetch } }
    : {}),
});
