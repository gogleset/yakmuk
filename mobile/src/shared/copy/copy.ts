/** 중복 product 문구 — confirm / empty / notif / stalled */
export const COPY = {
  med: {
    deleteTitle: '약을 삭제할까요?',
    deleteBody: (name: string) => `"${name}" 일정을 지울게요.`,
    nameAlertTitle: '약 이름을 알려 주세요',
    weekdayAlertTitle: '먹는 요일을 골라 주세요',
    weekdayRequired: '먹을 요일을 하나 이상 골라 주세요',
    scheduleAlertTitle: '일정을 확인해 주세요',
    noScheduleToSave: '저장할 일정이 없어요',
    loadFailed: '약 목록을 불러오지 못했어요',
    emptyRegistered: '아직 등록한 약이 없어요',
    emptyRegisteredHint: '약을 등록하고 복용을 기록해볼까요?',
    emptyRegisteredCta: '첫 약 등록하기',
    emptyToday: '오늘은 먹을 약이 없어요',
    emptyTodayHint: '다른 요일 일정은 캘린더에서 볼 수 있어요.',
    emptyPastDay: '이 날에는 먹을 약이 없어요.',
    addFab: '약 추가',
    /** 오늘 진행 — 전부 완료 */
    allDoneToday: '오늘 다 먹었어요',
    /** 오늘 진행 — 남은 개수 */
    remainingToday: (count: number) => `약 ${count}개 남았어요`,
    /** 오늘 진행 — taken/total 분수 */
    progressFraction: (taken: number, total: number) => `${taken}/${total}`,
    /** 오늘 체크 배너 */
    checkPromptTitle: '약 복용 시간을\n체크해볼까요?',
    checkPromptDone: '다 먹었어요! 잘했어요',
    markAllTaken: '다 먹었어요!',
    streakDays: (days: number) => `${days}일 연속이에요`,
    timeSlot: {
      morning: '아침',
      lunch: '점심',
      evening: '저녁',
      bedtime: '취침 전',
    },
    timePicker: {
      hour: '시',
      minute: '분',
      am: '오전',
      pm: '오후',
    },
  },

  family: {
    emptyMembers: '아직 함께하는 가족이 없어요',
  },

  invite: {
    claimedCannotDeleteTitle: '연결된 초대예요',
    claimedCannotDeleteBody: '이미 연결된 초대는 지울 수 없어요.',
    deleteTitle: '초대를 삭제할까요?',
    reissueTitle: '코드를 재발급할까요?',
    reissueBody: '기존 코드·QR은 더 이상 쓸 수 없어요.',
    limitTitle: '초대가 가득 찼어요',
    labelAlertTitle: '호칭을 알려 주세요',
    labelAlertBody: '예: 아빠, 할머니',
  },

  alert: {
    medCheckStalled: '복약 체크가 멈춘 것 같아요. 안부를 한번 봐 주세요.',
  },

  condition: {
    savedTitle: '저장했어요',
    savedBody: '오늘 컨디션을 가족에게 전했어요',
    defaultBadMessage: '오늘 컨디션이 좋지 않아요',
    prompt: '오늘 컨디션은 어때요?',
    messagePlaceholder: '가족에게 전할 한마디 (선택)',
    submit: '컨디션 남기기',
  },

  calendar: {
    legendDone: '다 먹었어요',
    legendPartial: '일부만',
    legendMissed: '안 먹었어요',
    legendScheduled: '약 있는 날',
  },

  notif: {
    channel: '복약 알림',
    doseTitle: '약 먹을 시간이에요',
    doseBody: (name: string, time: string) => `${name} · ${time}`,
  },

  a11y: {
    longPressDelete: '길게 누르면 삭제할 수 있어요',
  },

  common: {
    retryLater: '잠시 후 다시 시도해 주세요',
  },
} as const;
