import {
  BACKEND_ERROR_MESSAGES,
  ERRORS,
  TECHNICAL_ERROR_PATTERNS,
} from '@/shared/copy/errors';

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.trim();
  if (typeof error === 'string') return error.trim();
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message.trim();
  }
  return '';
}

function isTechnicalError(message: string): boolean {
  return (
    /violates|constraint|relation|column|syntax|postgres|sql|fkey|pkey|duplicate key|insert or update on table/i.test(
      message,
    ) || /_[a-z0-9]+_fkey/i.test(message)
  );
}

/** API/DB 오류를 사용자에게 보여줄 문구로 변환 */
export function formatUserFacingError(
  error: unknown,
  fallback: string = ERRORS.fallback,
): string {
  const rawMessage = extractErrorMessage(error);
  if (!rawMessage) return fallback;

  const normalized = rawMessage.toLowerCase();

  for (const [backendMessage, userMessage] of Object.entries(
    BACKEND_ERROR_MESSAGES,
  )) {
    if (normalized === backendMessage || normalized.includes(backendMessage)) {
      return userMessage;
    }
  }

  for (const pattern of TECHNICAL_ERROR_PATTERNS) {
    if (pattern.test.test(rawMessage)) return pattern.message;
  }

  if (isTechnicalError(rawMessage)) return fallback;

  return rawMessage;
}
