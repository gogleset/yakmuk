/** 디자인 토큰 — 매직 컬러 대신 사용 */
export const COLORS = {
  brand: '#1B4D3E',
  brandSoft: '#DCEADF',
  canvas: '#F3EFE6',
  canvasTransparent: 'rgba(243, 239, 230, 0)',
  ink: '#F7F3EA',
  line: '#E2DCD0',
  muted: '#8A938C',
  warning: '#A67C00',
  warningBorder: '#E8D48A',
  warningBg: '#FFF8E1',
  destructive: '#8B2E2E',
  white: '#FFFFFF',
  disabled: '#C5C0B5',
} as const;

/** 레이아웃·사이즈 상수 */
export const LAYOUT = {
  fab: {
    bottom: 16,
    iconSize: 28,
  },
  fade: {
    top: 36,
    bottomWithFab: 80,
    bottomPlain: 48,
    defaultTop: 40,
    defaultBottom: 72,
    defaultHeight: 56,
  },
  icon: {
    sm: 16,
    md: 18,
    lg: 22,
    xl: 28,
    hero: 36,
  },
  sheet: {
    paddingBottomExtra: 16,
  },
  z: {
    fade: 15,
    fab: 20,
    sheet: 20,
  },
} as const;

/** react-native-calendars 테마 */
export const CALENDAR_THEME = {
  backgroundColor: COLORS.white,
  calendarBackground: COLORS.white,
  selectedDayBackgroundColor: COLORS.brand,
  selectedDayTextColor: COLORS.ink,
  todayTextColor: COLORS.brand,
  dayTextColor: COLORS.brand,
  textDisabledColor: COLORS.disabled,
  arrowColor: COLORS.brand,
  monthTextColor: COLORS.brand,
  textMonthFontWeight: '700' as const,
};
