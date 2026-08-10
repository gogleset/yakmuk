import { LIMITS } from '@/shared/constants';

/** 에러·검증·mutation 타이틀 — 사용자에게 보이는 실패 문구 */
export const ERRORS = {
  fallback: '잠시 후 다시 시도해 주세요',
  network: '네트워크를 확인해 주세요',
  requestFailed: '잠시 후 다시 시도해 주세요',
  responseParse: '응답을 해석하지 못했어요',

  auth: {
    required: '로그인이 필요해요',
    loginFailed: '로그인하지 못했어요',
    logoutFailed: '로그아웃하지 못했어요',
    withdrawFailed: '탈퇴하지 못했어요',
    sessionMismatch: '로그인 정보가 맞지 않아요. 로그아웃 후 다시 로그인해 주세요',
    sessionExpired: '로그인이 만료됐어요. 다시 로그인해 주세요',
    profileNotFound: '프로필을 찾을 수 없어요. 다시 로그인해 주세요',
    profileLoadFailed: '프로필을 불러오지 못했어요',
    appleIosOnly: 'Apple 로그인은 iPhone에서만 할 수 있어요',
    googleWebClientMissing:
      'Google 로그인을 아직 설정하지 않았어요. EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID를 넣어 주세요',
    googleDeveloperError:
      'Google 앱 설정이 맞지 않아요. Android Client SHA-1을 android/app/debug.keystore 기준으로 다시 등록해 주세요',
    googlePlayServicesMissing: 'Google Play 서비스를 사용할 수 없어요',
  },

  family: {
    nameRequired: '가족 이름을 입력해 주세요',
    nicknameRequired: '닉네임을 입력해 주세요',
    createFailed: '가족을 만들지 못했어요',
    renameFailed: '가족 이름을 바꾸지 못했어요',
    nicknameChangeFailed: '닉네임을 바꾸지 못했어요',
    removeMemberFailed: '멤버를 내보내지 못했어요',
    deleteFailed: '가족을 삭제하지 못했어요',
    leaderOnly: '가족장만 할 수 있어요',
    alreadyInFamily: '이미 가족에 속해 있어요',
    memberNotFound: '가족 구성원을 찾을 수 없어요',
    cannotRemoveSelf: '자기 자신은 내보낼 수 없어요',
    cannotRemoveLeader: '가족장은 내보낼 수 없어요',
    ackFailed: '확인을 남기지 못했어요',
  },

  invite: {
    joinFailed: '가족에 참여하지 못했어요',
    createFailed: '초대를 보내지 못했어요',
    deleteFailed: '초대를 삭제하지 못했어요',
    reissueFailed: '초대장을 다시 만들지 못했어요',
    peekFailed: '초대장을 확인하지 못했어요',
    labelRequired: '호칭을 알려 주세요',
    notFound: '초대장을 찾을 수 없어요',
    alreadyClaimed:
      '이미 사용된 초대장이에요. 가족장에게 새 초대장을 받아 다시 들어와 주세요',
    notFoundOrClaimed: '초대장을 찾을 수 없거나 이미 사용됐어요',
    codeGenFailed: '초대장을 만들지 못했어요. 다시 시도해 주세요',
    invalidCode: '초대장이 올바르지 않아요',
    invalidRole: '역할이 올바르지 않아요',
    codeLength: `초대장은 ${LIMITS.inviteCodeLength}글자예요`,
    limitReached: `자리는 최대 ${LIMITS.maxFamilyInvites}명까지예요`,
  },

  recovery: {
    createFailed: '복구 코드를 만들지 못했어요',
    codeGenFailed: '복구 코드를 만들지 못했어요. 다시 시도해 주세요',
    cannotRecoverSelf: '자기 자신은 복구 코드를 만들 수 없어요',
    cannotRecoverLeader: '가족장은 복구 코드 대상이 아니에요',
  },

  med: {
    addFailed: '약을 추가하지 못했어요',
    updateFailed: '약을 수정하지 못했어요',
    deleteFailed: '약을 삭제하지 못했어요',
    checkFailed: '복약 체크를 남기지 못했어요',
    scheduleEmpty: '일정이 비어 있어요',
    nameRequired: '이름을 적어 주세요',
    searchFailed: '약 검색을 하지 못했어요',
    searchNetwork: '약 정보를 불러오지 못했어요. 네트워크를 확인해 주세요',
    searchForbidden: '약 검색이 막혀 있어요. 잠시 후 다시 시도해 주세요',
    searchParse: '약 검색 결과를 읽지 못했어요',
    dosePairRequired: '용량과 단위를 같이 적어 주세요',
    doseInvalid: '용량을 확인해 주세요',
    doseTooLarge: '용량이 너무 커요',
    metaTooLong: '글자가 너무 많아요',
  },

  condition: {
    saveFailed: '컨디션을 전하지 못했어요',
  },

  constraint: '요청을 처리하지 못했어요. 다시 시도해 주세요',
} as const;

/** 백엔드 raise exception 키 → ERRORS 문구 */
export const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  'not authenticated': ERRORS.auth.required,
  'family name required': ERRORS.family.nameRequired,
  'nickname required': ERRORS.family.nicknameRequired,
  'profile not found': ERRORS.auth.profileNotFound,
  'family leader required': ERRORS.family.leaderOnly,
  'invite not found': ERRORS.invite.notFound,
  'invite already claimed': ERRORS.invite.alreadyClaimed,
  'invite not found or already claimed': ERRORS.invite.notFoundOrClaimed,
  'invite code generation failed': ERRORS.invite.codeGenFailed,
  'recovery code generation failed': ERRORS.recovery.codeGenFailed,
  'invalid invite code': ERRORS.invite.invalidCode,
  'already in a family': ERRORS.family.alreadyInFamily,
  'invited_as required': ERRORS.invite.labelRequired,
  'invalid target_role': ERRORS.invite.invalidRole,
  'cannot remove yourself': ERRORS.family.cannotRemoveSelf,
  'cannot recover yourself': ERRORS.recovery.cannotRecoverSelf,
  'member not found': ERRORS.family.memberNotFound,
  'cannot remove family leader': ERRORS.family.cannotRemoveLeader,
  'cannot recover family leader': ERRORS.recovery.cannotRecoverLeader,
};

/** DB/네트워크 등 기술 오류 패턴 */
export const TECHNICAL_ERROR_PATTERNS: Array<{
  test: RegExp;
  message: string;
}> = [
  {
    test: /families_created_by_fkey|created_by_fkey/i,
    message: ERRORS.auth.sessionMismatch,
  },
  {
    test: /violates foreign key constraint|violates unique constraint|duplicate key/i,
    message: ERRORS.constraint,
  },
  {
    test: /jwt|session|token|refresh_token|not authenticated/i,
    message: ERRORS.auth.sessionExpired,
  },
  {
    test: /network|fetch failed|failed to fetch|network request failed/i,
    message: ERRORS.network,
  },
  {
    test: /invite limit reached/i,
    message: ERRORS.invite.limitReached,
  },
];
