import { formatUserFacingError } from '@/shared/lib/errors';
import { ERRORS } from '@/shared/copy';

type ApiErrorLike = { message: string } | null | undefined;

/** Supabase/HTTP 공통 — 에러면 throw */
export function throwIfError(
  error: ApiErrorLike,
  fallback: string = ERRORS.requestFailed,
): void {
  if (error) {
    throw new Error(formatUserFacingError(error, fallback));
  }
}

/** fetch JSON + 상태코드 검사 */
export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error(ERRORS.network);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `${ERRORS.requestFailed} (${res.status})`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(ERRORS.responseParse);
  }
}
