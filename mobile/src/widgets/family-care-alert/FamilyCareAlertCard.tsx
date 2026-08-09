import { Pressable, View } from 'react-native';
import { LAYOUT, TONE_OUTLINE } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { Body, KokiIllustration, LabelSm, SectionTitle } from '@/shared/ui';
import type { CareAlertSlide } from './model/types';

type Props = {
  slide: CareAlertSlide;
  onAck: () => void;
  width?: number;
};

/** 케어 알림 카드 — 좌 콕이 · 우 카피·CTA · tone은 TONE_OUTLINE */
export function FamilyCareAlertCard({ slide, onAck, width }: Props) {
  const isStuck = slide.tone === 'stuck';
  // stuck도 soft 안부 — destructive(빨간) 잔소리 톤 금지
  const outline = TONE_OUTLINE.warning;

  return (
    <View style={width ? { width } : undefined} className="px-0">
      <View
        className="min-h-[148px] flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-5"
        style={[LAYOUT.shadow.sameFill, outline]}
      >
        <KokiIllustration variant="worried" size={112} />
        <View className="min-w-0 flex-1 gap-3">
          <View className="gap-1.5">
            <SectionTitle tone="text" className="leading-6" numberOfLines={2}>
              {slide.title}
            </SectionTitle>
            <Body className="text-sm leading-5" numberOfLines={2}>
              {slide.body}
            </Body>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.family.careAck}
            hitSlop={LAYOUT.hitSlop.sm}
            onPress={onAck}
            className="self-end rounded-full border bg-surface px-3.5 py-2"
            style={{ borderColor: outline.borderColor }}
          >
            <LabelSm tone={isStuck ? 'brand' : 'warning'}>
              {COPY.family.careAck}
            </LabelSm>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
