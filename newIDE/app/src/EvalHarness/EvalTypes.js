// @flow

/**
 * Shared types for the AI agent evaluation harness.
 *
 * The harness drives the *real* AI agent loop headlessly:
 *  - the real backend (over HTTP, with an API key),
 *  - the real `EditorFunctions` executing against a real `libGDevelop` project,
 *  - real prompts (fetched by the backend from R2),
 * and grades the outcome with a mix of objective checks (run against the actual
 * `gdProject` and the transcript) and an optional LLM judge.
 *
 * See ./README.md for the architecture overview.
 */

import { type EditorFunctionCall } from '../EditorFunctions';

/** An AiRequest message as returned by the backend (loosely typed on purpose). */
export type AiRequestMessage = Object;

/** An AiRequest object as returned by the backend. */
export type AiRequest = {
  id: string,
  status: 'working' | 'ready' | 'error' | 'suspended',
  mode: string,
  parentAiRequestId?: ?string,
  output: Array<AiRequestMessage>,
  stats?: ?Object,
  contextStats?: ?Object,
  lastUserMessagePriceInCredits?: ?number,
  totalPriceInCredits?: ?number,
  error?: ?Object,
};

/**
 * A model put under test. `modelUniqueId` must exist in the backend's
 * `llm-models.js`. `usages` lists the agent roles this model should be pinned
 * for. For example, to benchmark a cheaper edit sub-agent model:
 *   { id: 'gpt-5.4-nano', modelUniqueId: 'gpt54n-or-openai', usages: ['agent-edit'] }
 *
 * Any role not listed keeps the backend's default routing, so you can swap a
 * single sub-agent at a time and keep everything else constant.
 */
export type ModelUnderTest = {|
  /** Human-friendly id used in the report (e.g. 'gpt-5.4-nano'). */
  id: string,
  /** A `modelUniqueId` from the backend `llm-models.js`. */
  modelUniqueId: string,
  /**
   * Which agent roles to pin to this model. The strings are backend `LlmUsage`
   * values: 'orchestrator' | 'agent' | 'agent-edit' | 'agent-explorer' |
   * 'chat' | 'ai-generated-event'.
   */
  usages: Array<string>,
  /** Optional notes shown in the report. */
  notes?: string,
|};

/**
 * A baseline "model under test" meaning: change nothing, let the backend route
 * models exactly as it does in production. Useful as a control in the matrix.
 */
export const PRODUCTION_DEFAULTS: ModelUnderTest = {
  id: 'production-defaults',
  modelUniqueId: '',
  usages: [],
  notes: 'No override - backend preset/tier routing as in production.',
};

/** Per-turn timing captured by the harness while driving the loop. */
export type TurnTiming = {|
  /** Wall-clock ms the backend spent producing this turn (poll-to-ready). */
  backendMs: number,
  /** Wall-clock ms the client spent executing this turn's tool calls. */
  toolsMs: number,
  /** Which request produced this turn (parent or a sub-agent id). */
  aiRequestId: string,
|};

/**
 * The raw outcome of a single scenario run (one sample). `project` is still
 * open here so objective graders can inspect it; the runner deletes it after
 * grading.
 */
export type RunResult = {|
  scenarioId: string,
  modelUnderTestId: string,
  /** Did the loop terminate cleanly (no infra error / timeout)? */
  completed: boolean,
  /** Failure reason if `completed` is false. */
  failureReason?: string,
  /** The live gdProject after the run (deleted by the runner post-grading). */
  project: ?Object,
  /** Parent AiRequest plus every sub-agent request, in creation order. */
  requests: Array<AiRequest>,
  /** All function calls executed locally, with their results. */
  executedToolCalls: Array<{|
    aiRequestId: string,
    call: EditorFunctionCall,
    success: boolean,
    didModifyProject?: boolean,
    output: Object,
  |}>,
  timings: Array<TurnTiming>,
  /** Total wall-clock ms for the whole run. */
  totalMs: number,
|};

/** A single grader's verdict. */
export type GraderResult = {|
  graderId: string,
  /** 'objective' (deterministic) or 'llm-judge' (subjective). */
  kind: 'objective' | 'llm-judge',
  passed: boolean,
  /** 0..1 score. Objective graders usually return 0 or 1. */
  score: number,
  /** How much this grader counts toward the scenario score. Default 1. */
  weight: number,
  message: string,
|};

/** Numeric metrics derived from a RunResult (pure, see metrics.js). */
export type RunMetrics = {|
  turnCount: number,
  toolCallCount: number,
  subAgentCount: number,
  /** Histogram of tool name -> count. */
  toolCallHistogram: { [toolName: string]: number },
  totalMs: number,
  backendMs: number,
  toolsMs: number,
  /** Estimated/real token totals if available, else null. */
  totalTokens: number | null,
  /** Credits charged for the run if reported by the backend, else null. */
  credits: number | null,
  /** The model id the backend actually ran (from stats), per request. */
  finalModelPublicIds: Array<string>,
|};

/** The graded result of one sample. */
export type SampleResult = {|
  runResult: RunResult,
  metrics: RunMetrics,
  graderResults: Array<GraderResult>,
  /** Weighted pass: did the sample pass overall? */
  passed: boolean,
  /** Weighted score 0..1. */
  score: number,
|};

/** Aggregation across all samples of a (scenario, model) cell. */
export type CellAggregate = {|
  scenarioId: string,
  modelUnderTestId: string,
  sampleCount: number,
  /** Fraction of samples that passed (0..1). */
  passRate: number,
  /** Mean weighted score across samples. */
  meanScore: number,
  /** Per-grader pass rate, keyed by graderId. */
  graderPassRates: { [graderId: string]: number },
  latencyMsAvg: number,
  latencyMsMax: number,
  tokensAvg: number | null,
  tokensMax: number | null,
  creditsAvg: number | null,
  toolCallsAvg: number,
  /** Samples that failed to complete (infra/timeout). */
  erroredSampleCount: number,
|};

/** The full report produced by a suite run. */
export type EvalReport = {|
  startedAt: string,
  finishedAt: string,
  backendBaseUrl: string,
  scenarioIds: Array<string>,
  modelsUnderTest: Array<ModelUnderTest>,
  samplesPerCell: number,
  cells: Array<CellAggregate>,
|};
