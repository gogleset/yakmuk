import { Pressable, Text, View, type TextStyle } from 'react-native';
import {
  MED_DOSE_UNITS,
  type MedDoseUnitId,
} from '@/shared/constants/medDoseUnits';
import { LIMITS } from '@/shared/constants/limits';
import { COLORS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/primitives/Input';
import { MedColorSwatch } from '@/entities/medication/ui/MedColorSwatch';
import type { MedColorId } from '@/shared/constants/medColors';
import {
  clampMedMetaText,
  sanitizeDoseAmountInput,
} from '@/entities/medication/lib/medicationMeta';

export type MedicationMetaFormState = {
  efficacy: string;
  useMethod: string;
  storage: string;
  warning: string;
  doseAmount: string;
  doseUnit: MedDoseUnitId | null;
  color: string;
  /** 단위 피커 펼침 */
  unitPickerOpen?: boolean;
};

type Props = {
  value: MedicationMetaFormState;
  onChange: (next: MedicationMetaFormState) => void;
  readOnly?: boolean;
};

/** 라벨 왼쪽 · 글자수/최대 오른쪽 위 */
function FieldHeader({
  label,
  length,
  max,
  showCount,
}: {
  label: string;
  length: number;
  max: number;
  showCount: boolean;
}) {
  const nearLimit = length >= max * 0.9;
  return (
    <View className="mb-1.5 flex-row items-center justify-between gap-2">
      <Text className="text-sm font-semibold text-brand">{label}</Text>
      {showCount ? (
        <Text
          className={cn('text-xs', nearLimit && 'font-semibold')}
          style={
            {
              color: nearLimit ? COLORS.warning : COLORS.muted,
            } satisfies TextStyle
          }
        >
          {length}/{max}
        </Text>
      ) : null}
    </View>
  );
}

/** 구분 색 → 효능·복용법·보관·주의·용량 — 라벨 + 예시 placeholder */
export function MedicationMetaFields({
  value,
  onChange,
  readOnly = false,
}: Props) {
  const patch = (partial: Partial<MedicationMetaFormState>) => {
    if (readOnly) return;
    onChange({ ...value, ...partial });
  };

  const patchText = (
    key: 'efficacy' | 'useMethod' | 'storage' | 'warning',
    next: string,
  ) => {
    patch({ [key]: clampMedMetaText(next) });
  };

  const max = LIMITS.medMetaMaxLength;
  const showCount = !readOnly;

  return (
    <View className="gap-3">
      <View>
        <Text className="mb-1.5 text-sm font-semibold text-brand">
          {COPY.med.colorLabel}
        </Text>
        <MedColorSwatch
          value={value.color}
          onChange={(color: MedColorId) => patch({ color })}
          readOnly={readOnly}
        />
      </View>

      <View>
        <FieldHeader
          label={COPY.med.efficacyLabel}
          length={value.efficacy.length}
          max={max}
          showCount={showCount}
        />
        <Input
          tone="soft"
          placeholder={COPY.med.efficacyPlaceholder}
          value={value.efficacy}
          onChangeText={(efficacy) => patchText('efficacy', efficacy)}
          maxLength={max}
          multiline
          editable={!readOnly}
        />
      </View>
      <View>
        <FieldHeader
          label={COPY.med.useMethodLabel}
          length={value.useMethod.length}
          max={max}
          showCount={showCount}
        />
        <Input
          tone="soft"
          placeholder={COPY.med.useMethodPlaceholder}
          value={value.useMethod}
          onChangeText={(useMethod) => patchText('useMethod', useMethod)}
          maxLength={max}
          multiline
          editable={!readOnly}
        />
      </View>
      <View>
        <FieldHeader
          label={COPY.med.storageLabel}
          length={value.storage.length}
          max={max}
          showCount={showCount}
        />
        <Input
          tone="soft"
          placeholder={COPY.med.storagePlaceholder}
          value={value.storage}
          onChangeText={(storage) => patchText('storage', storage)}
          maxLength={max}
          multiline
          editable={!readOnly}
        />
      </View>
      <View>
        <FieldHeader
          label={COPY.med.warningLabel}
          length={value.warning.length}
          max={max}
          showCount={showCount}
        />
        <Input
          tone="soft"
          placeholder={COPY.med.warningPlaceholder}
          value={value.warning}
          onChangeText={(warning) => patchText('warning', warning)}
          maxLength={max}
          multiline
          editable={!readOnly}
        />
      </View>

      <View>
        <Text className="mb-1.5 text-sm font-semibold text-brand">
          {COPY.med.doseLabel}
        </Text>
        <View className="flex-row gap-2">
          <View className="min-w-0 flex-1">
            <Input
              tone="soft"
              placeholder={COPY.med.doseAmountPlaceholder}
              value={value.doseAmount}
              onChangeText={(doseAmount) =>
                patch({ doseAmount: sanitizeDoseAmountInput(doseAmount) })
              }
              keyboardType="decimal-pad"
              // 9999.99
              maxLength={String(LIMITS.medDoseAmountMax).length + 3}
              editable={!readOnly}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.med.doseUnitPlaceholder}
            accessibilityState={{ disabled: readOnly }}
            disabled={readOnly}
            onPress={() =>
              patch({ unitPickerOpen: !value.unitPickerOpen })
            }
            className="min-w-[88px] items-center justify-center rounded-xl bg-brand-soft px-3"
          >
            <Text className="text-base font-semibold text-brand">
              {value.doseUnit
                ? MED_DOSE_UNITS.find((u) => u.id === value.doseUnit)?.label
                : COPY.med.doseUnitPlaceholder}
            </Text>
          </Pressable>
        </View>
      </View>

      {!readOnly && value.unitPickerOpen ? (
        <View className="flex-row flex-wrap gap-2">
          {MED_DOSE_UNITS.map((unit) => {
            const selected = value.doseUnit === unit.id;
            return (
              <Pressable
                key={unit.id}
                onPress={() =>
                  patch({
                    doseUnit: unit.id,
                    unitPickerOpen: false,
                  })
                }
                className={cn(
                  'rounded-xl px-3 py-2',
                  selected ? 'bg-brand-soft' : 'bg-surface-soft',
                )}
              >
                <Text className="text-sm font-semibold text-brand">
                  {unit.label}
                </Text>
              </Pressable>
            );
          })}
          {value.doseUnit ? (
            <Pressable
              onPress={() =>
                patch({ doseUnit: null, unitPickerOpen: false })
              }
              className="rounded-xl bg-surface-soft px-3 py-2"
            >
              <Text className="text-sm font-semibold text-brand-muted">
                지우기
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function emptyMedicationMetaForm(
  color = 'teal',
): MedicationMetaFormState {
  return {
    efficacy: '',
    useMethod: '',
    storage: '',
    warning: '',
    doseAmount: '',
    doseUnit: null,
    color,
    unitPickerOpen: false,
  };
}
