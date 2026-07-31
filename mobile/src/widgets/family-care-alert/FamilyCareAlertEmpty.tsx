import { Text, View } from 'react-native';
import { COPY } from '@/shared/copy';
import { KokiIllustration } from '@/shared/ui';

/** 케어 알림 없을 때 — 콕이 cheer + 응원 카피 */
export function FamilyCareAlertEmpty() {
  return (
    <View className="items-center justify-center gap-3 px-4 py-6">
      <KokiIllustration variant="cheer" size={120} />
      <Text className="text-center text-sm font-medium text-text">
        {COPY.family.careEmpty}
      </Text>
    </View>
  );
}
