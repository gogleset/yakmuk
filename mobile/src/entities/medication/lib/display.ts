import type { ConditionValue } from '@/entities/medication/model/types';

export const CONDITION_LABEL: Record<ConditionValue, string> = {
  GOOD: '좋음',
  NORMAL: '보통',
  BAD: '아픔',
};
