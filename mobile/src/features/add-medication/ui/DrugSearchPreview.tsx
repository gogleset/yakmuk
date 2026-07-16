import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import type { DrugSearchItem } from '@/entities/medication/model/types';
import { COLORS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { Body, Caption, Muted } from '@/shared/ui';
import { Icons } from '@/shared/ui/primitives/Icon';

type Variant = 'compact' | 'detail';

type Props = {
  item: DrugSearchItem;
  variant?: Variant;
  className?: string;
};

/** 약 이미지 — 로드 실패 시 알약 아이콘 플레이스홀더 */
function DrugThumbnail({
  imageUrl,
  size,
}: {
  imageUrl: string | null;
  size: number;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-xl bg-brand-soft"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl! }}
          style={{ width: size, height: size }}
          resizeMode="contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icons.Pill size={size * 0.45} color={COLORS.brand} />
      )}
    </View>
  );
}

/** 검색/확인 단계 공통 약 정보 미리보기 */
export function DrugSearchPreview({
  item,
  variant = 'compact',
  className,
}: Props) {
  const imageSize = variant === 'detail' ? 112 : 64;

  if (variant === 'detail') {
    return (
      <View className={cn('gap-3', className)}>
        <View className="items-center">
          <DrugThumbnail imageUrl={item.itemImage} size={imageSize} />
        </View>

        <View className="gap-1">
          <Text className="text-center text-lg font-semibold text-brand">
            {item.itemName}
          </Text>
          <Muted className="text-center">{item.entpName}</Muted>
        </View>

        <DrugDetailFields item={item} />
      </View>
    );
  }

  return (
    <View className={cn('flex-row gap-3', className)}>
      <DrugThumbnail imageUrl={item.itemImage} size={imageSize} />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-semibold text-brand">{item.itemName}</Text>
        <Muted>{item.entpName}</Muted>
        {item.efficacy ? (
          <Body numberOfLines={2} className="mt-0.5 text-sm">
            {item.efficacy}
          </Body>
        ) : null}
        {item.useMethod ? (
          <Caption numberOfLines={1} className="text-brand-faint">
            {item.useMethod}
          </Caption>
        ) : null}
      </View>
    </View>
  );
}

/** 상세 필드 — 값이 있는 항목만 표시 */
function DrugDetailFields({ item }: { item: DrugSearchItem }) {
  const fields: { label: string; value: string | null; lines?: number }[] = [
    { label: '효능', value: item.efficacy, lines: 4 },
    { label: '복용법', value: item.useMethod, lines: 3 },
    { label: '보관법', value: item.storage, lines: 2 },
    { label: '주의', value: item.warning, lines: 3 },
  ];

  const visibleFields = fields.filter((field) => field.value);
  if (visibleFields.length === 0) return null;

  return (
    <View className="gap-2.5 pt-1">
      {visibleFields.map((field) => (
        <View key={field.label} className="gap-0.5">
          <Caption className="font-medium text-brand">{field.label}</Caption>
          <Body numberOfLines={field.lines} className="text-sm">
            {field.value}
          </Body>
        </View>
      ))}
    </View>
  );
}
