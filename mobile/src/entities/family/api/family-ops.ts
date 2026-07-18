import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { ERRORS } from '@/shared/copy';

export type FamilyInfo = {
  id: string;
  name: string;
  createdBy: string;
};

export async function getFamily(
  familyId: string,
): Promise<FamilyInfo | null> {
  const { data, error } = await supabase
    .from('families')
    .select('id, name, created_by')
    .eq('id', familyId)
    .maybeSingle();
  throwIfError(error);
  if (!data) return null;
  return {
    id: String(data.id),
    name: String(data.name),
    createdBy: String(data.created_by),
  };
}

export async function updateFamilyName(name: string): Promise<FamilyInfo> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error(ERRORS.family.nameRequired);

  const { data, error } = await supabase.rpc('update_family_name', {
    p_name: trimmed,
  });
  throwIfError(error, ERRORS.family.renameFailed);
  if (!data) throw new Error(ERRORS.family.renameFailed);
  const row = data as Record<string, unknown>;
  return {
    id: String(row.id),
    name: String(row.name),
    createdBy: String(row.created_by),
  };
}

export async function removeFamilyMember(userId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_family_member', {
    p_user_id: userId,
  });
  throwIfError(error, ERRORS.family.removeMemberFailed);
}

export async function deleteFamily(): Promise<void> {
  const { error } = await supabase.rpc('delete_family');
  throwIfError(error, ERRORS.family.deleteFailed);
}
