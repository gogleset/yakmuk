import { mapMedication } from '@/entities/medication/api/mappers';
import { MED_COLOR_DEFAULT } from '@/shared/constants/medColors';
import { formatMedDose } from '@/shared/constants/medDoseUnits';

describe('mapMedication', () => {
  const base = {
    id: 1,
    user_id: 'u1',
    name: '타이레놀',
    scheduled_time: '08:00:00',
    days_mask: 'daily',
    created_at: '2026-07-31T00:00:00Z',
    deleted_at: null,
  };

  it('메타·색·용량을 매핑한다', () => {
    const med = mapMedication({
      ...base,
      item_seq: '200808942',
      color: 'coral',
      efficacy: '해열',
      use_method: '1정',
      storage: '실온',
      warning: '과량 주의',
      dose_amount: 1,
      dose_unit: 'tablet',
    });

    expect(med.itemSeq).toBe('200808942');
    expect(med.color).toBe('coral');
    expect(med.efficacy).toBe('해열');
    expect(med.useMethod).toBe('1정');
    expect(med.storage).toBe('실온');
    expect(med.warning).toBe('과량 주의');
    expect(med.doseAmount).toBe(1);
    expect(med.doseUnit).toBe('tablet');
  });

  it('메타 없으면 null·기본색', () => {
    const med = mapMedication(base);
    expect(med.itemSeq).toBeNull();
    expect(med.color).toBe(MED_COLOR_DEFAULT);
    expect(med.efficacy).toBeNull();
    expect(med.doseAmount).toBeNull();
    expect(med.doseUnit).toBeNull();
  });
});

describe('formatMedDose', () => {
  it('양+단위 라벨을 붙인다', () => {
    expect(formatMedDose(1, 'tablet')).toBe('1정');
    expect(formatMedDose(5, 'ml')).toBe('5ml');
    expect(formatMedDose(0.5, 'packet')).toBe('0.5포');
  });

  it('한쪽만 있으면 null', () => {
    expect(formatMedDose(1, null)).toBeNull();
    expect(formatMedDose(null, 'tablet')).toBeNull();
  });
});
