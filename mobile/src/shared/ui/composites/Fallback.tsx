import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/shared/lib/cn';
import { Body } from '@/shared/ui/primitives/Typography';

type Props = ViewProps & {
  /** 가운데 이미지·일러스트 (콕이, 아이콘 등) */
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
};

/**
 * 공통 fallback / empty / 예외 UI.
 * 시트·리스트: 기본 compact. 화면 남은 높이 채울 때만 `fill`.
 */
export function Fallback({
  image,
  message,
  className,
  messageClassName,
  fill = false,
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
      <Body
        className={cn(
          'text-center text-base font-bold leading-6 text-text',
          messageClassName,
        )}
      >
        {message}
      </Body>
    </View>
  );
}
