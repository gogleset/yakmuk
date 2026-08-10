/** 한글 주격 조사 가/이 */
function subjectGa(name: string): string {
  const ch = name.trim().slice(-1);
  if (!ch) return '가';
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return '가';
  return (code - 0xac00) % 28 === 0 ? '가' : '이';
}

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
    emptyPastDay: '이 날에는 먹을 약이 없어요',
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
      dawn: '새벽',
      morning: '아침',
      lunch: '점심',
      afternoon: '오후',
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
    title: '가족 안부',
    /** 가족명 로딩 전 섹션 제목 fallback */
    todayStatusFallback: '가족',
    manage: '관리',
    recentFeed: '최근 소식',
    /** 다른 멤버 수 (본인 제외) */
    memberCount: (count: number) => `우리 가족 ${count}명`,
    seeMoreFeed: '더보기',
    feedStackCollapseA11y: (title: string) => `${title} 소식 접기`,
    feedStackExpandA11y: (title: string, count: number) =>
      `${title} 소식 ${count}개, 펼치려면 두 번 탭하세요`,
    emptyMembers: '아직 가족이 등록되지 않았어요',
    emptyMembersMessage: '가족을 초대해서 서로의 하루를 챙겨보세요.',
    inviteCta: '가족 초대하기',
    emptyFeed: '아직 소식이 없어요',
    emptyFeedMessage: '가족이 약을 체크하면 여기에 보여요.',
    loadFailed: '가족 정보를 불러오지 못했어요',
    loadFailedFeed: '소식을 불러오지 못했어요',
    loadFailedAlerts: '알림을 불러오지 못했어요',
    statusAnbu: '안부',
    statusAllTaken: '다 먹음',
    /** 오늘 아직 남은 약 있음 — 숫자 없이 진행 표현 */
    statusInProgress: '진행 중',
    statusNoMeds: '약 없음',
    /** 닉네임 (초대 호칭) */
    memberTitle: (nickname: string, invitedAs: string | null | undefined) => {
      const as = invitedAs?.trim();
      return as ? `${nickname} (${as})` : nickname;
    },
    feedTaken: (who: string) => `${who}${subjectGa(who)} 약을 복용했어요`,
    feedAllTaken: (who: string) => `${who}${subjectGa(who)} 약을 다 먹었어요`,
    /** label = 좋아요 / 보통이에요 / 안 좋아요 */
    feedCondition: (who: string, label: string) =>
      `${who}의 컨디션이 ${label}`,
    feedFallback: (who: string) => `${who}님 소식`,
    careAck: '확인했어요',
    careStuckTitle: (who: string) => `${who}의 약 안부가 궁금해요`,
    careStuckDays: (days: number) => `${days}일째 확인이 없어요`,
    careBadTitle: (who: string) => `${who}의 컨디션이 걱정돼요`,
    careBadBody: (when: string, label: string) =>
      `${when} '${label}'으로 기록했어요`,
    careEmpty: '서로의 하루를 응원해요',
    /** 푸시 카피용 — 닉네임 없을 때 */
    memberFallback: '가족',
    /** glance 알림 한 줄 — `이름 · 라벨` */
    glanceLine: (who: string, status: string) => `${who} · ${status}`,
    /** 주간 안부 (인앱) */
    weeklyTitle: '이번 주 안부',
    weeklyOk: '이번 주 괜찮았어요',
    weeklyMostly: '이번 주 대체로 잘 챙겼어요',
    weeklyUneven: '이번 주 챙김이 들쑥날쑥했어요',
    weeklyNoMeds: '이번 주 등록된 약이 없어요',
    /** 특이일 묶음 — `금, 토, 일 약이 조금 남았어요` */
    weeklyMissedDays: (weekdays: string) => `${weekdays} 약이 조금 남았어요`,
    weeklyBadDays: (weekdays: string) => `${weekdays} 컨디션이 안 좋았어요`,
    weeklyAck: '확인했어요',
    weeklyEmptyAnomaly: '특이했던 날은 없어요',
  },

  /** 원격 안심 푸시 (care-push) */
  push: {
    careTakenTitle: '약 챙겼어요',
    careTakenBody: (who: string) => `${who} 님이 약을 먹었어요`,
    careStuckTitle: '안부가 궁금해요',
    careStuckBody: (who: string) =>
      `${who} 님 복약 체크가 멈춘 것 같아요`,
  },

  /** P2 초대코드 조인 */
  join: {
    codeTitle: '초대코드를 입력해 주세요',
    codeHint: '가족장이 준 초대코드 6자리',
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
    claimedCannotDeleteBody:
      '이미 연결된 초대·다시 들어오기 대기는 지울 수 없어요.',
    deleteTitle: '초대를 삭제할까요?',
    reissueTitle: '코드를 재발급할까요?',
    reissueBody: '기존 코드·QR은 더 이상 쓸 수 없어요.',
    reissueConnectedBody:
      '새 코드로 바뀌고, 지금 들어와 있는 기기는 로그아웃돼요. 새 코드로 다시 들어와야 약·기록이 이어져요.',
    reissueAction: '코드 재발급',
    statusWaiting: '대기',
    statusConnected: '연결됨',
    statusReentry: '다시 들어오기 대기',
    limitTitle: '초대가 가득 찼어요',
    labelAlertTitle: '호칭을 알려 주세요',
    labelAlertBody: '예: 아빠, 할머니',
  },

  auth: {
    forceSignOutTitle: '다시 로그인이 필요해요',
    forceSignOutBody:
      '가족장이 초대코드를 바꿨어요. 새 코드로 다시 들어와 주세요.',
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

  glance: {
    channel: '가족 한눈',
    title: '가족 안부',
    permissionHint: '알림을 허용하면 앱 밖에서도 가족 상태를 볼 수 있어요.',
  },

  notif: {
    channel: '복약 알림',
    doseTitle: '약 먹을 시간이에요',
    doseBody: (name: string, time: string) => `${name} · ${time}`,
    /** 풀페이지 히어로 — 시간 위 */
    alarmHeadline: '약 드실 시간이에요!',
    /** 시간 슬롯 알림 토글 (짧은 라벨) */
    slotOn: '알림 켜짐',
    slotOff: '알림 꺼짐',
    alarmTaken: '먹었어요',
    alarmTakeAll: '모두 먹었어요',
    /** 설정 2depth — OS 권한 스위치 */
    settingsGroup: '약 알림',
    basicSwitch: '기본 알림',
    fullPageSwitch: '풀페이지 알림',
    /** Android 12+ — 알림 권한과 별개 (Alarms & reminders) */
    exactAlarmTitle: '정확한 알림 시간',
    exactAlarmBody:
      '복약 알림이 제시간에 울리려면 「알람 및 리마인더」 권한이 필요해요. 알림 허용과는 따로예요.',
    exactAlarmOpen: '설정 열기',
    exactAlarmLater: '나중에',
    exactAlarmSettings: '알람·리마인더 권한',
    fsiTitle: '화면 켜고 앱 열기',
    fsiBody:
      '화면이 꺼져 있거나 앱이 종료돼 있어도 복약 화면을 띄우려면 「전체 화면 알림」을 허용해 주세요.',
    fsiSettings: '전체 화면 알림 권한',
    fsiStatusAllowed: '허용됨',
    fsiStatusDenied: '꺼짐 · 설정에서 켜 주세요',
    fsiStatusUnknown: '확인 필요',
    testFsiDenied:
      '「전체 화면 알림」이 꺼져 있어요. 설정에서 켠 뒤 다시 눌러 주세요.',
    /** __DEV__ 설정 — 풀페이지/FSI 테스트 */
    testFullPage: '풀페이지 알림 미리보기',
    testFullPageMulti: '풀페이지 알림 (다약)',
    testFsi: 'Android FSI (60초·잠금/꺼짐)',
    testFsiOk:
      '60초 뒤. 화면 끄거나 잠그면 FSI로 앱이 떠요. 다른 앱 위에선 헤드업만(탭 필요) — Android 스펙.',
    testFsiImmediate: 'Android FSI 즉시(헤드업)',
    testFsiImmediateOk:
      '잠금이 아니면 헤드업+풀페이지로 가요. 진짜 FSI는 「60초·잠금/꺼짐」으로 보세요.',
    testFsiUnavailable: '개발 빌드(Android)에서만 쓸 수 있어요. Expo Go는 안 돼요.',
    testDelay: '90초 뒤 FSI 테스트',
    testDelayOk: (sec: number) =>
      `${sec}초 뒤. 잠금/화면꺼짐이면 FSI, 다른 앱이면 헤드업. 스케줄은 reconcile에 안 지워짐.`,
    testDelayBody: (sec: number) => `${sec}초 테스트 알림`,
    testDelayExactOff:
      '「알람 및 리마인더」가 꺼져 있어요. 설정에서 켠 뒤 다시 눌러 주세요.',
  },

  a11y: {
    longPressDelete: '길게 누르면 삭제할 수 있어요',
  },

  settings: {
    startScreen: '첫 화면',
    startScreenHome: '기록',
    startScreenFamily: '가족',
    careGlance: '가족 알림',
    weeklyDigest: '주간 안부',
    animations: '애니메이션',
    animationsHint: '저전력일 때는 자동으로 꺼져요',
  },

  common: {
    retryLater: '잠시 후 다시 시도해 주세요',
    retry: '다시 시도',
  },
} as const;
