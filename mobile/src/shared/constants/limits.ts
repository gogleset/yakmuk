/** 입력·초대·복약 등 도메인 한도 */
export const LIMITS = {
  inviteCodeLength: 6,
  /** 초대/복구 코드 letterSpacing */
  inviteCodeLetterSpacing: 6,
  nicknameMaxLength: 10,
  familyNameMaxLength: 20,
  /** 가족당 초대 슬롯 (DB unified invite limit과 동기) */
  maxFamilyInvites: 4,
  /** 하루 복용 시간 슬롯 상한 */
  maxTimeSlots: 6,
  /** 복약 기본 시각 (HH:MM) */
  defaultDoseTime: '08:00',
  /** 약 검색 최소 글자 */
  drugSearchMinQueryLength: 2,
  /** 약 메타 텍스트 상한 (효능·복용법 등) */
  medMetaMaxLength: 2000,
  /** 용량 숫자 상한 */
  medDoseAmountMax: 9999,
  /** 오늘 배너(완료↔컨디션) 자동 넘김 ms */
  todayBannerAutoAdvanceMs: 5000,
  /** 가족 탭 최근 소식 프리뷰 개수 */
  familyFeedPreviewCount: 3,
  /** 가족 최근 소식 조회 일수 (오늘 포함) */
  familyFeedWindowDays: 7,
} as const;
