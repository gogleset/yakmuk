import { COPY } from '@/shared/copy';
import type { CareAlertSlide } from './model/types';

/** UI 확인용 고정 슬라이드 — 1·3·5일 stuck + BAD */
export const MOCK_CARE_ALERTS: CareAlertSlide[] = [
  {
    id: 'mock-stuck-1',
    tone: 'stuck',
    title: COPY.family.careStuckTitle('엄마'),
    body: COPY.family.careStuckDays(1),
  },
  {
    id: 'mock-stuck-3',
    tone: 'stuck',
    title: COPY.family.careStuckTitle('할머니'),
    body: COPY.family.careStuckDays(3),
  },
  {
    id: 'mock-stuck-5',
    tone: 'stuck',
    title: COPY.family.careStuckTitle('동생'),
    body: COPY.family.careStuckDays(5),
  },
  {
    id: 'mock-bad-1',
    tone: 'bad',
    title: COPY.family.careBadTitle('아빠'),
    body: COPY.family.careBadBody('오후에', '아픔'),
  },
];
