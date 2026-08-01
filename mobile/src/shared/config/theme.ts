/** 디자인 토큰 — docs/design.md SoT (light, soft 틸) */
export { LAYOUT, LIMITS, MOTION, NAV, OVERLAY } from "@/shared/constants";

export const COLORS = {
  brand: "#4D8679",
  brandSoft: "#E4F1ED",
  /** 캘린더 「오늘」 하이라이트 — brandSoft보다 한 단계 진한 연녹 */
  todaySoft: "#C5E8D9",
  /** 스크린 배경 · 시스템 크롬 */
  canvas: "#FFFFFF",
  /** FadeEdge 투명 끝점 */
  canvasTransparent: "rgba(255, 255, 255, 0)",
  surface: "#FFFFFF",
  /** 인풋·outline·미선택 토글 — canvas/surface 위 가시 fill (border 대체) */
  surfaceSoft: "#F0F5F3",
  /** brand 위 텍스트·아이콘 */
  ink: "#F5FFFC",
  /** 본문·제목 (브랜드 영역 밖) */
  text: "#1F2A27",
  muted: "#7A8783",
  line: "#D5DED9",
  disabled: "#B8C4BF",
  warning: "#C49A3C",
  warningBorder: "#E8D48A",
  warningBg: "#FFF8E1",
  destructive: "#C46B5A",
  /** BAD 컨디션 선택 soft fill */
  destructiveSoft: "#F8E8E4",
  /** 캘린더 「다 먹었어요」 도트 — 시인성 우선 sky */
  sky: "#3B9AD9",
  /** 완료 CTA 등 — brand와 동일 축 */
  success: "#4D8679",
  white: "#FFFFFF",
} as const;

/** 케어/주의 톤 outline — fill 금지. design.md §8.1 Tone outline */
export const TONE_OUTLINE = {
  width: 1,
  warning: { borderWidth: 1, borderColor: COLORS.warningBorder },
  destructive: { borderWidth: 1, borderColor: COLORS.destructive },
} as const;

/** react-native-calendars 테마 — canvas(흰) 위 플랫 캘린더 */
export const CALENDAR_THEME = {
  backgroundColor: COLORS.canvas,
  calendarBackground: COLORS.canvas,
  selectedDayBackgroundColor: COLORS.brand,
  selectedDayTextColor: COLORS.ink,
  /** 오늘 — 연한 녹색 fill로 시인성 */
  todayBackgroundColor: COLORS.todaySoft,
  todayTextColor: COLORS.brand,
  dayTextColor: COLORS.text,
  textDisabledColor: COLORS.disabled,
  arrowColor: COLORS.brand,
  monthTextColor: COLORS.brand,
  textMonthFontWeight: "700" as const,
};
