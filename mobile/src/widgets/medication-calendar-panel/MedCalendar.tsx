import {
  Calendar,
  LocaleConfig,
  type CalendarProps,
} from 'react-native-calendars';
import { CALENDAR_THEME } from '@/shared/config/theme';

let koLocaleReady = false;

/** react-native-calendars 한국어 로케일 — 최초 1회만 등록 */
function ensureKoCalendarLocale(): void {
  if (koLocaleReady) return;

  LocaleConfig.locales.ko = {
    monthNames: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    monthNamesShort: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    dayNames: [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘',
  };
  LocaleConfig.defaultLocale = 'ko';
  koLocaleReady = true;
}

ensureKoCalendarLocale();

type Props = CalendarProps;

/** 복약 기록용 월 캘린더 — 한국어 로케일·기본 테마 포함 */
export function MedCalendar({ theme, ...rest }: Props) {
  return <Calendar theme={theme ?? CALENDAR_THEME} {...rest} />;
}
