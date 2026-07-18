import { Pressable, Text, View } from 'react-native';
import type {
  CareRecipientTodayStatus,
  FamilyAlert,
} from '@/entities/family/model/types';
import { CONDITION_LABEL } from '@/entities/medication';
import { relationSubtitle } from '@/entities/user';
import { COLORS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import {
  AlertBanner,
  Button,
  Card,
  KokiIllustration,
  Muted,
  RichEmptyState,
} from '@/shared/ui';

type Props = {
  alerts: FamilyAlert[];
  members: CareRecipientTodayStatus[];
  leaderNickname?: string | null;
  myUserId?: string | null;
  showInviteCta?: boolean;
  onAckAlert: (alertId: string) => void;
  onPressMember: (userId: string, nickname: string) => void;
  onInviteCtaPress?: () => void;
};

function memberStatusLabel(member: CareRecipientTodayStatus): string | null {
  if (member.hasUnackedAlert) return '안부';
  if (member.pendingCount === 0 && member.totalMeds > 0) return '다 먹음';
  if (member.pendingCount > 0) return `${member.pendingCount} 남음`;
  return null;
}

/** 가족 전원 복약 상태·알림 대시보드 */
export function FamilyGuardianDashboard({
  alerts,
  members,
  leaderNickname,
  myUserId,
  showInviteCta = false,
  onAckAlert,
  onPressMember,
  onInviteCtaPress,
}: Props) {
  return (
    <>
      {alerts.map((alert) =>
        alert.kind === 'stuck_escalate' ? (
          <Card key={alert.id} className="items-center gap-2 py-4">
            <KokiIllustration variant="worried" size={96} />
            <Text className="text-center text-base font-bold text-brand">
              {`${alert.nickname ?? '가족'} · 약 안부가 궁금해요`}
            </Text>
            {alert.message ? (
              <Muted className="text-center text-sm">{alert.message}</Muted>
            ) : null}
            <Button
              label="확인했어요"
              size="sm"
              variant="outline"
              onPress={() => onAckAlert(alert.id)}
            />
          </Card>
        ) : (
          <AlertBanner
            key={alert.id}
            title={`${alert.nickname ?? '가족'} · 컨디션이 걱정돼요`}
            message={alert.message}
            onAck={() => onAckAlert(alert.id)}
          />
        ),
      )}

      {members.length === 0 ? (
        <RichEmptyState
          title={COPY.family.emptyMembers}
          illustration={<KokiIllustration variant="family" size={120} />}
          ctaLabel={showInviteCta ? '가족 초대' : undefined}
          onCtaPress={showInviteCta ? onInviteCtaPress : undefined}
        />
      ) : (
        members.map((member) => {
          const isMe = member.userId === myUserId;
          const sub = relationSubtitle(member.invitedAs, leaderNickname);
          const status = isMe ? null : memberStatusLabel(member);
          return (
            <Pressable
              key={member.userId}
              accessibilityRole="button"
              disabled={isMe}
              onPress={() => onPressMember(member.userId, member.nickname)}
            >
              <Card
                style={
                  member.hasUnackedAlert || member.condition === 'BAD'
                    ? { backgroundColor: COLORS.warningBg }
                    : undefined
                }
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-brand">
                    {member.nickname}
                    {isMe ? ' (나)' : ''}
                  </Text>
                  {status ? <Muted className="text-sm">{status}</Muted> : null}
                </View>
                {isMe ? null : (
                  <>
                    {sub ? (
                      <Text className="mt-0.5 text-xs text-brand-faint">
                        {sub}
                      </Text>
                    ) : null}
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
                  </>
                )}
              </Card>
            </Pressable>
          );
        })
      )}
    </>
  );
}
