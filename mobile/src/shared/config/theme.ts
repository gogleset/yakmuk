/** 디자인 토큰 — docs/design.md SoT (light) */
export { LAYOUT, LIMITS, MOTION, NAV, OVERLAY } from '@/shared/constants';

export const COLORS = {
  brand: '#0F6B5C',
  brandSoft: '#D8F0EA',
  canvas: '#F4F7F6',
  /** FadeEdge 투명 끝점 */
  canvasTransparent: 'rgba(244, 247, 246, 0)',
  surface: '#FFFFFF',
  /** brand 위 텍스트·아이콘 */
  ink: '#F5FFFC',
  /** 본문·제목 (브랜드 영역 밖) */
  text: '#1A2E29',
  muted: '#6B7A76',
  line: '#D5DED9',
  disabled: '#B8C4BF',
  warning: '#A67C00',
  warningBorder: '#E8D48A',
  warningBg: '#FFF8E1',
  destructive: '#8B2E2E',
  /** 완료·다 먹음 — brand와 동일 축 */
  success: '#0F6B5C',
  white: '#FFFFFF',
} as const;

/** react-native-calendars 테마 */
export const CALENDAR_THEME = {
  backgroundColor: COLORS.surface,
  calendarBackground: COLORS.surface,
  selectedDayBackgroundColor: COLORS.brand,
  selectedDayTextColor: COLORS.ink,
  todayTextColor: COLORS.brand,
  dayTextColor: COLORS.text,
  textDisabledColor: COLORS.disabled,
  arrowColor: COLORS.brand,
  monthTextColor: COLORS.brand,
  textMonthFontWeight: '700' as const,
};
