import {
  createDefaultScheduleDraft,
  type MedicationScheduleDraft,
} from "@/entities/medication/lib/scheduleDraft";

export type FormSurfaceMode = "create" | "edit";

export type FormVisibility = {
  showScheduleMode: boolean;
  showSameTimes: boolean;
  showDaysMode: boolean;
  showWeekdayPicker: boolean;
  showPerWeekdayTimes: boolean;
  showSubmit: boolean;
};

/** progressive disclosure — create는 이름 확정 후 same 분기 즉시 공개 */
export function resolveFormVisibility(input: {
  mode: FormSurfaceMode;
  nameConfirmed: boolean;
  draft: MedicationScheduleDraft;
}): FormVisibility {
  const unlocked = input.mode === "edit" || input.nameConfirmed;
  if (!unlocked) {
    return {
      showScheduleMode: false,
      showSameTimes: false,
      showDaysMode: false,
      showWeekdayPicker: false,
      showPerWeekdayTimes: false,
      showSubmit: false,
    };
  }

  const { draft } = input;
  if (draft.scheduleMode === "same") {
    return {
      showScheduleMode: true,
      showSameTimes: true,
      showDaysMode: true,
      showWeekdayPicker: draft.daysMode === "weekday",
      showPerWeekdayTimes: false,
      showSubmit: true,
    };
  }

  return {
    showScheduleMode: true,
    showSameTimes: false,
    showDaysMode: false,
    showWeekdayPicker: true,
    showPerWeekdayTimes: draft.weekdays.length > 0,
    showSubmit: true,
  };
}

/** 이름 클리어·재검색 시 뒤 섹션 접힘 + draft 리셋 */
export function collapseOnNameCleared(_prev: MedicationScheduleDraft): {
  nameConfirmed: false;
  draft: MedicationScheduleDraft;
} {
  return {
    nameConfirmed: false,
    draft: createDefaultScheduleDraft(),
  };
}
