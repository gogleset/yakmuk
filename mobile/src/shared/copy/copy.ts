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
    progressFraction: (taken: number, total: number) =>
      `${taken} / ${total}`,
    /** 오늘 체크 배너 */
    checkPromptTitle: '약 복용 시간을 체크해볼까요?',
    checkPromptDone: '다 먹었어요! 잘했어요',
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
    search: '검색',
    searchEmpty: '검색 결과가 없어요.',
    detailView: '자세히보기',
    selectThisDrug: '이 약 선택',
    confirmName: '이 이름으로',
    changeName: '변경',
    nextStep: '다음',
    prevStep: '이전',
    resetForm: '초기화',
    resetConfirmTitle: '초기화할까요?',
    resetConfirmBody: '입력한 내용이 모두 사라져요.',
    efficacyLabel: '효능',
    efficacyPlaceholder: '예) 해열 · 감기 증상 완화',
    useMethodLabel: '복용법',
    useMethodPlaceholder: '예) 하루 3회, 식후 1정',
    storageLabel: '보관법',
    storagePlaceholder: '예) 실온 보관, 직사광선 피하기',
    warningLabel: '유의사항',
    warningPlaceholder: '예) 과량 복용 주의, 임부 상담',
    doseLabel: '용량',
    doseAmountPlaceholder: '예) 1',
    doseUnitPlaceholder: '단위',
    colorLabel: '구분 색',
  },

  family: {
    emptyMembers: '아직 함께하는 가족이 없어요',
  },

  /** P2 초대코드 조인 */
  join: {
    codeTitle: '초대코드를 입력해 주세요',
    peekLoading: '초대 확인 중…',
    nicknameTitle: '콕이는\n뭐라고 불러드릴까요?',
    nicknamePlaceholder: '예) 엄마, 언니, 아들 등 (선택)',
    later: '나중에 할게요',
    next: '다음',
    participate: '참여하기',
    connecting: '연결 중…',
    familyOf: (leaderNickname: string) => `${leaderNickname}님의 가족`,
    recoveryHint: '기기 복구 · 약·기록 유지',
  },

  /** F1 Welcome — 콕이 1인칭 히어로 · 가족장 시작 */
  welcome: {
    title: '안녕하세요.\n저는 콕이에요',
    subtitle: '멀리 있어도\n가족의 안부를 함께\n살펴볼게요.',
    createFamily: '가족을 만들어요',
    hasInvite: '초대코드를 받았어요',
    loginTitle: '안부를 나누기 위해\n로그인이 필요해요',
    continueGoogle: 'Google로 계속',
    continueApple: 'Apple로 계속',
    familyNameTitle: '우리 가족을\n어떻게 부를까요?',
    familyNamePlaceholder: '예) 우리집, 행복한 가족 등',
    nicknameTitle: '콕이는\n뭐라고 불러드릴까요?',
    nicknamePlaceholder: '예) 엄마, 아빠, 언니 등',
    next: '다음',
    create: '만들기',
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
    /** 이미 남긴 뒤 readonly 한 줄 */
    savedPrompt: (label: string) => `오늘 컨디션은 ${label}이에요!`,
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
