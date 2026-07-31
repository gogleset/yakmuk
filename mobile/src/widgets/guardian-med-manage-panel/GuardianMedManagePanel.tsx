import { useMemo } from 'react';
import { formatDaysMaskLabel } from '@/entities/medication/lib/daysMask';
import { groupMedsByScheduledTime } from '@/entities/medication/lib/timeSlots';
import type { Medication } from '@/entities/medication/model/types';
import { TimeSlotMedAccordion } from '@/entities/medication';
import { COPY } from '@/shared/copy';
import { Fallback, KokiIllustration } from '@/shared/ui';

type Props = {
  meds: Medication[];
  onEdit: (med: Medication) => void;
  onDelete: (med: Medication) => void;
  isError?: boolean;
};

/** 보호자: 피보호자 등록 약 관리 — 시간대 아코디언 */
export function GuardianMedManagePanel({
  meds,
  onEdit,
  onDelete,
  isError = false,
}: Props) {
  const medById = useMemo(() => {
    const map = new Map<number, Medication>();
    for (const med of meds) map.set(med.id, med);
    return map;
  }, [meds]);

  const groups = useMemo(
    () =>
      groupMedsByScheduledTime(meds).map((group) => ({
        scheduledTime: group.scheduledTime,
        slot: group.slot,
        entries: group.meds.map((med) => ({
          key: String(med.id),
          name: med.name,
          scheduledTime: med.scheduledTime,
          taken: false,
          caption: formatDaysMaskLabel(med.daysMask),
          color: med.color,
          doseAmount: med.doseAmount,
          doseUnit: med.doseUnit,
        })),
      })),
    [meds],
  );

  if (isError) {
    return (
      <Fallback
        image={<KokiIllustration variant="worried" size={72} />}
        message={COPY.med.loadFailed}
      />
    );
  }

  if (meds.length === 0) {
    return (
      <Fallback
        image={<KokiIllustration variant="thinking" size={72} />}
        message={COPY.med.emptyRegistered}
      />
    );
  }

  return (
    <TimeSlotMedAccordion
      variant="manage"
      groups={groups}
      onPressKey={(key) => {
        const med = medById.get(Number(key));
        if (med) onEdit(med);
      }}
      onLongPressKey={(key) => {
        const med = medById.get(Number(key));
        if (med) onDelete(med);
      }}
    />
  );
}
