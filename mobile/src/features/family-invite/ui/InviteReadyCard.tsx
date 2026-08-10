import { Share, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { InviteTargetRole } from '@/entities/user/model/types';
import { ROLE_LABEL } from '@/entities/user';
import { joinDeepLink } from '@/shared/config/routes';
import { COPY } from '@/shared/copy';
import { Body, Button, Caption, Code, FadeInView } from '@/shared/ui';

const QR_SIZE = 160;

type Props = {
  inviteCode: string;
  invitedAs: string;
  targetRole: InviteTargetRole;
  /** 공유 메시지에 쓸 때 */
  onShare?: () => void;
};

/** 초대장 준비 — 여섯 글자 · QR · 공유 */
export function InviteReadyCard({
  inviteCode,
  invitedAs,
  targetRole,
  onShare,
}: Props) {
  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }
    const message = `${COPY.invite.funnelReadyBody}\n${inviteCode}\n${joinDeepLink(inviteCode)}`;
    try {
      await Share.share({ message });
    } catch {
      /* dismissed */
    }
  };

  return (
    <FadeInView step={0} className="items-center gap-4 py-2">
      <Body className="text-center text-sm">{COPY.invite.funnelReadyBody}</Body>
      <View className="w-full items-center rounded-2xl bg-surface-soft px-4 py-5">
        <Code tone="brand">{inviteCode}</Code>
      </View>
      <QRCode value={joinDeepLink(inviteCode)} size={QR_SIZE} />
      <Caption>
        {invitedAs} · {ROLE_LABEL[targetRole]}
      </Caption>
      <Button
        label={COPY.invite.funnelShare}
        variant="outline"
        shape="round"
        className="w-full"
        onPress={() => {
          void handleShare();
        }}
      />
    </FadeInView>
  );
}
