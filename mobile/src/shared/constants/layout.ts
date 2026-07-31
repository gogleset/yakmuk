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
    /** 폼용 BottomSheet 최대 높이 (창 높이 비율) */
    maxHeightRatio: 0.9,
  },
  z: {
    fade: 15,
    fab: 20,
  },
  timePicker: {
    /** 시·분 숫자 박스 높이 */
    boxHeight: 72,
    /** 오전/오후 토글 너비 */
    periodWidth: 56,
  },
  /**
   * 같은 fill끼리 겹칠 때 구분용 soft shadow.
   * overflow:hidden 은 바깥 래퍼가 아니라 안쪽 콘텐츠에만.
   */
  shadow: {
    sameFill: {
      shadowColor: '#1F2A27',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
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
