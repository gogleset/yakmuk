import { Keyboard, Platform, type KeyboardEvent } from 'react-native';

export type KeyboardMetrics = {
  /** 키보드 높이 (endCoordinates.height) */
  height: number;
};

/** KeyboardEvent → 메트릭 (없거나 높이 0이면 null) */
export function metricsFromKeyboardEvent(
  event: Pick<KeyboardEvent, 'endCoordinates'> | null | undefined,
): KeyboardMetrics | null {
  const height = event?.endCoordinates?.height;
  if (typeof height !== 'number' || !Number.isFinite(height) || height <= 0) {
    return null;
  }
  return { height };
}

type InsetOptions = {
  platform?: typeof Platform.OS;
  /**
   * iOS는 KeyboardAvoidingView padding과 겹치므로 기본 false.
   * Android만 ScrollView paddingBottom에 씀.
   */
  applyOnIos?: boolean;
};

/**
 * ScrollView content paddingBottom용 키보드 inset.
 * iOS + applyOnIos=false → 0 (KAV와 이중 적용 방지).
 */
export function insetFromKeyboardEvent(
  metrics: KeyboardMetrics | null | undefined,
  options?: InsetOptions,
): number {
  if (!metrics || metrics.height <= 0) return 0;

  const platform = options?.platform ?? Platform.OS;
  const applyOnIos = options?.applyOnIos ?? false;
  if (platform === 'ios' && !applyOnIos) return 0;

  return Math.max(0, Math.round(metrics.height));
}

/**
 * 키보드 show/hide 구독 → inset 콜백.
 * @returns unsubscribe
 */
export function subscribeKeyboardBottomInset(
  onChange: (inset: number) => void,
  options?: InsetOptions,
): () => void {
  const showEvent =
    Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
  const hideEvent =
    Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

  const onShow = (e: KeyboardEvent) => {
    onChange(insetFromKeyboardEvent(metricsFromKeyboardEvent(e), options));
  };
  const onHide = () => {
    onChange(0);
  };

  const showSub = Keyboard.addListener(showEvent, onShow);
  const hideSub = Keyboard.addListener(hideEvent, onHide);

  return () => {
    showSub.remove();
    hideSub.remove();
  };
}
