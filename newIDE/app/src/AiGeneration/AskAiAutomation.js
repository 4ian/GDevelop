// @flow
import { type AiRequest } from '../Utils/GDevelopServices/Generation';
import { delay } from '../Utils/Delay';

// Allow an AI request to be run from start to end without a user, by the
// Ask AI editor itself (so with the very same code as a request made by a
// user): used by the `RUN_AI_REQUEST` command of the CLI and by the
// `start_ai_request` tool of the MCP server, to compare what prompts, models
// or tools versions give on the same requests.

export type AskAiAutomationState = {|
  // The AI request shown by the Ask AI editor, if any.
  aiRequest: ?AiRequest,
  // The AI, a sub-agent or the editor is working on the request.
  hasWorkInProgress: boolean,
  isSending: boolean,
  isSavingProject: boolean,
  lastSendError: ?Error,
  hasProject: boolean,
  // The plan made by the AI has tasks which are not done yet.
  hasUnfinishedPlan: boolean,
|};

/** What the Ask AI editor gives to run a request without a user. */
export type AskAiAutomationDriver = {|
  startNewChat: () => void,
  startNewRequest: ({|
    userRequest: string,
    aiConfigurationPresetId: string,
  |}) => void,
  sendUserMessage: (userMessage: string) => Promise<void>,
  // Suspend the request, if the AI is working on it.
  stop: () => Promise<void>,
  getState: () => AskAiAutomationState,
|};

let driver: AskAiAutomationDriver | null = null;
let toolsVersionOverride: string | null = null;

/**
 * Called by the Ask AI editor, once mounted. Returns the function to
 * unregister.
 */
export const registerAskAiAutomationDriver = (
  newDriver: AskAiAutomationDriver
): (() => void) => {
  driver = newDriver;
  return () => {
    if (driver === newDriver) driver = null;
  };
};

/**
 * The tools version to use instead of the default one, while an automated
 * request asking for another one runs.
 */
export const getAiToolsVersionOverride = (): string | null =>
  toolsVersionOverride;

export type AutomatedAiRequestOptions = {|
  userRequest: string,
  aiConfigurationPresetId: string,
  // The tools version of the request, if not the default one of the editor.
  toolsVersion: string | null,
  // What is answered when the AI stops and waits for the user while the
  // work is not done (see `isAiWorkDone`), and how many times at most. Each
  // answer is a user message the request would not have had otherwise: keep
  // them rare to compare requests.
  continueMessage: string,
  maxUserContinues: number,
  timeoutMs: number,
|};

export const DEFAULT_AI_REQUEST_CONTINUE_MESSAGE =
  "Go ahead, and continue until everything is done. Don't ask me anything: make the decisions yourself.";
export const DEFAULT_AI_REQUEST_MAX_USER_CONTINUES = 1;
export const DEFAULT_AI_REQUEST_TIMEOUT_MS = 45 * 60 * 1000;

// - "finished": the AI did the work and waits for the user.
// - "waiting_for_user": the AI waits for the user with work left (a question,
//   a plan to confirm or to finish), and was not answered (anymore).
// - "timeout": the request was not finished in time, and was suspended.
export type AutomatedAiRequestStatus =
  | 'finished'
  | 'waiting_for_user'
  | 'error'
  | 'timeout';

export type AutomatedAiRequestResult = {|
  status: AutomatedAiRequestStatus,
  aiRequestId: string | null,
  aiRequestStatus: string | null,
  error: string | null,
  userContinuesCount: number,
  durationMs: number,
  hasProject: boolean,
  hasUnfinishedPlan: boolean,
|};

/** An automated AI request, running or ended. */
export type AutomatedAiRequestRun = {|
  // Null until the request is created by the backend.
  getAiRequestId: () => string | null,
  getUserContinuesCount: () => number,
  getDurationMs: () => number,
  // Null while the request is running.
  getResult: () => AutomatedAiRequestResult | null,
  // Never rejected: a failure is a result.
  promise: Promise<AutomatedAiRequestResult>,
|};

const POLL_INTERVAL_MS = 1000;
const DRIVER_TIMEOUT_MS = 60_000;
const REQUEST_START_TIMEOUT_MS = 120_000;
// The request is considered as waiting for the user when nothing happened
// for this long: the editor chains a few steps (sending the results of the
// function calls, saving the project) between which it is idle for a moment.
const IDLE_BEFORE_WAITING_FOR_USER_MS = 8000;

const waitFor = async <T>(
  getValue: () => ?T,
  timeoutMs: number
): Promise<?T> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const value = getValue();
    if (value) return value;
    await delay(200);
  }
  return null;
};

/**
 * The AI called functions (so made changes, launched sub-agents...) since
 * the last message of the user: otherwise, it only answered (a question, a
 * plan to confirm...).
 */
export const hasAiWorkedSinceLastUserMessage = (
  aiRequest: AiRequest
): boolean => {
  const output = aiRequest.output || [];
  for (let i = output.length - 1; i >= 0; i--) {
    const message = output[i];
    if (message.type === 'function_call_output') return true;
    if (message.type !== 'message') continue;
    if (message.role === 'user') return false;
    if (message.content.some(content => content.type === 'function_call'))
      return true;
  }
  return false;
};

/**
 * When the AI waits for the user, its work is done if there is a project,
 * no task left in its plan (if any), and it did something since the user
 * last wrote: not if it asked a question instead of working.
 */
export const isAiWorkDone = (state: AskAiAutomationState): boolean =>
  state.hasProject &&
  !state.hasUnfinishedPlan &&
  !!state.aiRequest &&
  hasAiWorkedSinceLastUserMessage(state.aiRequest);

type AutomatedAiRequestProgress = {|
  startTime: number,
  aiRequestId: string | null,
  userContinuesCount: number,
|};

const runUntilDone = async (
  {
    userRequest,
    aiConfigurationPresetId,
    toolsVersion,
    continueMessage,
    maxUserContinues,
    timeoutMs,
  }: AutomatedAiRequestOptions,
  progress: AutomatedAiRequestProgress
): Promise<AutomatedAiRequestResult> => {
  const { startTime } = progress;
  const getDriver = (): AskAiAutomationDriver => {
    if (!driver) throw new Error('The Ask AI editor was closed.');
    return driver;
  };
  const makeResult = (
    status: AutomatedAiRequestStatus,
    error: string | null
  ): AutomatedAiRequestResult => {
    const state = driver ? driver.getState() : null;
    return {
      status,
      aiRequestId: progress.aiRequestId,
      aiRequestStatus: state && state.aiRequest ? state.aiRequest.status : null,
      error,
      userContinuesCount: progress.userContinuesCount,
      durationMs: Date.now() - startTime,
      hasProject: !!state && state.hasProject,
      hasUnfinishedPlan: !!state && state.hasUnfinishedPlan,
    };
  };

  if (!(await waitFor(() => driver, DRIVER_TIMEOUT_MS))) {
    return makeResult('error', 'The Ask AI editor is not opened.');
  }

  toolsVersionOverride = toolsVersion;
  try {
    // Start from a new chat, whatever the editor was showing.
    if (getDriver().getState().aiRequest) {
      getDriver().startNewChat();
      await waitFor(() => !getDriver().getState().aiRequest, 10_000);
    }
    getDriver().startNewRequest({ userRequest, aiConfigurationPresetId });

    const startedAiRequest = await waitFor(() => {
      const state = getDriver().getState();
      return state.aiRequest || state.lastSendError;
    }, REQUEST_START_TIMEOUT_MS);
    const startState = getDriver().getState();
    if (!startedAiRequest || !startState.aiRequest) {
      return makeResult(
        'error',
        startState.lastSendError
          ? `The AI request could not be started: ${
              startState.lastSendError.message
            }`
          : 'The AI request was not started: is the user logged in, with AI credits left in their plan (or paying with their credits allowed)?'
      );
    }
    const aiRequestId = startState.aiRequest.id;
    progress.aiRequestId = aiRequestId;
    console.info(`[AI request] Started: ${aiRequestId}`);

    let idleSince: number | null = null;
    while (Date.now() - startTime < timeoutMs) {
      await delay(POLL_INTERVAL_MS);
      const state = getDriver().getState();
      const { aiRequest } = state;
      if (!aiRequest || aiRequest.id !== aiRequestId) {
        return makeResult(
          'error',
          'The Ask AI editor is not showing the AI request anymore.'
        );
      }
      if (aiRequest.status === 'error') {
        return makeResult(
          'error',
          aiRequest.error
            ? `${aiRequest.error.code}: ${aiRequest.error.message}`
            : 'The AI request ended with an error.'
        );
      }
      if (state.lastSendError) {
        return makeResult(
          'error',
          `A message could not be sent: ${state.lastSendError.message}`
        );
      }

      if (state.hasWorkInProgress || state.isSending || state.isSavingProject) {
        idleSince = null;
        continue;
      }
      if (idleSince === null) {
        idleSince = Date.now();
        continue;
      }
      if (Date.now() - idleSince < IDLE_BEFORE_WAITING_FOR_USER_MS) continue;

      // The AI is waiting for the user.
      if (isAiWorkDone(state)) return makeResult('finished', null);
      if (progress.userContinuesCount >= maxUserContinues) {
        return makeResult('waiting_for_user', null);
      }
      progress.userContinuesCount++;
      console.info(
        `[AI request] The AI waits for the user: answering (${
          progress.userContinuesCount
        }/${maxUserContinues}).`
      );
      await getDriver().sendUserMessage(continueMessage);
      idleSince = null;
    }

    // Don't let the AI work (and use credits) on a request given up.
    try {
      await getDriver().stop();
    } catch (error) {
      console.error('[AI request] The request could not be suspended:', error);
    }
    return makeResult(
      'timeout',
      `The AI request was not finished after ${Math.round(
        timeoutMs / 1000
      )}s: it was suspended.`
    );
  } catch (error) {
    return makeResult('error', error.message || String(error));
  } finally {
    toolsVersionOverride = null;
  }
};

let currentRun: AutomatedAiRequestRun | null = null;

/** The last automated AI request started, running or ended, if any. */
export const getAutomatedAiRequestRun = (): AutomatedAiRequestRun | null =>
  currentRun;

/**
 * Start an AI request in the Ask AI editor (which must be opened), run until
 * the AI is done: it is started, `continueMessage` is answered when the AI
 * waits for the user with work left to do (at most `maxUserContinues` times),
 * and it ends once the AI waits with its work done (see `isAiWorkDone`).
 * Only one can run at a time (there is one Ask AI editor).
 */
export const startAutomatedAiRequest = (
  options: AutomatedAiRequestOptions
): AutomatedAiRequestRun => {
  if (currentRun && !currentRun.getResult()) {
    throw new Error('An automated AI request is already running.');
  }
  const progress: AutomatedAiRequestProgress = {
    startTime: Date.now(),
    aiRequestId: null,
    userContinuesCount: 0,
  };
  let result: AutomatedAiRequestResult | null = null;
  const run: AutomatedAiRequestRun = {
    getAiRequestId: () => progress.aiRequestId,
    getUserContinuesCount: () => progress.userContinuesCount,
    getDurationMs: () =>
      result ? result.durationMs : Date.now() - progress.startTime,
    getResult: () => result,
    promise: runUntilDone(options, progress).then(runResult => {
      result = runResult;
      return runResult;
    }),
  };
  currentRun = run;
  return run;
};

/** Start an automated AI request and wait for its end. */
export const runAutomatedAiRequest = (
  options: AutomatedAiRequestOptions
): Promise<AutomatedAiRequestResult> =>
  startAutomatedAiRequest(options).promise;
