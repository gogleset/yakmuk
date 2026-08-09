import { View } from 'react-native';
import { COPY } from '@/shared/copy';
import { KokiIllustration, LabelSm } from '@/shared/ui';

/** 케어 알림 없을 때 — 콕이 cheer + 응원 카피 */
export function FamilyCareAlertEmpty() {
  return (
    <View className="items-center justify-center gap-3 px-4 py-6">
      <KokiIllustration variant="cheer" size={120} />
      <LabelSm tone="text" className="text-center">
        {COPY.family.careEmpty}
      </LabelSm>
    </View>
  );
}
