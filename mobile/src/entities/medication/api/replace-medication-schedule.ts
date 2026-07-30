import { addMedications } from '@/entities/medication/api/add-medication';
import { deleteMedication } from '@/entities/medication/api/delete-medication';
import type { MedScheduleSlot } from '@/entities/medication/lib/daysMask';
import type { Medication } from '@/entities/medication/model/types';
import { ERRORS } from '@/shared/copy';

/** 기존 슬롯 soft-delete 후 동일 이름·일정으로 재등록 */
export async function replaceMedicationSchedule(input: {
  userId: string;
  replaceMedicationIds: number[];
  name: string;
  slots: MedScheduleSlot[];
}): Promise<Medication[]> {
  if (input.slots.length === 0) {
    throw new Error(ERRORS.med.scheduleEmpty);
  }

  for (const medicationId of input.replaceMedicationIds) {
    await deleteMedication(medicationId);
  }

  return addMedications({
    userId: input.userId,
    name: input.name,
    slots: input.slots,
  });
}
