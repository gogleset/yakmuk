import { router } from 'expo-router';
import { InviteCreateFunnel } from '@/features/family-invite';
import { ROUTES } from '@/shared/config/routes';

/** P5 초대 생성 풀페이지 */
export function InviteCreatePage() {
  const onClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.settingsFamily);
  };

  return <InviteCreateFunnel onClose={onClose} />;
}
