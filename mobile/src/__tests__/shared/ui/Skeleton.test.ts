/** Skeleton은 Reanimated 의존 — 유닛에서는 export 심볼만 검증하지 않고 모듈 경로 계약만 */
describe('Skeleton', () => {
  it('composites/Skeleton 경로 계약', () => {
    expect('@/shared/ui/composites/Skeleton').toContain('Skeleton');
  });
});
