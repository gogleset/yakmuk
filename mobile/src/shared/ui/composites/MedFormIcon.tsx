import { View } from 'react-native';
import {
  medColorSoftFill,
  resolveMedColorHex,
} from '@/shared/constants/medColors';
import {
  resolveMedFormIconId,
  type MedFormIconId,
} from '@/shared/constants/medDoseUnits';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { MED_FORM_ICONS } from '@/shared/ui/primitives/Icon';

type Props = {
  /** dose_unit — 없으면 알약 */
  doseUnit?: string | null;
  /** 구분색 키 — 없으면 brand + surface-soft */
  color?: string | null;
  size?: number;
  /** 원 배지 한 변 (기본 40) */
  badgeSize?: number;
};

/**
 * 체크 리스트용 약 형태 아이콘.
 * stroke = 설정색 · 원 = 같은 색 흐린 tint.
 */
export function MedFormIcon({
  doseUnit,
  color,
  size = LAYOUT.icon.md,
  badgeSize = 40,
}: Props) {
  const formId: MedFormIconId = resolveMedFormIconId(doseUnit);
  const FormIcon = MED_FORM_ICONS[formId];
  const stroke = color ? resolveMedColorHex(color) : COLORS.brand;
  const softBg = color ? medColorSoftFill(color) : undefined;

  return (
    <View
      className={
        softBg
          ? 'items-center justify-center rounded-full'
          : 'items-center justify-center rounded-full bg-surface-soft'
      }
      style={[
        { width: badgeSize, height: badgeSize },
        softBg ? { backgroundColor: softBg } : null,
      ]}
    >
      <FormIcon size={size} color={stroke} />
    </View>
  );
}
