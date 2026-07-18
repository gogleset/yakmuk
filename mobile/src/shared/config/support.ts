/** 고객지원·법적 문서 stub (실제 URL/채널 연결 전) */
export const SUPPORT = {
  email: 'support@yakmuk.app',
  adsEmail: 'ads@yakmuk.app',
  /** 준비 중 — 스토어 심사 전 실제 URL로 교체 */
  termsUrl: null as string | null,
  privacyUrl: null as string | null,
} as const;

export function supportMailTo(subject: string): string {
  return `mailto:${SUPPORT.email}?subject=${encodeURIComponent(subject)}`;
}

export function adsMailTo(subject = '광고·제휴 문의'): string {
  return `mailto:${SUPPORT.adsEmail}?subject=${encodeURIComponent(subject)}`;
}
