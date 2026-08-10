import {
  mapFamilyAlert,
  mapFamilyFeedDayRead,
} from '@/entities/family/api/mappers';

describe('mapFamilyFeedDayRead', () => {
  it('maps snake_case row', () => {
    expect(
      mapFamilyFeedDayRead({
        user_id: 'u1',
        family_id: 'f1',
        log_date: '2026-08-10',
        read_at: '2026-08-10T03:00:00.000Z',
      }),
    ).toEqual({
      userId: 'u1',
      familyId: 'f1',
      logDate: '2026-08-10',
      readAt: '2026-08-10T03:00:00.000Z',
    });
  });

  it('trims timestamptz-as-date to YYYY-MM-DD', () => {
    expect(
      mapFamilyFeedDayRead({
        user_id: 'u1',
        family_id: 'f1',
        log_date: '2026-08-10T00:00:00+00:00',
        read_at: '2026-08-10T03:00:00.000Z',
      }).logDate,
    ).toBe('2026-08-10');
  });
});

describe('mapFamilyAlert', () => {
  it('maps acked_at null', () => {
    const alert = mapFamilyAlert({
      id: 'a1',
      family_id: 'f1',
      user_id: 'u1',
      kind: 'stuck_escalate',
      message: 'hi',
      payload: {},
      created_at: '2026-08-10T01:00:00.000Z',
      acked_at: null,
    });
    expect(alert.ackedAt).toBeNull();
    expect(alert.kind).toBe('stuck_escalate');
  });
});
