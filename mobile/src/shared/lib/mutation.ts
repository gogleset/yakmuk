import { formatUserFacingError } from '@/shared/lib/errors';
import {
  presentExceptionModal,
  presentExceptionToast,
} from '@/shared/lib/exceptionFeedback';

/** mutation onError 공통 — ExceptionModal */
export function showMutationError(
  title: string,
  error: unknown,
  onDismiss?: () => void,
): void {
  presentExceptionModal(title, formatUserFacingError(error), onDismiss);
}

/** 가벼운 실패 — ExceptionToast */
export function showExceptionToast(
  errorOrMessage: unknown,
  title?: string,
): void {
  const message =
    typeof errorOrMessage === 'string'
      ? errorOrMessage
      : formatUserFacingError(errorOrMessage);
  presentExceptionToast(message, title);
}
