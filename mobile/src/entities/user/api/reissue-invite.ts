import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapFamilyInvite } from '@/entities/user/api/mappers';
import type { FamilyInvite } from '@/entities/user/model/types';
import { ERRORS } from '@/shared/copy';

export async function reissueInviteCode(
  inviteId: string,
): Promise<FamilyInvite> {
  const { data, error } = await supabase.rpc('reissue_invite_code', {
    p_invite_id: inviteId,
  });
  throwIfError(error, ERRORS.invite.reissueFailed);
  if (!data) throw new Error(ERRORS.invite.reissueFailed);
  return mapFamilyInvite(data as Record<string, unknown>);
}
