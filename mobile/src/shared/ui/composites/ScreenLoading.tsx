import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/shared/config/theme';

/**
 * 스켈레톤 없는 게이트/초기 로딩용 풀페이지 스피너.
 * (기록·가족 등 콘텐츠 로딩은 Skeleton 사용)
 */
export function ScreenLoading() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator size="large" color={COLORS.brand} />
    </View>
  );
}
