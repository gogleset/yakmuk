/** 모션 스타일 레지스트리 — docs/design/motion.md */
import { MOTION, type MotionDuration } from '@/shared/constants/motion';

export type MotionKind = 'press' | 'enter' | 'sheet' | 'loop' | 'none';

export const MOTION_STYLES = {
  none: { kind: 'none' as const },
  press: {
    kind: 'press' as const,
    scale: MOTION.press.scale,
    duration: 'instant' as MotionDuration,
  },
  enterFade: {
    kind: 'enter' as const,
    enterY: MOTION.offset.enterY,
    duration: 'normal' as MotionDuration,
  },
  sheetDefault: {
    kind: 'sheet' as const,
    present: 'normal' as MotionDuration,
    dismiss: 'fast' as MotionDuration,
  },
  skeletonPulse: {
    kind: 'loop' as const,
    duration: 'normal' as MotionDuration,
  },
} as const;

export type MotionStyleName = keyof typeof MOTION_STYLES;

export type MotionsOfKind<K extends MotionKind> = {
  [N in MotionStyleName]: (typeof MOTION_STYLES)[N]['kind'] extends K
    ? N
    : never;
}[MotionStyleName];

/** Surface 기본 스타일 — design/motion.md §10.6 */
export const COMPONENT_MOTION_DEFAULTS = {
  button: 'press',
  pressableScale: 'press',
  fab: 'press',
  choiceCard: 'press',
  settingsRow: 'press',
  fadeInView: 'enterFade',
  bottomSheet: 'sheetDefault',
  skeleton: 'skeletonPulse',
} as const satisfies Record<string, MotionStyleName>;

export type MotionComponentId = keyof typeof COMPONENT_MOTION_DEFAULTS;
