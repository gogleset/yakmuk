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
import {
  KokiIllustration,
  type KokiVariant,
} from '@/shared/ui/composites/KokiIllustration';

type Props = {
  /** 0-based 현재 스텝 */
  stepIndex: number;
  /** 전체 스텝 수 (progress용) */
  stepCount: number;
  /** 큰 질문 타이틀 (줄바꿈 허용) */
  title: string;
  children: ReactNode;
  /** 하단 CTA 라벨 */
  ctaLabel: string;
  onCtaPress: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  /** 이전 — step 0에서도 넘기면 표시 (예: 로그인으로) */
  onBack?: () => void;
  /** 닫기 — dirty면 confirm */
  onClose?: () => void;
  /** 작성 중이면 닫기 시 confirm */
  dirty?: boolean;
  /** 입구·완료 스텝만 콕이 (타이틀 위) */
  kokiVariant?: KokiVariant;
  kokiSize?: number;
  /** progress 숨김 (P1 목업 등) */
  hideProgress?: boolean;
  /** stagger 순차 등장 (콕이 → 타이틀 → 필드/CTA) */
  stagger?: boolean;
};

/** 토스형 입력 퍼널 셸 — 전부 full page (#5B) */
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
  kokiSize = 168,
  hideProgress = false,
  stagger = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const showBack = !!onBack;

  const handleBack = () => {
    if (!onBack) return;
    // step 0 + dirty = 퍼널 이탈(로그인 복귀 등) — confirm
    if (dirty && stepIndex === 0) {
      Alert.alert('작성을 그만둘까요?', '입력한 내용은 저장되지 않아요.', [
        { text: '계속 작성', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: onBack },
      ]);
      return;
    }
    onBack();
  };

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

  // stagger 끄면 한 덩어리로 즉시 표시 (step 고정 0)
  const mediaStep = stagger ? 0 : 0;
  const titleStep = stagger ? 1 : 0;
  const bodyStep = stagger ? 2 : 0;

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
              onPress={handleBack}
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
          contentContainerClassName="flex-grow justify-center px-5 pb-4"
          contentContainerStyle={{ gap: LAYOUT.sheet.contentGap }}
        >
          {/* key로 스텝 전환 시 stagger 재시작 */}
          <View key={stepIndex} className="gap-4">
            {kokiVariant ? (
              <FadeInView
                step={mediaStep}
                className="items-center py-1"
              >
                <KokiIllustration variant={kokiVariant} size={kokiSize} />
              </FadeInView>
            ) : null}
            <FadeInView step={titleStep}>
              <Text className="text-2xl font-bold leading-snug text-text">
                {title}
              </Text>
            </FadeInView>
            <FadeInView step={bodyStep} className="gap-2">
              {children}
            </FadeInView>
          </View>
        </ScrollView>

        <FadeInView key={`cta-${stepIndex}`} step={bodyStep} className="px-5 pt-2">
          <Button
            label={ctaLoading ? '잠시만요…' : ctaLabel}
            disabled={ctaDisabled || ctaLoading}
            onPress={onCtaPress}
          />
        </FadeInView>
      </View>
    </KeyboardAvoidingView>
  );
}
