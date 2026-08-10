export {
  COMPONENT_MOTION_DEFAULTS,
  MOTION_STYLES,
} from '@/shared/lib/motion/styles';
export type {
  MotionComponentId,
  MotionKind,
  MotionStyleName,
  MotionsOfKind,
} from '@/shared/lib/motion/styles';
export {
  defaultStyleFor,
  resolveMotionStyle,
} from '@/shared/lib/motion/resolveMotionStyle';
export type { ResolveMotionStyleInput } from '@/shared/lib/motion/resolveMotionStyle';
export { motionMs } from '@/shared/lib/motion/motionMs';
export { resolveMotionActive } from '@/shared/lib/motion/resolveMotionActive';
export {
  getMotionAnimationsEnabled,
  parseMotionAnimationsEnabled,
  setMotionAnimationsEnabled,
  subscribeMotionPref,
  MOTION_PREF_STORAGE_KEY,
} from '@/shared/lib/motion/pref';
