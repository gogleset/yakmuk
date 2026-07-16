/** 앱 라우트 상수 — href / router 공통 */
export const ROUTES = {
  welcome: '/welcome',
  join: '/join',
  home: '/(tabs)/home',
  family: '/(tabs)/family',
  settings: '/(tabs)/settings',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export function joinRoute(code?: string): string {
  if (!code) return ROUTES.join;
  return `${ROUTES.join}?code=${encodeURIComponent(code)}`;
}

/** 딥링크 페이로드 */
export function joinDeepLink(inviteCode: string): string {
  return `yakmuk://join?code=${inviteCode}`;
}
