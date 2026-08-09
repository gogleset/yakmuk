import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/primitives/Button';
import { SectionTitle } from '@/shared/ui/primitives/Typography';

type Props = ViewProps & {
  /** 가운데 이미지·일러스트 (콕이 등) */
  image: ReactNode;
  /** 이미지 아래 설명 */
  message: string;
  className?: string;
  /** 설명 추가 클래스 */
  messageClassName?: string;
  /**
   * true면 부모 남은 세로를 채우고 가운데 정렬 (홈 empty 등).
   * BottomSheet·스크롤 안에서는 false(기본) — 콘텐츠 높이만.
   */
  fill?: boolean;
  /** 로드 실패 재시도 등 — round CTA */
  ctaLabel?: string;
  onCtaPress?: () => void;
};

/**
 * 공통 fallback / empty / 로드 실패 UI.
 * 형식: 로고(image) + 설명(message) + optional round CTA.
 * 시트·리스트: 기본 compact. 화면 남은 높이 채울 때만 `fill`.
 */
export function Fallback({
  image,
  message,
  className,
  messageClassName,
  fill = false,
  ctaLabel,
  onCtaPress,
  style,
  ...rest
}: Props) {
  return (
    <View
      className={cn(
        'w-full items-center justify-center gap-3 px-4',
        fill ? 'flex-1 py-6' : 'py-4',
        className,
      )}
      style={[{ alignSelf: 'stretch' }, style]}
      {...rest}
    >
      <View className="items-center justify-center">{image}</View>
      <SectionTitle
        tone="text"
        className={cn('text-center leading-6', messageClassName)}
      >
        {message}
      </SectionTitle>
      {ctaLabel && onCtaPress ? (
        <Button
          label={ctaLabel}
          shape="round"
          className="mt-1"
          onPress={onCtaPress}
        />
      ) : null}
    </View>
  );
}
