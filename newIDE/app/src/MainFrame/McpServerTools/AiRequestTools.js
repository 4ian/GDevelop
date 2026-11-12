// @flow
import {
  type McpServerTool,
  type McpOpenedProject,
  type McpServerToolOutput,
  describeProject,
} from './McpServerTool';
import {
  DEFAULT_AI_REQUEST_CONTINUE_MESSAGE,
  DEFAULT_AI_REQUEST_MAX_USER_CONTINUES,
  DEFAULT_AI_REQUEST_TIMEOUT_MS,
  type AutomatedAiRequestOptions,
  type AutomatedAiRequestRun,
} from '../../AiGeneration/AskAiAutomation';
import { delay } from '../../Utils/Delay';

/**
 * Tools running a request of the GDevelop AI in the Ask AI editor, as a user
 * would (see `AskAiAutomation`): to let the GDevelop AI make a game or a
 * change, or to compare what prompts, models or tools versions give on the
 * same requests.
 * A request takes minutes, more than what clients wait for a tool: it is
 * started by a tool, and waited for by another one, called again until the
 * request ended.
 */
export type McpAiRequests = {|
  // Opens the Ask AI editor and starts the request. Throws if one is running.
  startAiRequest: (options: AutomatedAiRequestOptions) => AutomatedAiRequestRun,
  // The last request started, running or ended.
  getAiRequestRun: () => AutomatedAiRequestRun | null,
|};

// Long enough for the backend to create the request in most cases, short
// enough for any client.
const MAX_START_WAIT_MS = 20_000;
const DEFAULT_WAIT_SECONDS = 45;
const MAX_WAIT_SECONDS = 300;

const getString = (toolArguments: Object, name: string): string | null =>
  typeof toolArguments[name] === 'string' && toolArguments[name].trim()
    ? toolArguments[name].trim()
    : null;

const getPositiveNumber = (
  toolArguments: Object,
  name: string
): number | null =>
  typeof toolArguments[name] === 'number' && toolArguments[name] >= 0
    ? toolArguments[name]
    : null;

const describeRun = (
  run: AutomatedAiRequestRun,
  getOpenedProject: ?() => ?McpOpenedProject
): McpServerToolOutput => {
  const result = run.getResult();
  const openedProject = getOpenedProject ? getOpenedProject() : null;
  const value: { [string]: any } = {
    status: result ? result.status : 'running',
    ai_request_id: run.getAiRequestId(),
    elapsed_seconds: Math.round(run.getDurationMs() / 1000),
    user_continues_count: run.getUserContinuesCount(),
  };
  if (result) {
    if (result.error) value.error = result.error;
    value.has_unfinished_plan = result.hasUnfinishedPlan;
    value.opened_project = openedProject
      ? describeProject(openedProject)
      : null;
  } else {
    value.message =
      'The GDevelop AI is still working: call `wait_for_ai_request` again. Do not call the other tools meanwhile: they would change the project the AI is working on.';
  }
  return {
    value,
    isError:
      !!result && (result.status === 'error' || result.status === 'timeout'),
  };
};

export const makeAiRequestTools = (
  aiRequests: McpAiRequests
): Array<McpServerTool> => [
  {
    definition: {
      name: 'start_ai_request',
      description:
        'Send a request to the GDevelop AI in the Ask AI editor, as the user would type it, and let it work until it is done (it is answered to continue when it stops with work left, see `max_user_continues`). Without a project opened, the GDevelop AI creates one (from a game template) then builds the game; otherwise it works on the opened project. This uses the AI credits of the logged in user: only do it when the user asked for the GDevelop AI. It returns once the request is started: call `wait_for_ai_request` until it ended (several minutes). Only one request can run at a time.',
      inputSchema: {
        type: 'object',
        properties: {
          user_request: {
            type: 'string',
            description: 'The request, as typed by a user in the chat.',
          },
          ai_configuration_preset_id: {
            type: 'string',
            description:
              'Optional: the identifier of the AI configuration preset (the "mode" chosen in the chat). The default one if not set.',
          },
          tools_version: {
            type: 'string',
            description:
              'Optional: the tools version to make the request with, instead of the one of the editor (like an experimental one of the backend, to compare prompts).',
          },
          continue_message: {
            type: 'string',
            description:
              'Optional: what is answered to the AI when it stops and waits for the user with work left to do (a question, a plan to confirm).',
          },
          max_user_continues: {
            type: 'number',
            description: `Optional: how many times at most the AI is answered to continue (${DEFAULT_AI_REQUEST_MAX_USER_CONTINUES} if not set). Each answer is a user message the request would not have had otherwise.`,
          },
          timeout_minutes: {
            type: 'number',
            description: `Optional: the request is given up after this long (${DEFAULT_AI_REQUEST_TIMEOUT_MS /
              60000} minutes if not set).`,
          },
        },
        required: ['user_request'],
      },
    },
    isAvailable: ({ isReadOnly }) => !isReadOnly,
    call: async (toolArguments, { getOpenedProject }) => {
      const userRequest = getString(toolArguments, 'user_request');
      if (!userRequest) {
        return { value: { message: 'Missing `user_request`.' }, isError: true };
      }
      const currentRun = aiRequests.getAiRequestRun();
      if (currentRun && !currentRun.getResult()) {
        return {
          value: {
            message:
              'Nothing was done: an AI request is already running. Wait for its end with `wait_for_ai_request`.',
            ai_request_id: currentRun.getAiRequestId(),
          },
          isError: true,
        };
      }
      const timeoutMinutes = getPositiveNumber(
        toolArguments,
        'timeout_minutes'
      );
      const maxUserContinues = getPositiveNumber(
        toolArguments,
        'max_user_continues'
      );
      const run = aiRequests.startAiRequest({
        userRequest,
        aiConfigurationPresetId:
          getString(toolArguments, 'ai_configuration_preset_id') || 'default',
        toolsVersion: getString(toolArguments, 'tools_version'),
        continueMessage:
          getString(toolArguments, 'continue_message') ||
          DEFAULT_AI_REQUEST_CONTINUE_MESSAGE,
        maxUserContinues:
          maxUserContinues !== null
            ? maxUserContinues
            : DEFAULT_AI_REQUEST_MAX_USER_CONTINUES,
        timeoutMs:
          timeoutMinutes !== null
            ? timeoutMinutes * 60 * 1000
            : DEFAULT_AI_REQUEST_TIMEOUT_MS,
      });

      // Give the identifier of the request, or why it could not start.
      const startTime = Date.now();
      while (
        !run.getAiRequestId() &&
        !run.getResult() &&
        Date.now() - startTime < MAX_START_WAIT_MS
      ) {
        await delay(100);
      }
      return describeRun(run, getOpenedProject);
    },
  },
  {
    definition: {
      name: 'wait_for_ai_request',
      description:
        'Wait for the end of the request started with `start_ai_request`. It returns after `max_wait_seconds` if the GDevelop AI is still working (`status` is then "running": call again), or as soon as the request ended: "finished" (the AI is done, the project it created or changed is opened in the editor), "waiting_for_user" (the AI stopped with work left and was not answered: a question, a plan to confirm or to finish), "error" or "timeout" (the request was suspended).',
      inputSchema: {
        type: 'object',
        properties: {
          max_wait_seconds: {
            type: 'number',
            description: `Optional: how long to wait at most (${DEFAULT_WAIT_SECONDS} if not set, at most ${MAX_WAIT_SECONDS}). Keep it under the tool call timeout of the client.`,
          },
        },
      },
      annotations: { readOnlyHint: true },
    },
    isAvailable: ({ isReadOnly }) => !isReadOnly,
    // The request may have created a project, or opened another one.
    opensProject: true,
    call: async (toolArguments, { getOpenedProject }) => {
      const run = aiRequests.getAiRequestRun();
      if (!run) {
        return {
          value: {
            message:
              'No AI request was started: start one with `start_ai_request`.',
          },
          isError: true,
        };
      }
      const requestedWaitSeconds = getPositiveNumber(
        toolArguments,
        'max_wait_seconds'
      );
      const waitMs =
        Math.min(
          requestedWaitSeconds !== null
            ? requestedWaitSeconds
            : DEFAULT_WAIT_SECONDS,
          MAX_WAIT_SECONDS
        ) * 1000;
      if (!run.getResult()) {
        let timeoutId = null;
        await Promise.race([
          run.promise,
          new Promise(resolve => {
            timeoutId = setTimeout(resolve, waitMs);
          }),
        ]);
        if (timeoutId) clearTimeout(timeoutId);
      }
      return describeRun(run, getOpenedProject);
    },
  },
];
