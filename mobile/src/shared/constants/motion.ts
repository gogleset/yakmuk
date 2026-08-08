/** 모션 — docs/design.md §10 */
export const MOTION = {
  duration: {
    instant: 100,
    fast: 180,
    normal: 300,
  },
  /**
   * 순차 등장 (copy → media → action).
   * delay = step * stepMs. 짧게·빠르게 — 한 화면 비트는 0·1·2.
   */
  stagger: {
    stepMs: 55,
  },
  offset: {
    enterY: 10,
  },
  press: {
    scale: 0.97,
  },
  /** ExceptionToast 자동 닫힘 */
  toastMs: 2500,
} as const;

export type MotionDuration = keyof typeof MOTION.duration;

/** stagger step → delayMs */
export function staggerDelay(step: number): number {
  return Math.max(0, step) * MOTION.stagger.stepMs;
}

