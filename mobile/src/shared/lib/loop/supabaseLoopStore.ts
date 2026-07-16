import { supabase } from '@/shared/api/client';
import type {
  AppendTurnInput,
  LoopRun,
  LoopStore,
  LoopTurn,
  OpenRunInput,
  RunStatus,
} from '@/shared/lib/loop/types';

function mapRun(row: Record<string, unknown>): LoopRun {
  return {
    id: String(row.id),
    goal: String(row.goal),
    status: row.status as LoopRun['status'],
    trigger: row.trigger as LoopRun['trigger'],
    ownerUserId: String(row.owner_user_id),
    goalDate: String(row.goal_date),
    maxIterations: Number(row.max_iterations ?? 10),
    maxWallClockMs: Number(row.max_wall_clock_ms ?? 0),
    createdAt: String(row.created_at),
    endedAt: row.ended_at ? String(row.ended_at) : null,
    endedReason: row.ended_reason ? String(row.ended_reason) : null,
  };
}

/** Supabase 구현의 LoopStore 포트 */
export function createSupabaseLoopStore(): LoopStore {
  return {
    async openRun(input: OpenRunInput): Promise<LoopRun> {
      const goal = `verify_day:${input.ownerUserId}:${input.goalDate}`;
      const { data, error } = await supabase
        .from('runs')
        .insert({
          goal,
          status: 'running',
          trigger: input.trigger,
          owner_user_id: input.ownerUserId,
          goal_date: input.goalDate,
          max_iterations: input.bounds.maxIterations,
          max_wall_clock_ms: input.bounds.maxWallClockMs,
        })
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? 'openRun failed');
      }
      return mapRun(data);
    },

    async getOpenRunForDay(ownerUserId, goalDate) {
      const { data, error } = await supabase
        .from('runs')
        .select('*')
        .eq('owner_user_id', ownerUserId)
        .eq('goal_date', goalDate)
        .eq('status', 'running')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data ? mapRun(data) : null;
    },

    async appendTurn(input: AppendTurnInput): Promise<LoopTurn> {
      const { data, error } = await supabase
        .from('turns')
        .insert({
          run_id: input.runId,
          turn: input.turn,
          plan_json: input.plan,
          result_json: input.result,
          observe_json: input.observe,
          verify_status: input.verifyStatus,
        })
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? 'appendTurn failed');
      }

      return {
        id: String(data.id),
        runId: String(data.run_id),
        turn: Number(data.turn),
        planJson: data.plan_json,
        resultJson: data.result_json,
        observeJson: data.observe_json,
        verifyStatus: data.verify_status,
        createdAt: String(data.created_at),
      };
    },

    async finishRun(runId, status: Exclude<RunStatus, 'running'>, endedReason) {
      const { error } = await supabase
        .from('runs')
        .update({
          status,
          ended_reason: endedReason,
          ended_at: new Date().toISOString(),
        })
        .eq('id', runId);

      if (error) throw new Error(error.message);
    },

    async listRecentObserveHashes(runId, limit) {
      const { data, error } = await supabase
        .from('turns')
        .select('observe_json')
        .eq('run_id', runId)
        .order('turn', { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => {
        const obs = row.observe_json as { pendingHash?: string } | null;
        return obs?.pendingHash ?? '';
      });
    },
  };
}
