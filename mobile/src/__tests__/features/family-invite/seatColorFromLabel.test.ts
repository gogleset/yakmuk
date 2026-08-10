import {
  SEAT_COLORS,
  seatColorFromLabel,
  seatColorIdFromLabel,
} from '@/features/family-invite/lib/seatColorFromLabel';

describe('seatColorFromLabel', () => {
  it('is stable for the same label', () => {
    expect(seatColorIdFromLabel('엄마')).toBe(seatColorIdFromLabel('엄마'));
    expect(seatColorFromLabel('할머니').hex).toBe(
      seatColorFromLabel('할머니').hex,
    );
  });

  it('differs across common chips', () => {
    const ids = ['엄마', '아빠', '할머니', '할아버지', '이모', '삼촌'].map(
      (label) => seatColorIdFromLabel(label),
    );
    expect(new Set(ids).size).toBeGreaterThan(1);
  });

  it('uses only calm seat palette (no coral/lilac/rose)', () => {
    const ids = new Set(SEAT_COLORS.map((c) => c.id));
    expect(ids.has('coral' as never)).toBe(false);
    expect(ids.has('lilac' as never)).toBe(false);
    expect(ids.has('rose' as never)).toBe(false);
    for (const label of ['엄마', '아빠', '누나', '형', '직접']) {
      const hex = seatColorFromLabel(label).hex.toLowerCase();
      // 강한 적/보라 계열 대략 차단 (R 높고 G·B 낮음 / B·R 높고 G 낮음)
      const r = Number.parseInt(hex.slice(1, 3), 16);
      const g = Number.parseInt(hex.slice(3, 5), 16);
      const b = Number.parseInt(hex.slice(5, 7), 16);
      expect(r - Math.min(g, b)).toBeLessThan(80);
    }
  });
});
