import type { QueryClient } from '@tanstack/react-query';
import { familyKeys } from '@/entities/family/model/queryKeys';
import {
  invalidateMedicationActivity,
  invalidateMedicationLists,
} from '@/entities/medication/model/queries';

export { invalidateMedicationActivity, invalidateMedicationLists };

/** 복약 체크·컨디션 후 medication + family 쿼리 갱신 */
export async function invalidateHomeActivity(qc: QueryClient): Promise<void> {
  await Promise.all([
    invalidateMedicationActivity(qc),
    qc.invalidateQueries({ queryKey: familyKeys.all }),
  ]);
}
