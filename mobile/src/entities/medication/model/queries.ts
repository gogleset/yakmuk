import { type QueryClient, useQueries } from '@tanstack/react-query';
import { listLogsInRange } from '@/entities/medication/api/list-logs-in-range';
import { listMedications } from '@/entities/medication/api/list-medications';
import { listMedicationsForCalendar } from '@/entities/medication/api/list-medications-for-calendar';
import { listTodayTaken } from '@/entities/medication/api/list-today-taken';
import { monthRange } from '@/entities/medication/lib/calendar';
import { medicationKeys } from '@/entities/medication/model/queryKeys';

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

  const [meds, calendarMeds, taken, logs] = useQueries({
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
    ],
  });

  return { meds, calendarMeds, taken, logs };
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
