import { supabase } from '@/shared/api/client';
import { upsertAlert } from '@/entities/family/api/upsert-alert';
import { msUntilKstDayEnd, todayKstDateString } from '@/shared/lib/kst';
import type { LoopStore, LoopTrigger, VerifyStatus } from '@/shared/lib/loop/types';
import { verifyDay } from '@/shared/lib/loop/verifyDay';

const DEFAULT_MAX_ITERATIONS = 10;
const STUCK_THRESHOLD = 3;

export type DayLoopActResult = {
  kind: 'toggle_medication' | 'submit_condition' | 'noop';
  payload?: unknown;
};

export type DayLoopStepResult = {
  runId: string;
  turn: number;
  verify: VerifyStatus;
  pendingMeds: number;
  conditionCount: number;
  ended?: string;
};

function hashPending(pendingIds: number[]): string {
  return [...pendingIds].sort((a, b) => a - b).join(',');
}

/**
 * 하루 run에 turn 하나 기록 + verify + bound/stuck 판정
 * (전체 while 루프는 UI 이벤트마다 step으로 돌림)
 */
export async function stepDayLoop(params: {
  store: LoopStore;
  userId: string;
  familyId?: string | null;
  trigger: LoopTrigger;
  plan: unknown;
  actResult: DayLoopActResult;
  pendingMedicationIds: number[];
  dateKst?: string;
}): Promise<DayLoopStepResult> {
  const dateKst = params.dateKst ?? todayKstDateString();
  const bounds = {
    maxIterations: DEFAULT_MAX_ITERATIONS,
    maxWallClockMs: msUntilKstDayEnd(),
  };

  let run = await params.store.getOpenRunForDay(params.userId, dateKst);
  if (!run) {
    run = await params.store.openRun({
      ownerUserId: params.userId,
      goalDate: dateKst,
      trigger: params.trigger,
      bounds,
    });
  }

  // bound: wall clock
  const elapsed = Date.now() - new Date(run.createdAt).getTime();
  if (elapsed > run.maxWallClockMs && run.maxWallClockMs > 0) {
    await params.store.finishRun(run.id, 'failed_bound', 'wall_clock');
    return {
      runId: run.id,
      turn: 0,
      verify: 'continue',
      pendingMeds: -1,
      conditionCount: -1,
      ended: 'failed_bound',
    };
  }

  const { count } = await supabase
    .from('turns')
    .select('id', { count: 'exact', head: true })
    .eq('run_id', run.id);

  const nextTurn = (count ?? 0) + 1;
  if (nextTurn > run.maxIterations) {
    await params.store.finishRun(run.id, 'failed_bound', 'max_iterations');
    return {
      runId: run.id,
      turn: nextTurn,
      verify: 'continue',
      pendingMeds: -1,
      conditionCount: -1,
      ended: 'failed_bound',
    };
  }

  const pendingHash = hashPending(params.pendingMedicationIds);
  const observe = {
    pendingHash,
    pendingMedicationIds: params.pendingMedicationIds,
    act: params.actResult.kind,
  };

  const verified = await verifyDay(params.userId, dateKst);

  await params.store.appendTurn({
    runId: run.id,
    turn: nextTurn,
    plan: params.plan,
    result: params.actResult,
    observe,
    verifyStatus: verified.status,
  });

  if (verified.status === 'success') {
    await params.store.finishRun(run.id, 'success', 'day_complete');
    return {
      runId: run.id,
      turn: nextTurn,
      verify: verified.status,
      pendingMeds: verified.pendingMeds,
      conditionCount: verified.conditionCount,
      ended: 'success',
    };
  }

  if (verified.status === 'failed_verify') {
    await params.store.finishRun(run.id, 'failed_verify', 'verify_failed');
    return {
      runId: run.id,
      turn: nextTurn,
      verify: verified.status,
      pendingMeds: verified.pendingMeds,
      conditionCount: verified.conditionCount,
      ended: 'failed_verify',
    };
  }

  const hashes = await params.store.listRecentObserveHashes(
    run.id,
    STUCK_THRESHOLD,
  );
  if (
    hashes.length >= STUCK_THRESHOLD &&
    hashes.every((h) => h === pendingHash && h !== '')
  ) {
    await params.store.finishRun(run.id, 'stuck_escalate', 'same_observe_hash');
    console.warn('[loop] stuck_escalate', run.id, pendingHash);

    // 보호자가 runs를 못 보므로 family_alerts로 노출
    if (params.familyId) {
      await upsertAlert({
        familyId: params.familyId,
        userId: params.userId,
        kind: 'stuck_escalate',
        message: '복약 체크가 멈춰 있어요. 안부를 확인해 주세요.',
        payload: {
          runId: run.id,
          pendingHash,
          pendingCount: params.pendingMedicationIds.length,
          dateKst,
        },
      });
    }

    return {
      runId: run.id,
      turn: nextTurn,
      verify: verified.status,
      pendingMeds: verified.pendingMeds,
      conditionCount: verified.conditionCount,
      ended: 'stuck_escalate',
    };
  }

  return {
    runId: run.id,
    turn: nextTurn,
    verify: verified.status,
    pendingMeds: verified.pendingMeds,
    conditionCount: verified.conditionCount,
  };
}
