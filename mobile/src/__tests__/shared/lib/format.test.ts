import {
  formatRelativeTime,
  nicknameInitial,
} from '@/shared/lib/format';

describe('nicknameInitial', () => {
  it('첫 글자', () => {
    expect(nicknameInitial('엄마')).toBe('엄');
  });

  it('공백·빈 값은 ?', () => {
    expect(nicknameInitial('')).toBe('?');
    expect(nicknameInitial('   ')).toBe('?');
    expect(nicknameInitial(null)).toBe('?');
  });
});

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-07-31T12:00:00+09:00');

  it('1분 미만은 방금', () => {
    expect(
      formatRelativeTime(new Date(now - 30_000).toISOString(), now),
    ).toBe('방금');
  });

  it('분 단위', () => {
    expect(
      formatRelativeTime(new Date(now - 5 * 60_000).toISOString(), now),
    ).toBe('5분 전');
  });

  it('시간 단위', () => {
    expect(
      formatRelativeTime(new Date(now - 2 * 3600_000).toISOString(), now),
    ).toBe('2시간 전');
  });

  it('잘못된 ISO는 빈 문자열', () => {
    expect(formatRelativeTime('not-a-date', now)).toBe('');
  });
});
