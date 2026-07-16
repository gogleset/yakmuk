import { type QueryClient, useQuery } from '@tanstack/react-query';
import { listInvites } from '@/entities/user/api/list-invites';
import { userKeys } from '@/entities/user/model/queryKeys';

type CareInvitesQueryParams = {
  enabled: boolean;
};

export function useCareInvitesQuery({ enabled }: CareInvitesQueryParams) {
  return useQuery({
    queryKey: userKeys.invites(),
    queryFn: listInvites,
    enabled,
  });
}

export async function invalidateCareInvites(qc: QueryClient): Promise<void> {
  await qc.invalidateQueries({ queryKey: userKeys.invites() });
}
