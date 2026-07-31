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
  | 'heart';

// composites → ui → shared → src → mobile/assets
// family/lantern/heart는 정식 컷 오기 전 기존 파일 유지
const KOKI_SOURCES: Record<KokiVariant, number> = {
  welcome: require('../../../../assets/koki/koki_wave.png'),
  thinking: require('../../../../assets/koki/koki_thinking.png'),
  happy: require('../../../../assets/koki/koki_thanks.png'),
  done: require('../../../../assets/koki/koki_done.png'),
  family: require('../../../../assets/koki/family.png'),
  streak: require('../../../../assets/koki/koki_streak.png'),
  worried: require('../../../../assets/koki/koki_worried.png'),
  cheer: require('../../../../assets/koki/koki_cheer.png'),
  pill: require('../../../../assets/koki/koki_medicine.png'),
  lantern: require('../../../../assets/koki/lantern.png'),
  heart: require('../../../../assets/koki/heart.png'),
};

type Props = {
  variant: KokiVariant;
  size?: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

/** 브랜드 컷 슬롯 — variant별 placeholder/정식 PNG */
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
