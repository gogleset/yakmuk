import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { ERRORS } from '@/shared/copy';

/** 가족장: 미클레임 초대 삭제 */
export async function deleteInvite(inviteId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_family_invite', {
    p_invite_id: inviteId,
  });
  throwIfError(error, ERRORS.invite.deleteFailed);
}
