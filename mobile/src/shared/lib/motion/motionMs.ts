import { MOTION, type MotionDuration } from '@/shared/constants/motion';

/** Gate off면 0 — toastMs는 쓰지 말 것 */
export function motionMs(
  motionActive: boolean,
  key: MotionDuration,
): number {
  return motionActive ? MOTION.duration[key] : 0;
}
