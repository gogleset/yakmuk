/** 디자인 토큰 — docs/design.md SoT (light, soft 틸) */
export { LAYOUT, LIMITS, MOTION, NAV, OVERLAY } from "@/shared/constants";

export const COLORS = {
  brand: "#4D8679",
  brandSoft: "#E4F1ED",
  /** 스크린 배경 · 시스템 크롬 */
  canvas: "#F7F8F8",
  /** FadeEdge 투명 끝점 */
  canvasTransparent: "rgba(247, 248, 248, 0)",
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
  /** 완료·다 먹음 — brand와 동일 축 */
  success: "#4D8679",
  white: "#FFFFFF",
} as const;

/** react-native-calendars 테마 — soft canvas에 붙는 플랫 캘린더 */
export const CALENDAR_THEME = {
  backgroundColor: COLORS.canvas,
  calendarBackground: COLORS.canvas,
  selectedDayBackgroundColor: COLORS.brand,
  selectedDayTextColor: COLORS.ink,
  todayTextColor: COLORS.brand,
  dayTextColor: COLORS.text,
  textDisabledColor: COLORS.disabled,
  arrowColor: COLORS.brand,
  monthTextColor: COLORS.brand,
  textMonthFontWeight: "700" as const,
};
