import { getDataGoKrServiceKey } from '@/shared/config/env';
import type { DrugSearchItem } from '@/entities/medication/model/types';

type EasyDrugRaw = {
  itemSeq?: string;
  itemName?: string;
  entpName?: string;
  itemImage?: string | null;
  efcyQesitm?: string | null;
  useMethodQesitm?: string | null;
  depositMethodQesitm?: string | null;
  atpnWarnQesitm?: string | null;
};

type EasyDrugResponse = {
  header?: { resultCode?: string; resultMsg?: string };
  body?: {
    totalCount?: number;
    items?: EasyDrugRaw | EasyDrugRaw[];
  };
};

const EASY_DRUG_URL =
  'https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

function normalizeItems(items: EasyDrugRaw | EasyDrugRaw[] | undefined): EasyDrugRaw[] {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

function cleanText(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || null;
}

export async function searchDrugsByName(
  query: string,
  options?: { pageNo?: number; numOfRows?: number },
): Promise<{ items: DrugSearchItem[]; totalCount: number }> {
  const q = query.trim();
  if (q.length < 2) return { items: [], totalCount: 0 };

  let serviceKey: string;
  try {
    serviceKey = getDataGoKrServiceKey();
  } catch (e) {
    throw e instanceof Error ? e : new Error('공공 API 키가 없어요');
  }

  const pageNo = options?.pageNo ?? 1;
  const numOfRows = options?.numOfRows ?? 20;
  const params = new URLSearchParams({
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    itemName: q,
    type: 'json',
  });

  const url = `${EASY_DRUG_URL}?serviceKey=${serviceKey}&${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('약 정보를 불러오지 못했어요. 네트워크를 확인해 주세요.');
  }

  const text = await res.text();
  if (!res.ok) {
    if (res.status === 403 || /forbidden/i.test(text)) {
      throw new Error(
        '공공 API 접근이 막혀 있어요. 포털에서 e약은요 활용신청·키 상태를 확인해 주세요.',
      );
    }
    throw new Error(`약 검색에 실패했어요 (${res.status})`);
  }

  let json: EasyDrugResponse;
  try {
    json = JSON.parse(text) as EasyDrugResponse;
  } catch {
    throw new Error('약 검색 응답을 해석하지 못했어요');
  }

  const code = json.header?.resultCode;
  if (code && code !== '00') {
    throw new Error(json.header?.resultMsg ?? '약 검색에 실패했어요');
  }

  const rawItems = normalizeItems(json.body?.items);
  const items: DrugSearchItem[] = rawItems
    .filter((row) => row.itemName && row.itemSeq)
    .map((row) => ({
      itemSeq: String(row.itemSeq),
      itemName: String(row.itemName).trim(),
      entpName: (row.entpName ?? '').trim() || '제조사 미상',
      itemImage: row.itemImage?.trim() || null,
      efficacy: cleanText(row.efcyQesitm ?? null),
      useMethod: cleanText(row.useMethodQesitm ?? null),
      storage: cleanText(row.depositMethodQesitm ?? null),
      warning: cleanText(row.atpnWarnQesitm ?? null),
    }));

  return {
    items,
    totalCount: Number(json.body?.totalCount ?? items.length),
  };
}
