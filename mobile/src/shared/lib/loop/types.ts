/** 루프 상태·포트 타입 */

export type VerifyStatus = 'success' | 'continue' | 'failed_verify';

export type RunStatus =
  | 'running'
  | 'success'
  | 'failed_bound'
  | 'failed_verify'
  | 'stuck_abort'
  | 'stuck_escalate';

export type LoopTrigger = 'in_app' | 'cli' | 'http' | 'watch';

export type LoopBounds = {
  maxIterations: number;
  maxWallClockMs: number;
};

export type LoopRun = {
  id: string;
  goal: string;
  status: RunStatus;
  trigger: LoopTrigger;
  ownerUserId: string;
  goalDate: string;
  maxIterations: number;
  maxWallClockMs: number;
  createdAt: string;
  endedAt?: string | null;
  endedReason?: string | null;
};

export type LoopTurn = {
  id: string;
  runId: string;
  turn: number;
  planJson: unknown;
  resultJson: unknown;
  observeJson: unknown;
  verifyStatus: VerifyStatus | 'continue';
  createdAt: string;
};

export type OpenRunInput = {
  ownerUserId: string;
  goalDate: string;
  trigger: LoopTrigger;
  bounds: LoopBounds;
};

export type AppendTurnInput = {
  runId: string;
  turn: number;
  plan: unknown;
  result: unknown;
  observe: unknown;
  verifyStatus: VerifyStatus;
};

/** 스토어 포트 — SQLite/Supabase 구현 교체점 */
export type LoopStore = {
  openRun: (input: OpenRunInput) => Promise<LoopRun>;
  appendTurn: (input: AppendTurnInput) => Promise<LoopTurn>;
  finishRun: (
    runId: string,
    status: Exclude<RunStatus, 'running'>,
    endedReason: string,
  ) => Promise<void>;
  getOpenRunForDay: (
    ownerUserId: string,
    goalDate: string,
  ) => Promise<LoopRun | null>;
  listRecentObserveHashes: (
    runId: string,
    limit: number,
  ) => Promise<string[]>;
};
