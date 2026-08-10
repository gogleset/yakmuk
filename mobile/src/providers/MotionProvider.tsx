import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo } from 'react-native';
import { resolveMotionActive } from '@/shared/lib/motion/resolveMotionActive';
import {
  getMotionAnimationsEnabled,
  setMotionAnimationsEnabled,
  subscribeMotionPref,
} from '@/shared/lib/motion/pref';

type MotionContextValue = {
  /** 설정 스위치 값 */
  animationsEnabled: boolean;
  setAnimationsEnabled: (v: boolean) => Promise<void>;
  /** 실제 재생 여부 */
  motionActive: boolean;
  lowPowerMode: boolean;
  osReduceMotion: boolean;
};

const MotionContext = createContext<MotionContextValue | null>(null);

type Props = {
  children: ReactNode;
  /** 테스트용 강제 저전력 */
  lowPowerModeOverride?: boolean | null;
};

async function readLowPowerMode(): Promise<boolean> {
  try {
    const Battery = await import('expo-battery');
    return await Battery.isLowPowerModeEnabledAsync();
  } catch {
    // 미지원·웹·에러 → 모션 유지
    return false;
  }
}

export function MotionProvider({
  children,
  lowPowerModeOverride = null,
}: Props) {
  const [animationsEnabled, setAnimationsEnabledState] = useState(true);
  const [osReduceMotion, setOsReduceMotion] = useState(false);
  const [lowPowerMode, setLowPowerMode] = useState(false);

  useEffect(() => {
    if (lowPowerModeOverride != null) {
      setLowPowerMode(lowPowerModeOverride);
      return;
    }
    let cancelled = false;
    let subscription: { remove: () => void } | null = null;

    void readLowPowerMode().then((v) => {
      if (!cancelled) setLowPowerMode(v);
    });

    void import('expo-battery')
      .then((Battery) => {
        if (cancelled) return;
        subscription = Battery.addLowPowerModeListener(({ lowPowerMode: next }) => {
          setLowPowerMode(next);
        });
      })
      .catch(() => {
        // skip listener
      });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [lowPowerModeOverride]);

  useEffect(() => {
    let cancelled = false;
    void getMotionAnimationsEnabled().then((v) => {
      if (!cancelled) setAnimationsEnabledState(v);
    });
    return subscribeMotionPref(() => {
      void getMotionAnimationsEnabled().then((v) => {
        if (!cancelled) setAnimationsEnabledState(v);
      });
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) setOsReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setOsReduceMotion,
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const setAnimationsEnabled = useCallback(async (v: boolean) => {
    await setMotionAnimationsEnabled(v);
    setAnimationsEnabledState(v);
  }, []);

  const motionActive = useMemo(
    () =>
      resolveMotionActive({
        animationsEnabledUser: animationsEnabled,
        lowPowerMode,
        osReduceMotion,
      }),
    [animationsEnabled, lowPowerMode, osReduceMotion],
  );

  const value = useMemo(
    () => ({
      animationsEnabled,
      setAnimationsEnabled,
      motionActive,
      lowPowerMode,
      osReduceMotion,
    }),
    [
      animationsEnabled,
      setAnimationsEnabled,
      motionActive,
      lowPowerMode,
      osReduceMotion,
    ],
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

/** Provider 밖에서는 motionActive=true (테스트·스토리 폴백) */
export function useMotion(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (ctx) return ctx;
  return {
    animationsEnabled: true,
    setAnimationsEnabled: async () => {},
    motionActive: true,
    lowPowerMode: false,
    osReduceMotion: false,
  };
}
