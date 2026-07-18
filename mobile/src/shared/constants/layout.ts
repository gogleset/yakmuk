/** 레이아웃·오버레이·내비 사이즈 */
export const LAYOUT = {
  fab: {
    bottom: 16,
    iconSize: 28,
    size: 56,
  },
  fade: {
    top: 36,
    bottomWithFab: 80,
    bottomPlain: 48,
    defaultTop: 40,
    defaultBottom: 72,
    defaultHeight: 56,
  },
  /** 스크롤 콘텐츠 하단 여백 (fade 높이와 별개) */
  scroll: {
    /** FAB 위 패딩 — fab.size + bottom + 여유 */
    paddingBottomWithFab: 96,
  },
  hitSlop: {
    sm: 8,
    md: 12,
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
    /** BottomSheet 상단 라운드 */
    borderRadius: 24,
    /** PageSheet iOS 상단 여백 */
    pagePaddingTopIos: 8,
    /** PageSheet 하단 추가 패딩 */
    pagePaddingBottomExtra: 12,
    horizontalPadding: 20,
    headerPaddingTop: 16,
    contentGap: 12,
  },
  z: {
    fade: 15,
    fab: 20,
  },
  timePicker: {
    wheelHeight: 160,
  },
} as const;

/** 탭·스택 내비 */
export const NAV = {
  tabBarHeight: 56,
  tabBarPaddingTop: 6,
} as const;

/** 딤 오버레이 */
export const OVERLAY = {
  /** BottomSheet 배경 스크림 */
  scrim: 'rgba(0, 0, 0, 0.4)',
} as const;
