import { supabase } from '@/shared/api/client';

/** 회원 탈퇴 — 리더는 가족 삭제, 그 외는 본인만 제거 */
export async function withdrawMyAccount(): Promise<void> {
  const { error } = await supabase.rpc('withdraw_my_account');
  if (error) throw error;
}
