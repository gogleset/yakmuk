import { type QueryClient, useQuery } from '@tanstack/react-query';
import { listInvites } from '@/entities/user/api/list-invites';
import { userKeys } from '@/entities/user/model/queryKeys';

type FamilyInvitesQueryParams = {
  enabled: boolean;
};

export function useFamilyInvitesQuery({ enabled }: FamilyInvitesQueryParams) {
  return useQuery({
    queryKey: userKeys.invites(),
    queryFn: listInvites,
    enabled,
  });
}

export async function invalidateFamilyInvites(qc: QueryClient): Promise<void> {
  await qc.invalidateQueries({ queryKey: userKeys.invites() });
}
