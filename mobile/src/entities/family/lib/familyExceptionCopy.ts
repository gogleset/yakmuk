import { ERRORS } from '@/shared/copy';

/** 가족 탭 섹션: 쿼리 에러면 empty 카피 대신 로드실패 카피 */
export function familySectionFallbackMessage(params: {
  isError: boolean;
  loadFailed: string;
  emptyMessage: string;
}): string {
  return params.isError ? params.loadFailed : params.emptyMessage;
}

export function familyAckErrorTitle(): string {
  return ERRORS.family.ackFailed;
}
