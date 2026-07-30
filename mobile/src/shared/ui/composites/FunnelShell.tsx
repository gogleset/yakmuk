import type { ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { Button } from '@/shared/ui/primitives/Button';
import { Icons } from '@/shared/ui/primitives/Icon';
import { FadeInView } from '@/shared/ui/composites/FadeInView';
import { KokiIllustration, type KokiVariant } from '@/shared/ui/composites/KokiIllustration';

type Props = {
  /** 0-based 현재 스텝 */
  stepIndex: number;
  /** 전체 스텝 수 (progress용) */
  stepCount: number;
  /** 큰 질문 타이틀 */
  title: string;
  children: ReactNode;
  /** 하단 CTA 라벨 */
  ctaLabel: string;
  onCtaPress: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  /** 이전 스텝 — stepIndex>0일 때 표시 */
  onBack?: () => void;
  /** 닫기 — dirty면 confirm */
  onClose?: () => void;
  /** 작성 중이면 닫기 시 confirm */
  dirty?: boolean;
  /** 입구·완료 스텝만 콕이 */
  kokiVariant?: KokiVariant;
  /** progress 숨김 (1스텝 퍼널 등) */
  hideProgress?: boolean;
};

/** 토스형 입력 퍼널 셸 — 전부 full page (#5A) */
export function FunnelShell({
  stepIndex,
  stepCount,
  title,
  children,
  ctaLabel,
  onCtaPress,
  ctaDisabled = false,
  ctaLoading = false,
  onBack,
  onClose,
  dirty = false,
  kokiVariant,
  hideProgress = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const showBack = stepIndex > 0 && !!onBack;

  const handleClose = () => {
    if (!onClose) return;
    if (!dirty) {
      onClose();
      return;
    }
    Alert.alert('작성을 그만둘까요?', '입력한 내용은 저장되지 않아요.', [
      { text: '계속 작성', style: 'cancel' },
      { text: '나가기', style: 'destructive', onPress: onClose },
    ]);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      style={{ backgroundColor: COLORS.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        className="flex-1"
        style={{
          paddingTop: insets.top + LAYOUT.sheet.headerPaddingTop,
          paddingBottom: insets.bottom + LAYOUT.sheet.paddingBottomExtra,
        }}
      >
        {/* 상단: back · close */}
        <View className="mb-3 flex-row items-center justify-between px-5">
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전"
              hitSlop={LAYOUT.hitSlop.md}
              onPress={onBack}
              className="min-w-[44px]"
            >
              <Icons.ChevronLeft size={LAYOUT.icon.xl} color={COLORS.brand} />
            </Pressable>
          ) : (
            <View className="min-w-[44px]" />
          )}

          <View className="flex-1" />

          {onClose ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={LAYOUT.hitSlop.md}
              onPress={handleClose}
              className="min-w-[44px] items-end"
            >
              <Icons.X size={LAYOUT.icon.lg} color={COLORS.muted} />
            </Pressable>
          ) : (
            <View className="min-w-[44px]" />
          )}
        </View>

        {/* 약한 progress bar */}
        {!hideProgress && stepCount > 1 ? (
          <View className="mx-5 mb-4 h-1 overflow-hidden rounded-full bg-brand-soft">
            <View
              className="h-full rounded-full bg-brand"
              style={{
                width: `${Math.min(100, ((stepIndex + 1) / stepCount) * 100)}%`,
              }}
            />
          </View>
        ) : null}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-5 pb-4"
          contentContainerStyle={{ gap: LAYOUT.sheet.contentGap }}
        >
          <FadeInView key={stepIndex} className="gap-3">
            {kokiVariant ? (
              <View className="items-center py-2">
                <KokiIllustration variant={kokiVariant} size={120} />
              </View>
            ) : null}
            <Text className="text-2xl font-bold text-brand">{title}</Text>
            {children}
          </FadeInView>
        </ScrollView>

        <View className="px-5 pt-2">
          <Button
            label={ctaLoading ? '잠시만요…' : ctaLabel}
            disabled={ctaDisabled || ctaLoading}
            onPress={onCtaPress}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
