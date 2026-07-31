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

/** 검색 썸네일 — 로드 실패·URL 없으면 알약 아이콘 (DB 저장 안 함) */
function normalizeImageUrl(url: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // 공공 API http → https (iOS ATS)
  if (trimmed.startsWith('http://')) {
    return `https://${trimmed.slice('http://'.length)}`;
  }
  return trimmed;
}

function DrugThumbnail({
  imageUrl,
  size,
}: {
  imageUrl: string | null;
  size: number;
}) {
  const [failed, setFailed] = useState(false);
  const uri = normalizeImageUrl(imageUrl);
  const showImage = Boolean(uri) && !failed;

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-xl bg-brand-soft"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          source={{ uri: uri! }}
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

/** 검색/상세 미리보기 — 리스트·상세에 썸네일 */
export function DrugSearchPreview({
  item,
  variant = 'compact',
  className,
}: Props) {
  if (variant === 'detail') {
    return (
      <View className={cn('gap-3', className)}>
        <View className="items-center py-1">
          <DrugThumbnail imageUrl={item.itemImage} size={128} />
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
      <DrugThumbnail imageUrl={item.itemImage} size={56} />
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

function DrugDetailFields({ item }: { item: DrugSearchItem }) {
  const fields: { label: string; value: string | null; lines?: number }[] = [
    { label: '효능', value: item.efficacy, lines: 8 },
    { label: '복용법', value: item.useMethod, lines: 6 },
    { label: '보관법', value: item.storage, lines: 4 },
    { label: '유의사항', value: item.warning, lines: 6 },
  ];

  const visibleFields = fields.filter((field) => field.value);
  if (visibleFields.length === 0) {
    return <Muted className="text-center">상세 정보가 없어요.</Muted>;
  }

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
