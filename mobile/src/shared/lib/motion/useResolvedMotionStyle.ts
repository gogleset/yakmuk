import { useMemo } from 'react';
import { useMotion } from '@/providers/MotionProvider';
import {
  COMPONENT_MOTION_DEFAULTS,
  MOTION_STYLES,
  resolveMotionStyle,
  type MotionComponentId,
  type MotionKind,
  type MotionStyleName,
  type MotionsOfKind,
} from '@/shared/lib/motion';

type AllowedKind = Exclude<MotionKind, 'none'>;

export function useResolvedMotionStyle<K extends AllowedKind>(input: {
  component: MotionComponentId;
  allowedKind: K;
  motion?: false | MotionsOfKind<K>;
}): {
  styleName: MotionStyleName;
  style: (typeof MOTION_STYLES)[MotionStyleName];
  motionActive: boolean;
} {
  const { motionActive } = useMotion();
  const componentDefault = COMPONENT_MOTION_DEFAULTS[input.component];

  const styleName = useMemo(
    () =>
      resolveMotionStyle({
        motionActive,
        motionProp: input.motion as false | MotionStyleName | undefined,
        componentDefault,
        allowedKind: input.allowedKind,
        onKindMismatch: (name, allowed) => {
          // intentional: design §10.5 __DEV__ kind mismatch
          if (__DEV__) {
            console.warn(
              `[yakmuk:motion] kind mismatch: ${name} (want ${allowed})`,
            );
          }
        },
      }),
    [motionActive, input.motion, componentDefault, input.allowedKind],
  );

  return {
    styleName,
    style: MOTION_STYLES[styleName],
    motionActive,
  };
}
