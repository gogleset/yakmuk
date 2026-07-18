import { useQuery } from '@tanstack/react-query';
import { peekFamilyInvite } from '@/entities/user/api/peek-invite';
import { LIMITS } from '@/shared/constants';
import { careRecipientJoinKeys } from './useCareRecipientJoinMutation';

/** 초대코드 6자리일 때만 프리뷰 조회 */
export function usePeekInviteQuery(code: string) {
  const trimmed = code.trim().toUpperCase();
  const enabled = trimmed.length === LIMITS.inviteCodeLength;

  return useQuery({
    queryKey: [...careRecipientJoinKeys.all, 'peek', trimmed] as const,
    queryFn: () => peekFamilyInvite(trimmed),
    enabled,
    retry: false,
  });
}
