// @flow
import { makeAiRequestTools, type McpAiRequests } from './AiRequestTools';
import {
  DEFAULT_AI_REQUEST_CONTINUE_MESSAGE,
  DEFAULT_AI_REQUEST_MAX_USER_CONTINUES,
  DEFAULT_AI_REQUEST_TIMEOUT_MS,
  type AutomatedAiRequestResult,
  type AutomatedAiRequestRun,
} from '../../AiGeneration/AskAiAutomation';
import { type McpServerTool, type McpOpenedProject } from './McpServerTool';

const makeFakeAiRequests = (): {|
  aiRequests: McpAiRequests,
  startAiRequest: JestMockFn<any, any>,
  setAiRequestId: (aiRequestId: string) => void,
  end: (result: Partial<AutomatedAiRequestResult>) => void,
|} => {
  let run: AutomatedAiRequestRun | null = null;
  let aiRequestId: string | null = null;
  let result: AutomatedAiRequestResult | null = null;
  let resolveRun: (result: AutomatedAiRequestResult) => void = () => {};
  const startAiRequest = jest.fn((options: any) => {
    aiRequestId = null;
    result = null;
    const newRun: AutomatedAiRequestRun = {
      getAiRequestId: () => aiRequestId,
      getUserContinuesCount: () => (result ? result.userContinuesCount : 0),
      getDurationMs: () => 12_400,
      getResult: () => result,
      promise: new Promise(resolve => {
        resolveRun = resolve;
      }),
    };
    run = newRun;
    return newRun;
  });
  return {
    aiRequests: { startAiRequest, getAiRequestRun: () => run },
    startAiRequest,
    setAiRequestId: newAiRequestId => {
      aiRequestId = newAiRequestId;
    },
    end: partialResult => {
      result = {
        status: 'finished',
        aiRequestId,
        aiRequestStatus: 'ready',
        error: null,
        userContinuesCount: 0,
        durationMs: 12_400,
        hasProject: true,
        hasUnfinishedPlan: false,
        ...partialResult,
      };
      resolveRun(result);
    },
  };
};

const getTool = (tools: Array<McpServerTool>, name: string): McpServerTool => {
  const tool = tools.find(tool => tool.definition.name === name);
  if (!tool) throw new Error(`No tool named ${name}.`);
  return tool;
};

const context = { getOpenedProject: (() => null: ?() => ?McpOpenedProject) };

describe('AiRequestTools', () => {
  it('is not available on a read-only server', () => {
    const tools = makeAiRequestTools(makeFakeAiRequests().aiRequests);
    expect(tools.map(tool => tool.definition.name)).toEqual([
      'start_ai_request',
      'wait_for_ai_request',
    ]);
    tools.forEach(tool => {
      expect(tool.isAvailable({ isReadOnly: true })).toBe(false);
      expect(tool.isAvailable({ isReadOnly: false })).toBe(true);
    });
  });

  it('starts a request with the defaults and gives its identifier', async () => {
    const { aiRequests, startAiRequest, setAiRequestId } = makeFakeAiRequests();
    const startTool = getTool(
      makeAiRequestTools(aiRequests),
      'start_ai_request'
    );

    const outputPromise = startTool.call(
      { user_request: '  Make a racing game  ' },
      context
    );
    setAiRequestId('request-1');
    const output = await outputPromise;

    expect(startAiRequest).toHaveBeenCalledWith({
      userRequest: 'Make a racing game',
      aiConfigurationPresetId: 'default',
      toolsVersion: null,
      continueMessage: DEFAULT_AI_REQUEST_CONTINUE_MESSAGE,
      maxUserContinues: DEFAULT_AI_REQUEST_MAX_USER_CONTINUES,
      timeoutMs: DEFAULT_AI_REQUEST_TIMEOUT_MS,
    });
    expect(output.isError).toBe(false);
    expect(output.value.status).toBe('running');
    expect(output.value.ai_request_id).toBe('request-1');
  });

  it('starts a request with the given options', async () => {
    const { aiRequests, startAiRequest, setAiRequestId } = makeFakeAiRequests();
    const startTool = getTool(
      makeAiRequestTools(aiRequests),
      'start_ai_request'
    );

    const outputPromise = startTool.call(
      {
        user_request: 'Make a racing game',
        ai_configuration_preset_id: 'high',
        tools_version: 'v23-experiment',
        continue_message: 'Continue.',
        max_user_continues: 0,
        timeout_minutes: 10,
      },
      context
    );
    setAiRequestId('request-1');
    await outputPromise;

    expect(startAiRequest).toHaveBeenCalledWith({
      userRequest: 'Make a racing game',
      aiConfigurationPresetId: 'high',
      toolsVersion: 'v23-experiment',
      continueMessage: 'Continue.',
      maxUserContinues: 0,
      timeoutMs: 600_000,
    });
  });

  it('refuses a request without text, or while another one is running', async () => {
    const { aiRequests, startAiRequest, setAiRequestId } = makeFakeAiRequests();
    const startTool = getTool(
      makeAiRequestTools(aiRequests),
      'start_ai_request'
    );

    const emptyOutput = await startTool.call({ user_request: ' ' }, context);
    expect(emptyOutput.isError).toBe(true);
    expect(startAiRequest).not.toHaveBeenCalled();

    const outputPromise = startTool.call({ user_request: 'A game' }, context);
    setAiRequestId('request-1');
    await outputPromise;
    const refusedOutput = await startTool.call(
      { user_request: 'Another game' },
      context
    );
    expect(refusedOutput.isError).toBe(true);
    expect(refusedOutput.value.message).toContain('already running');
    expect(refusedOutput.value.ai_request_id).toBe('request-1');
    expect(startAiRequest).toHaveBeenCalledTimes(1);
  });

  it('gives why a request could not start', async () => {
    const { aiRequests, end } = makeFakeAiRequests();
    const startTool = getTool(
      makeAiRequestTools(aiRequests),
      'start_ai_request'
    );

    const outputPromise = startTool.call({ user_request: 'A game' }, context);
    end({ status: 'error', error: 'Not logged in.', hasProject: false });
    const output = await outputPromise;

    expect(output.isError).toBe(true);
    expect(output.value.status).toBe('error');
    expect(output.value.error).toBe('Not logged in.');
  });

  it('waits for the end of the request', async () => {
    const { aiRequests, setAiRequestId, end } = makeFakeAiRequests();
    const tools = makeAiRequestTools(aiRequests);
    const startTool = getTool(tools, 'start_ai_request');
    const waitTool = getTool(tools, 'wait_for_ai_request');

    const noRequestOutput = await waitTool.call({}, context);
    expect(noRequestOutput.isError).toBe(true);
    expect(noRequestOutput.value.message).toContain('start_ai_request');

    const startOutputPromise = startTool.call(
      { user_request: 'A game' },
      context
    );
    setAiRequestId('request-1');
    await startOutputPromise;

    // Still running once the wait is over.
    const runningOutput = await waitTool.call(
      { max_wait_seconds: 0.01 },
      context
    );
    expect(runningOutput.isError).toBe(false);
    expect(runningOutput.value.status).toBe('running');
    expect(runningOutput.value.elapsed_seconds).toBe(12);

    // Returns as soon as the request ended.
    const finishedOutputPromise = waitTool.call(
      { max_wait_seconds: 300 },
      {
        getOpenedProject: () => ({ name: 'My Racer', location: '/racer.json' }),
      }
    );
    end({ userContinuesCount: 2 });
    const finishedOutput = await finishedOutputPromise;
    expect(finishedOutput.isError).toBe(false);
    expect(finishedOutput.value).toEqual({
      status: 'finished',
      ai_request_id: 'request-1',
      elapsed_seconds: 12,
      user_continues_count: 2,
      has_unfinished_plan: false,
      opened_project: '"My Racer" (/racer.json)',
    });

    // The result is given again, and another request can then be started.
    expect((await waitTool.call({}, context)).value.status).toBe('finished');
    const secondStartOutputPromise = startTool.call(
      { user_request: 'Another game' },
      context
    );
    setAiRequestId('request-2');
    expect((await secondStartOutputPromise).value.ai_request_id).toBe(
      'request-2'
    );
  });

  it('reports a request left waiting for the user, not as an error', async () => {
    const { aiRequests, setAiRequestId, end } = makeFakeAiRequests();
    const tools = makeAiRequestTools(aiRequests);

    const startOutputPromise = getTool(tools, 'start_ai_request').call(
      { user_request: 'A game' },
      context
    );
    setAiRequestId('request-1');
    await startOutputPromise;
    end({ status: 'waiting_for_user', hasUnfinishedPlan: true });

    const output = await getTool(tools, 'wait_for_ai_request').call(
      {},
      context
    );
    expect(output.isError).toBe(false);
    expect(output.value.status).toBe('waiting_for_user');
    expect(output.value.has_unfinished_plan).toBe(true);
  });

  it('reports a request ended by an error or a timeout as an error', async () => {
    const { aiRequests, setAiRequestId, end } = makeFakeAiRequests();
    const tools = makeAiRequestTools(aiRequests);

    const startOutputPromise = getTool(tools, 'start_ai_request').call(
      { user_request: 'A game' },
      context
    );
    setAiRequestId('request-1');
    await startOutputPromise;
    end({ status: 'timeout', error: 'Not finished after 2700s.' });

    const output = await getTool(tools, 'wait_for_ai_request').call(
      {},
      context
    );
    expect(output.isError).toBe(true);
    expect(output.value.status).toBe('timeout');
    expect(output.value.error).toBe('Not finished after 2700s.');
  });
});
