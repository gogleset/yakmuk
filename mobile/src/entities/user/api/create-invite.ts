import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapFamilyInvite } from '@/entities/user/api/mappers';
import type {
  FamilyInvite,
  InviteTargetRole,
} from '@/entities/user/model/types';
import { ERRORS } from '@/shared/copy';

/** 가족장: 보호자/피보호자 초대 슬롯 생성 */
export async function createInvite(
  invitedAs: string,
  targetRole: InviteTargetRole,
): Promise<FamilyInvite> {
  const label = invitedAs.trim();
  if (!label) throw new Error(ERRORS.invite.labelRequired);

  const { data, error } = await supabase.rpc('create_family_invite', {
    p_invited_as: label,
    p_target_role: targetRole,
  });
  throwIfError(error, ERRORS.invite.createFailed);
  if (!data) throw new Error(ERRORS.invite.createFailed);
  return mapFamilyInvite(data as Record<string, unknown>);
}
