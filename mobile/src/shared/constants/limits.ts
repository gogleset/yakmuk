/** 입력·초대·복약 등 도메인 한도 */
export const LIMITS = {
  inviteCodeLength: 6,
  /** 초대/복구 코드 letterSpacing */
  inviteCodeLetterSpacing: 6,
  nicknameMaxLength: 20,
  familyNameMaxLength: 30,
  /** 가족당 초대 슬롯 (DB unified invite limit과 동기) */
  maxFamilyInvites: 4,
  /** 하루 복용 시간 슬롯 상한 */
  maxTimeSlots: 6,
  /** 복약 기본 시각 (HH:MM) */
  defaultDoseTime: '08:00',
  /** TimePicker 분 단위 */
  doseMinuteInterval: 5,
  /** 약 검색 최소 글자 */
  drugSearchMinQueryLength: 2,
  /** 약 검색 debounce (ms) */
  drugSearchDebounceMs: 350,
} as const;
