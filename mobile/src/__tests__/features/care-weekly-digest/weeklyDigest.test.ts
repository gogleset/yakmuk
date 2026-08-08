import {
  buildWeeklyDigest,
  formatWeeklyAnomalyLines,
  weekStartMondayKst,
} from '@/entities/family/lib/buildWeeklyDigest';
import { COPY } from '@/shared/copy';
import {
  isWeeklyDigestDismissed,
  parseWeeklyDigestOpt,
} from '@/features/care-weekly-digest/lib/weeklyDigestOpt';

describe('weekStartMondayKst', () => {
  it('수요일 → 그 주 월요일', () => {
    // 2026-08-05 = 수
    expect(weekStartMondayKst('2026-08-05')).toBe('2026-08-03');
  });
});

describe('buildWeeklyDigest', () => {
  it('전부 완료·BAD 없음 → 괜찮았어요', () => {
    const view = buildWeeklyDigest(
      [
        {
          dateYmd: '2026-08-03',
          totalMeds: 2,
          takenCount: 2,
          condition: 'GOOD',
        },
        {
          dateYmd: '2026-08-04',
          totalMeds: 2,
          takenCount: 2,
          condition: null,
        },
      ],
      '2026-08-03',
    );
    expect(view.approxLine).toBe(COPY.family.weeklyOk);
    expect(view.anomalyDays).toHaveLength(0);
  });

  it('놓침·BAD를 특이일로', () => {
    const view = buildWeeklyDigest(
      [
        {
          dateYmd: '2026-08-03',
          totalMeds: 2,
          takenCount: 1,
          condition: null,
        },
        {
          dateYmd: '2026-08-04',
          totalMeds: 1,
          takenCount: 1,
          condition: 'BAD',
        },
      ],
      '2026-08-03',
    );
    expect(view.anomalyDays).toEqual([
      { dateYmd: '2026-08-03', kind: 'missed' },
      { dateYmd: '2026-08-04', kind: 'bad' },
    ]);
    expect(view.approxLine).toBe(COPY.family.weeklyUneven);
  });

  it('약 없는 주', () => {
    const view = buildWeeklyDigest(
      [{ dateYmd: '2026-08-03', totalMeds: 0, takenCount: 0, condition: null }],
      '2026-08-03',
    );
    expect(view.approxLine).toBe(COPY.family.weeklyNoMeds);
  });
});

describe('formatWeeklyAnomalyLines', () => {
  it('같은 kind는 요일만 묶어 한 줄', () => {
    // 2026-07-31=금 · 08-01=토 · 08-02=일
    expect(
      formatWeeklyAnomalyLines([
        { dateYmd: '2026-07-31', kind: 'missed' },
        { dateYmd: '2026-08-01', kind: 'missed' },
        { dateYmd: '2026-08-02', kind: 'missed' },
      ]),
    ).toEqual(['금, 토, 일 약이 조금 남았어요']);
  });

  it('missed·bad는 종류별 줄', () => {
    expect(
      formatWeeklyAnomalyLines([
        { dateYmd: '2026-08-03', kind: 'missed' },
        { dateYmd: '2026-08-04', kind: 'bad' },
      ]),
    ).toEqual(['월 약이 조금 남았어요', '화 컨디션이 안 좋았어요']);
  });
});

describe('weeklyDigestOpt', () => {
  it('기본 ON', () => {
    expect(parseWeeklyDigestOpt(null)).toBe(true);
    expect(parseWeeklyDigestOpt('0')).toBe(false);
  });

  it('같은 주 dismiss만 숨김', () => {
    expect(isWeeklyDigestDismissed('2026-08-03', '2026-08-03')).toBe(true);
    expect(isWeeklyDigestDismissed('2026-08-03', '2026-07-27')).toBe(false);
    expect(isWeeklyDigestDismissed('2026-08-03', null)).toBe(false);
  });
});
