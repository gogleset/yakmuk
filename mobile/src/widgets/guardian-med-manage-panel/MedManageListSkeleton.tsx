import { TimeSlotAccordionSkeleton } from '@/entities/medication';

/** 멤버 상세 · 등록 약 아코디언 자리 */
export function MedManageListSkeleton({
  groups = 2,
}: {
  groups?: number;
}) {
  return (
    <TimeSlotAccordionSkeleton
      variant="manage"
      groups={groups}
      rowsPerGroup={2}
    />
  );
}
