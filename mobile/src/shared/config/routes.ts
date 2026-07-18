import { appScheme } from '@/shared/config/env';

/** 앱 라우트 상수 — href / router 공통 */
export const ROUTES = {
  welcome: '/welcome',
  join: '/join',
  home: '/(tabs)/home',
  family: '/(tabs)/family',
  settings: '/(tabs)/settings',
  /** 가족 운영 (초대·멤버·이름) */
  settingsFamily: '/settings-family',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export function joinRoute(code?: string): string {
  if (!code) return ROUTES.join;
  return `${ROUTES.join}?code=${encodeURIComponent(code)}`;
}

/** 가족 멤버 복약 캘린더 */
export function familyMemberRoute(
  userId: string,
  nickname?: string | null,
  role?: string | null,
): string {
  const params = new URLSearchParams();
  if (nickname) params.set('nickname', nickname);
  if (role) params.set('role', role);
  const qs = params.toString();
  const base = `/family-member/${encodeURIComponent(userId)}`;
  return qs ? `${base}?${qs}` : base;
}

/** 딥링크 페이로드 */
export function joinDeepLink(inviteCode: string): string {
  return `${appScheme}://join?code=${inviteCode}`;
}
