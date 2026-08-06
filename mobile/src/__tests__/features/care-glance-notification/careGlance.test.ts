import type { CareRecipientTodayStatus } from '@/entities/family/model/types';
import {
  isGlanceViewerRole,
  pickGlanceMember,
} from '@/features/care-glance-notification/lib/pickGlanceMember';
import { buildGlanceLine } from '@/features/care-glance-notification/lib/buildGlanceLine';
import {
  isCareGlanceStale,
  parseCareGlanceOpt,
} from '@/features/care-glance-notification/lib/careGlanceOpt';
import { COPY } from '@/shared/copy';

function member(
  partial: Partial<CareRecipientTodayStatus> & { userId: string },
): CareRecipientTodayStatus {
  return {
    nickname: '엄마',
    invitedAs: null,
    role: 'care_recipient',
    totalMeds: 2,
    takenCount: 1,
    pendingCount: 1,
    condition: null,
    conditionMessage: null,
    hasUnackedAlert: false,
    ...partial,
  };
}

describe('isGlanceViewerRole', () => {
  it('리더·guardian만 true', () => {
    expect(isGlanceViewerRole('family_leader')).toBe(true);
    expect(isGlanceViewerRole('guardian')).toBe(true);
    expect(isGlanceViewerRole('care_recipient')).toBe(false);
    expect(isGlanceViewerRole(null)).toBe(false);
  });
});

describe('pickGlanceMember', () => {
  it('안부 있는 피보호자 우선', () => {
    const picked = pickGlanceMember(
      [
        member({ userId: 'a', nickname: '아빠', hasUnackedAlert: false }),
        member({ userId: 'b', nickname: '엄마', hasUnackedAlert: true }),
      ],
      'me',
    );
    expect(picked?.userId).toBe('b');
  });

  it('안부 없으면 첫 피보호자', () => {
    const picked = pickGlanceMember(
      [
        member({ userId: 'a', nickname: '아빠' }),
        member({ userId: 'b', nickname: '엄마' }),
      ],
      'me',
    );
    expect(picked?.userId).toBe('a');
  });

  it('본인 제외', () => {
    const picked = pickGlanceMember(
      [member({ userId: 'me', nickname: '나' })],
      'me',
    );
    expect(picked).toBeNull();
  });
});

describe('buildGlanceLine', () => {
  it('이름 · 상태 라벨', () => {
    expect(
      buildGlanceLine(
        member({
          userId: 'a',
          nickname: '엄마',
          pendingCount: 0,
          totalMeds: 2,
        }),
      ),
    ).toBe(COPY.family.glanceLine('엄마', COPY.family.statusAllTaken));
  });
});

describe('parseCareGlanceOpt', () => {
  it('기본 ON · off만 false', () => {
    expect(parseCareGlanceOpt(null)).toBe(true);
    expect(parseCareGlanceOpt('1')).toBe(true);
    expect(parseCareGlanceOpt('0')).toBe(false);
    expect(parseCareGlanceOpt('false')).toBe(false);
  });
});

describe('isCareGlanceStale', () => {
  it('30분 초과면 stale', () => {
    const now = 1_000_000;
    expect(isCareGlanceStale(now - 31 * 60_000, now, 30)).toBe(true);
    expect(isCareGlanceStale(now - 10 * 60_000, now, 30)).toBe(false);
    expect(isCareGlanceStale(null, now, 30)).toBe(true);
  });
});
