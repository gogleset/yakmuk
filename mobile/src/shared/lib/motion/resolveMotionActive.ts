/** motionActive = userPref && !lowPower && !osReduceMotion */
export function resolveMotionActive(input: {
  animationsEnabledUser: boolean;
  lowPowerMode: boolean;
  osReduceMotion: boolean;
}): boolean {
  return (
    input.animationsEnabledUser &&
    !input.lowPowerMode &&
    !input.osReduceMotion
  );
}
