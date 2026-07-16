type ApiErrorLike = { message: string } | null | undefined;

/** Supabase/HTTP 공통 — 에러면 throw */
export function throwIfError(
  error: ApiErrorLike,
  fallback = '요청에 실패했어요',
): void {
  if (error) throw new Error(error.message || fallback);
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
    throw new Error('네트워크를 확인해 주세요');
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `요청에 실패했어요 (${res.status})`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('응답을 해석하지 못했어요');
  }
}
