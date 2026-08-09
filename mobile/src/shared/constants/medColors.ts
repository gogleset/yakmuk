/** 약 구분 색 — docs/design/color.md soft 팔레트와 맞춘 앱 전용 키 */
export const MED_COLOR_DEFAULT = 'teal' as const;

export const MED_COLORS = [
  { id: 'teal', hex: '#4D8679' },
  { id: 'mint', hex: '#6BA89A' },
  { id: 'sky', hex: '#6B9BB5' },
  { id: 'lilac', hex: '#8B7BA8' },
  { id: 'coral', hex: '#C46B5A' },
  { id: 'amber', hex: '#C49A3C' },
  { id: 'rose', hex: '#C47A8A' },
  { id: 'slate', hex: '#7A8783' },
] as const;

export type MedColorId = (typeof MED_COLORS)[number]['id'];

/** 아이콘 원 배경용 — 설정색의 흐린 tint */
export const MED_COLOR_SOFT_ALPHA = 0.2;

const MED_COLOR_IDS = new Set<string>(MED_COLORS.map((c) => c.id));

export function isMedColorId(value: string): value is MedColorId {
  return MED_COLOR_IDS.has(value);
}

/** 알 수 없는 키면 기본색 */
export function resolveMedColorHex(colorId: string): string {
  const found = MED_COLORS.find((c) => c.id === colorId);
  return found?.hex ?? MED_COLORS[0].hex;
}

/** `#RRGGBB` → `rgba(r,g,b,a)` — 파싱 실패 시 null */
function hexToRgba(hex: string, alpha: number): string | null {
  const raw = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  const a = Math.min(1, Math.max(0, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * 구분색 키 → 원 배경용 흐린 fill.
 * 알 수 없는 키면 기본색 soft.
 */
export function medColorSoftFill(
  colorId: string,
  alpha: number = MED_COLOR_SOFT_ALPHA,
): string {
  const hex = resolveMedColorHex(colorId);
  return hexToRgba(hex, alpha) ?? `rgba(77, 134, 121, ${alpha})`;
}
