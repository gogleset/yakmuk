import { Pressable, View } from 'react-native';
import type { ConditionValue, Medication } from '@/entities/medication/model/types';
import { MedRow } from '@/entities/medication/ui/MedRow';
import { Badge, Button, Caption, EmptyHint, Icons, Input } from '@/shared/ui';

const CONDITIONS: { value: ConditionValue; label: string }[] = [
  { value: 'GOOD', label: '좋음' },
  { value: 'NORMAL', label: '보통' },
  { value: 'BAD', label: '아픔' },
];

type Props = {
  meds: Medication[];
  takenMedIds: Set<number>;
  condition: ConditionValue;
  message: string;
  onConditionChange: (value: ConditionValue) => void;
  onMessageChange: (value: string) => void;
  onToggle: (medId: number) => void;
  onDelete: (medId: number, name: string) => void;
  onSubmitCondition: () => void;
  /** 목록 조회 실패 시 안내 */
  isError?: boolean;
};

/** 오늘 약 체크 + 컨디션 입력 */
export function TodayMedicationPanel({
  meds,
  takenMedIds,
  condition,
  message,
  onConditionChange,
  onMessageChange,
  onToggle,
  onDelete,
  onSubmitCondition,
  isError = false,
}: Props) {
  return (
    <View className="gap-2.5">
      {isError ? (
        <EmptyHint message="약 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요." />
      ) : meds.length === 0 ? (
        <EmptyHint message="아직 등록한 약이 없어요. 아래 + 버튼으로 추가해 보세요." />
      ) : (
        meds.map((med) => (
          <MedRow
            key={med.id}
            name={med.name}
            scheduledTime={med.scheduledTime}
            taken={takenMedIds.has(med.id)}
            onPress={() => onToggle(med.id)}
            onLongPress={() => onDelete(med.id, med.name)}
          />
        ))
      )}

      {meds.length > 0 ? (
        <Caption>길게 누르면 삭제할 수 있어요</Caption>
      ) : null}

      <View className="flex-row gap-2">
        {CONDITIONS.map((c) => (
          <Pressable key={c.value} onPress={() => onConditionChange(c.value)}>
            <Badge label={c.label} selected={condition === c.value} />
          </Pressable>
        ))}
      </View>
      <Input
        placeholder="가족에게 전할 한마디 (선택)"
        value={message}
        onChangeText={onMessageChange}
      />
      <Button
        label="컨디션 남기기"
        icon={Icons.Heart}
        onPress={onSubmitCondition}
      />
    </View>
  );
}
