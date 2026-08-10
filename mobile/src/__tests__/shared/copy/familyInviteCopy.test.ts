import { ACTIONS, COPY, ERRORS } from '@/shared/copy';

describe('family invite copy SoT', () => {
  it('uses invitation wording (not code issuance)', () => {
    expect(COPY.welcome.hasInvite).toBe('초대장을 받았어요');
    expect(COPY.join.codeTitle).toContain('초대장');
    expect(COPY.join.codeHint).toContain('여섯 글자');
    expect(COPY.invite.reissueTitle).toBe('초대장을 새로 줄까요?');
    expect(COPY.invite.reissueAction).toBe('초대장 새로 주기');
    expect(COPY.invite.statusWaiting).toBe('아직 안 오셨어요');
    expect(COPY.invite.statusConnected).toBe('함께 있어요');
    expect(COPY.family.inviteCta).toBe('가족 부르기');
    expect(COPY.family.endFamily).toBe('이 가족을 끝내기');
    expect(COPY.family.manageTitle).toBe('가족');
    expect(COPY.invite.funnelWhoTitle).toBe('누구를 부를까요?');
    expect(COPY.invite.funnelReadyTitle).toBe('초대장을 준비했어요');
    expect(COPY.invite.funnelShare).toBe('공유하기');
    expect(ACTIONS.reissue).toBe('새로 주기');
  });

  it('ERRORS invite messages avoid 코드발급 tone', () => {
    expect(ERRORS.invite.reissueFailed).toContain('초대장');
    expect(ERRORS.invite.limitReached).toContain(String(6));
  });
});
