import { listLogsInRange } from '@/entities/medication/api/list-logs-in-range';
import { listMedications } from '@/entities/medication/api/list-medications';
import { listMedicationsForCalendar } from '@/entities/medication/api/list-medications-for-calendar';
import { listTodayTaken } from '@/entities/medication/api/list-today-taken';
import {
  addDaysKst,
  monthRange,
} from '@/entities/medication/lib/calendar';
import { medicationKeys } from '@/entities/medication/model/queryKeys';
import { type QueryClient, useQueries } from '@tanstack/react-query';

type HomeMedicationQueryParams = {
  userId: string | undefined;
  todayKst: string;
  visibleMonth: string;
};

export function useHomeMedicationQueries({
  userId,
  todayKst,
  visibleMonth,
}: HomeMedicationQueryParams) {
  const enabled = !!userId;
  const range = monthRange(visibleMonth);
  // streak N=3용 — 오늘 포함 과거 ~45일
  const streakFrom = addDaysKst(todayKst, -45);

  const [meds, calendarMeds, taken, logs, streakLogs] = useQueries({
    queries: [
      {
        queryKey: medicationKeys.list(userId!),
        queryFn: () => listMedications(userId!),
        enabled,
      },
      {
        queryKey: medicationKeys.calendar(userId!),
        queryFn: () => listMedicationsForCalendar(userId!),
        enabled,
      },
      {
        queryKey: medicationKeys.taken(userId!, todayKst),
        queryFn: () => listTodayTaken(userId!, todayKst),
        enabled,
      },
      {
        queryKey: medicationKeys.logs(userId!, visibleMonth),
        queryFn: () => listLogsInRange(userId!, range.from, range.to),
        enabled,
      },
      {
        queryKey: [...medicationKeys.logs(userId!, 'streak'), streakFrom, todayKst],
        queryFn: () => listLogsInRange(userId!, streakFrom, todayKst),
        enabled,
      },
    ],
  });

  return { meds, calendarMeds, taken, logs, streakLogs };
}

export async function invalidateMedicationActivity(
  qc: QueryClient,
): Promise<void> {
  await qc.invalidateQueries({ queryKey: medicationKeys.all });
}

export async function invalidateMedicationLists(
  qc: QueryClient,
): Promise<void> {
  await Promise.all([
    qc.invalidateQueries({ queryKey: medicationKeys.lists() }),
    qc.invalidateQueries({ queryKey: medicationKeys.calendars() }),
  ]);
}
