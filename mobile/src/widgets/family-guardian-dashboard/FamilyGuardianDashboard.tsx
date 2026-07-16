import { Text, View } from 'react-native';
import type {
  CareRecipientTodayStatus,
  FamilyAlert,
} from '@/entities/family/model/types';
import { CONDITION_LABEL } from '@/shared/lib/format';
import { COLORS } from '@/shared/config/theme';
import { AlertBanner, Badge, Card, EmptyHint } from '@/shared/ui';

type Props = {
  alerts: FamilyAlert[];
  members: CareRecipientTodayStatus[];
  onAckAlert: (alertId: string) => void;
};

/** 보호자용 가족 상태·알림 대시보드 */
export function FamilyGuardianDashboard({
  alerts,
  members,
  onAckAlert,
}: Props) {
  return (
    <>
      {alerts.map((alert) => (
        <AlertBanner
          key={alert.id}
          title={`${alert.nickname ?? '가족'} · ${
            alert.kind === 'bad_condition'
              ? '컨디션이 안 좋아요'
              : '약 체크가 멈췄어요'
          }`}
          message={alert.message}
          onAck={() => onAckAlert(alert.id)}
        />
      ))}

      {members.length === 0 ? (
        <EmptyHint message="아직 연결된 가족이 없어요. + 버튼으로 초대해 보세요." />
      ) : (
        members.map((member) => (
          <Card
            key={member.userId}
            style={
              member.hasUnackedAlert || member.condition === 'BAD'
                ? { backgroundColor: COLORS.warningBg }
                : undefined
            }
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-brand">
                {member.nickname}
              </Text>
              {member.hasUnackedAlert ? (
                <Badge label="확인 필요" variant="warning" />
              ) : member.pendingCount === 0 && member.totalMeds > 0 ? (
                <Badge label="다 먹었어요" variant="soft" />
              ) : member.pendingCount > 0 ? (
                <Badge
                  label={`${member.pendingCount}개 남음`}
                  variant="warning"
                />
              ) : null}
            </View>
            <Text className="mt-1.5 text-brand-muted">
              약 {member.takenCount}/{member.totalMeds}
              {member.condition
                ? ` · ${CONDITION_LABEL[member.condition]}`
                : ' · 컨디션 아직 없음'}
            </Text>
            {member.conditionMessage ? (
              <Text className="mt-1 text-brand-faint">
                “{member.conditionMessage}”
              </Text>
            ) : null}
          </Card>
        ))
      )}
    </>
  );
}
