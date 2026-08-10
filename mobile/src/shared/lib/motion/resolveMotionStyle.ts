import {
  COMPONENT_MOTION_DEFAULTS,
  MOTION_STYLES,
  type MotionComponentId,
  type MotionKind,
  type MotionStyleName,
} from '@/shared/lib/motion/styles';

export type ResolveMotionStyleInput = {
  motionActive: boolean;
  motionProp: false | MotionStyleName | undefined;
  componentDefault: MotionStyleName;
  allowedKind: MotionKind;
  /** __DEV__ warn 주입용 (테스트) */
  onKindMismatch?: (name: MotionStyleName, allowed: MotionKind) => void;
};

/** Gate × prop × default → 최종 스타일 이름 */
export function resolveMotionStyle(
  input: ResolveMotionStyleInput,
): MotionStyleName {
  if (!input.motionActive || input.motionProp === false) {
    return 'none';
  }
  const name = input.motionProp ?? input.componentDefault;
  const style = MOTION_STYLES[name];
  if (style.kind !== 'none' && style.kind !== input.allowedKind) {
    input.onKindMismatch?.(name, input.allowedKind);
    return input.componentDefault;
  }
  return name;
}

export function defaultStyleFor(
  component: MotionComponentId,
): MotionStyleName {
  return COMPONENT_MOTION_DEFAULTS[component];
}
