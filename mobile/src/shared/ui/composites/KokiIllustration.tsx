import { Image, type ImageStyle, type StyleProp } from 'react-native';

/** 콕이 컷 variant — Metro는 동적 require 불가, 정적 맵만 */
export type KokiVariant =
  | 'welcome'
  | 'thinking'
  | 'happy'
  | 'done'
  | 'family'
  | 'streak'
  | 'worried'
  | 'cheer'
  | 'pill'
  | 'lantern'
  | 'heart'
  | 'sleep'
  | 'empty';

// composites → ui → shared → src → mobile/assets/koki/v1
const KOKI_SOURCES: Record<KokiVariant, number> = {
  welcome: require('../../../../assets/koki/v1/koki_wave.png'),
  thinking: require('../../../../assets/koki/v1/koki_thinking.png'),
  happy: require('../../../../assets/koki/v1/koki_thanks.png'),
  done: require('../../../../assets/koki/v1/koki_done.png'),
  /** 가족 empty·초대 peek — cheer와 분리 */
  family: require('../../../../assets/koki/v1/koki_wave.png'),
  streak: require('../../../../assets/koki/v1/koki_streak.png'),
  worried: require('../../../../assets/koki/v1/koki_worried.png'),
  cheer: require('../../../../assets/koki/v1/koki_cheer.png'),
  pill: require('../../../../assets/koki/v1/koki_medicine.png'),
  lantern: require('../../../../assets/koki/v1/koki_sleep.png'),
  heart: require('../../../../assets/koki/v1/koki_thanks.png'),
  sleep: require('../../../../assets/koki/v1/koki_sleep.png'),
  empty: require('../../../../assets/koki/v1/koki_empty.png'),
};

type Props = {
  variant: KokiVariant;
  size?: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

/** 브랜드 컷 슬롯 — variant별 koki/v1 PNG */
export function KokiIllustration({
  variant,
  size = 160,
  style,
  accessibilityLabel = '콕이',
}: Props) {
  return (
    <Image
      source={KOKI_SOURCES[variant]}
      accessibilityLabel={accessibilityLabel}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
