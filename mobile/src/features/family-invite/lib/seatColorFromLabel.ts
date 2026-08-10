/** 가족 자리표 — 온화한 soft 팔레트 (빨강·보라·위협톤 제외) */
export const SEAT_COLORS = [
  { id: 'sage', hex: '#5A8F7B' },
  { id: 'mint', hex: '#6BA89A' },
  { id: 'seafoam', hex: '#7AB8A8' },
  { id: 'sky', hex: '#6B9BB5' },
  { id: 'mist', hex: '#7A9EAE' },
  { id: 'sand', hex: '#B8A07A' },
  { id: 'honey', hex: '#C4A86A' },
  { id: 'stone', hex: '#8A9A90' },
] as const;

export type SeatColorId = (typeof SEAT_COLORS)[number]['id'];

/** 카드/얼굴 테두리만 살짝 */
const SEAT_BORDER_ALPHA = 0.4;

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.trim().replace(/^#/, '');
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  const a = Math.min(1, Math.max(0, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** 호칭 → 구분색 (같은 호칭은 항상 같은 색) */
export function seatColorIdFromLabel(label: string): SeatColorId {
  const key = label.trim();
  if (!key) return SEAT_COLORS[0].id;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return SEAT_COLORS[hash % SEAT_COLORS.length].id;
}

export function seatColorFromLabel(label: string): {
  id: SeatColorId;
  hex: string;
  /** 화이트 카드용 살짝 톤 보더 */
  border: string;
} {
  const id = seatColorIdFromLabel(label);
  const hex = SEAT_COLORS.find((c) => c.id === id)?.hex ?? SEAT_COLORS[0].hex;
  return {
    id,
    hex,
    border: hexToRgba(hex, SEAT_BORDER_ALPHA),
  };
}
