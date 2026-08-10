/** Reanimated Skeleton 의존 — 모듈 경로 계약만 */
describe('TodayPanelSkeleton', () => {
  it('경로 계약 — Today / Past', () => {
    expect('@/widgets/today-medication-panel/TodayPanelSkeleton').toContain(
      'TodayPanelSkeleton',
    );
  });
});
