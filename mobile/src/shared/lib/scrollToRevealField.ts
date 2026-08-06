export type ScrollToRevealFieldInput = {
  /** 스크롤 콘텐츠 기준 필드 top */
  fieldY: number;
  fieldHeight: number;
  /** ScrollView 보이는 영역 높이 */
  viewportHeight: number;
  /** 뷰포트 하단에서 가리는 키보드·여유 (이미 content padding이면 0에 가깝게) */
  keyboardInset: number;
  /** sticky footer 등 추가 가림 (ScrollView 밖이면 보통 0) */
  footerHeight: number;
  currentScrollY: number;
  /** 필드와 가림선 사이 여유 */
  gap?: number;
};

/**
 * 포커스 필드가 보이도록 필요한 scrollY.
 * 이미 보이면 null (스크롤 스킵).
 */
export function scrollYToRevealField(
  input: ScrollToRevealFieldInput,
): number | null {
  const {
    fieldY,
    fieldHeight,
    viewportHeight,
    keyboardInset,
    footerHeight,
    currentScrollY,
  } = input;
  const gap = input.gap ?? 12;

  if (
    viewportHeight <= 0 ||
    fieldHeight < 0 ||
    !Number.isFinite(fieldY) ||
    !Number.isFinite(fieldHeight)
  ) {
    return null;
  }

  const obscured = Math.max(0, keyboardInset) + Math.max(0, footerHeight);
  const available = viewportHeight - obscured - gap;
  if (available <= 0) return null;

  const fieldBottom = fieldY + fieldHeight;
  const visibleTop = currentScrollY + gap;
  const visibleBottom = currentScrollY + available;

  // 이미 가용 영역 안이면 스킵
  if (fieldY >= visibleTop && fieldBottom <= visibleBottom) {
    return null;
  }

  // 하단이 잘리면 아래로 맞춤, 상단이 잘리면 위로
  let target = currentScrollY;
  if (fieldBottom > visibleBottom) {
    target = fieldBottom - available;
  }
  if (fieldY < target + gap) {
    target = fieldY - gap;
  }

  target = Math.max(0, Math.round(target));
  if (target === Math.round(currentScrollY)) return null;
  return target;
}
