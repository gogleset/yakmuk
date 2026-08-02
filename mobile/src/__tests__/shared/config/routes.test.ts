import { medicationAlarmRoute } from '@/shared/config/routes';

describe('medicationAlarmRoute', () => {
  it('medicationId만 있어도 됨', () => {
    expect(medicationAlarmRoute({ medicationId: 3 })).toBe(
      '/medication-alarm?medicationId=3',
    );
  });

  it('파라미터 없으면 bare 라우트', () => {
    expect(medicationAlarmRoute({})).toBe('/medication-alarm');
  });

  it('name·scheduledTime·dose·useMethod를 쿼리로 전달', () => {
    const href = medicationAlarmRoute({
      medicationId: 7,
      name: '혈압약',
      scheduledTime: '08:00',
      useMethod: '식후 30분',
      doseAmount: 1,
      doseUnit: 'tablet',
    });
    const url = new URL(href, 'https://yakmuk.local');
    expect(url.pathname).toBe('/medication-alarm');
    expect(url.searchParams.get('medicationId')).toBe('7');
    expect(url.searchParams.get('name')).toBe('혈압약');
    expect(url.searchParams.get('scheduledTime')).toBe('08:00');
    expect(url.searchParams.get('useMethod')).toBe('식후 30분');
    expect(url.searchParams.get('doseAmount')).toBe('1');
    expect(url.searchParams.get('doseUnit')).toBe('tablet');
  });

  it('null dose/useMethod는 쿼리에서 생략', () => {
    const href = medicationAlarmRoute({
      medicationId: 1,
      name: '약',
      scheduledTime: '09:00',
      useMethod: null,
      doseAmount: null,
      doseUnit: null,
    });
    const url = new URL(href, 'https://yakmuk.local');
    expect(url.searchParams.has('useMethod')).toBe(false);
    expect(url.searchParams.has('doseAmount')).toBe(false);
    expect(url.searchParams.has('doseUnit')).toBe(false);
  });

  it('previewMulti만 있어도 됨', () => {
    const href = medicationAlarmRoute({ previewMulti: true });
    const url = new URL(href, 'https://yakmuk.local');
    expect(url.searchParams.get('previewMulti')).toBe('1');
    expect(url.searchParams.has('medicationId')).toBe(false);
  });
});
