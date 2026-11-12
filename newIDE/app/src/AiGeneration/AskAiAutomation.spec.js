// @flow
import {
  registerAskAiAutomationDriver,
  startAutomatedAiRequest,
  getAutomatedAiRequestRun,
  getAiToolsVersionOverride,
  type AskAiAutomationDriver,
  type AskAiAutomationState,
  type AutomatedAiRequestOptions,
  type AutomatedAiRequestRun,
} from './AskAiAutomation';

const options: AutomatedAiRequestOptions = {
  userRequest: 'Make a racing game',
  aiConfigurationPresetId: 'default',
  toolsVersion: null,
  continueMessage: 'Continue.',
  maxUserContinues: 2,
  timeoutMs: 10 * 60 * 1000,
};

const userMessage = {
  type: 'message',
  role: 'user',
  content: [{ type: 'user_request', text: 'Make a racing game' }],
};
const assistantTextMessage = {
  type: 'message',
  role: 'assistant',
  content: [{ type: 'output_text', text: 'Which kind of game?' }],
};
const assistantFunctionCallMessage = {
  type: 'message',
  role: 'assistant',
  content: [{ type: 'function_call', call_id: 'call-1', name: 'create_scene' }],
};
const functionCallOutput = { type: 'function_call_output', call_id: 'call-1' };

// By default, the AI did some work after the request of the user.
const makeFakeAiRequest = (
  id: string,
  status: string,
  output: Array<any> = [
    userMessage,
    assistantFunctionCallMessage,
    functionCallOutput,
    assistantTextMessage,
  ]
): any => ({
  id,
  status,
  output,
  error:
    status === 'error' ? { code: 'internal-error', message: 'Failed.' } : null,
});

/** A fake Ask AI editor, whose state is set by the test. */
const makeFakeDriver = () => {
  const state: AskAiAutomationState = {
    aiRequest: null,
    hasWorkInProgress: false,
    isSending: false,
    isSavingProject: false,
    lastSendError: null,
    hasProject: false,
    hasUnfinishedPlan: false,
  };
  const startNewChat = jest.fn<[], void>(() => {
    state.aiRequest = null;
  });
  const startNewRequest = jest.fn<[any], void>();
  const sendUserMessage = jest.fn<[string], Promise<void>>(async () => {});
  const stop = jest.fn<[], Promise<void>>(async () => {});
  const driver: AskAiAutomationDriver = {
    startNewChat,
    startNewRequest,
    sendUserMessage,
    stop,
    getState: () => ({ ...state }),
  };
  return { state, driver };
};

// The run polls the editor with timers: let them fire, and the promises
// waiting for them resolve.
const advance = async (ms: number) => {
  for (let elapsed = 0; elapsed < ms; elapsed += 100) {
    jest.advanceTimersByTime(100);
    for (let i = 0; i < 10; i++) await Promise.resolve();
  }
};

describe('AskAiAutomation', () => {
  let unregisterDriver = () => {};
  let run: AutomatedAiRequestRun | null = null;

  beforeEach(() => {
    // $FlowFixMe[extra-arg] - the timers mocking the date too.
    jest.useFakeTimers('modern');
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });
  afterEach(async () => {
    // Let a run still going end (on its timeout), for the next test.
    if (run && !run.getResult()) await advance(options.timeoutMs + 5000);
    unregisterDriver();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('fails when the Ask AI editor is not opened', async () => {
    unregisterDriver();
    const newRun = startAutomatedAiRequest(options);
    run = newRun;
    await advance(61_000);
    const result = newRun.getResult();
    expect(result && result.status).toBe('error');
    expect(result && result.error).toBe('The Ask AI editor is not opened.');
  });

  it('runs a request until the AI is done with a project', async () => {
    const { state, driver } = makeFakeDriver();
    unregisterDriver = registerAskAiAutomationDriver(driver);
    const newRun = startAutomatedAiRequest({
      ...options,
      toolsVersion: 'v23-experiment',
    });
    run = newRun;
    expect(getAutomatedAiRequestRun()).toBe(newRun);
    expect(() => startAutomatedAiRequest(options)).toThrow('already running');

    await advance(500);
    expect(driver.startNewRequest).toHaveBeenCalledWith({
      userRequest: 'Make a racing game',
      aiConfigurationPresetId: 'default',
    });
    // The requests are made with the tools version while the run lasts.
    expect(getAiToolsVersionOverride()).toBe('v23-experiment');
    expect(newRun.getAiRequestId()).toBe(null);

    state.aiRequest = makeFakeAiRequest('request-1', 'working');
    state.hasWorkInProgress = true;
    await advance(60_000);
    expect(newRun.getAiRequestId()).toBe('request-1');
    expect(newRun.getResult()).toBe(null);

    // The AI stops without a project (a question): it is told to continue.
    state.aiRequest = makeFakeAiRequest('request-1', 'ready');
    state.hasWorkInProgress = false;
    await advance(12_000);
    expect(driver.sendUserMessage).toHaveBeenCalledTimes(1);
    expect(driver.sendUserMessage).toHaveBeenCalledWith('Continue.');
    expect(newRun.getUserContinuesCount()).toBe(1);

    // A short pause between two steps of the editor is not the end.
    state.hasWorkInProgress = true;
    await advance(30_000);
    state.hasWorkInProgress = false;
    state.hasProject = true;
    await advance(3000);
    state.isSavingProject = true;
    await advance(5000);
    expect(newRun.getResult()).toBe(null);

    state.isSavingProject = false;
    await advance(12_000);
    const result = newRun.getResult();
    expect(result).toEqual(
      expect.objectContaining({
        status: 'finished',
        aiRequestId: 'request-1',
        aiRequestStatus: 'ready',
        error: null,
        userContinuesCount: 1,
        hasProject: true,
        hasUnfinishedPlan: false,
      })
    );
    expect(await newRun.promise).toBe(result);
    expect(driver.sendUserMessage).toHaveBeenCalledTimes(1);
    expect(getAiToolsVersionOverride()).toBe(null);
  });

  it('starts from a new chat when the editor shows a request', async () => {
    const { state, driver } = makeFakeDriver();
    state.aiRequest = makeFakeAiRequest('older-request', 'ready');
    unregisterDriver = registerAskAiAutomationDriver(driver);
    run = startAutomatedAiRequest(options);
    await advance(1000);
    expect(driver.startNewChat).toHaveBeenCalledTimes(1);
    expect(driver.startNewRequest).toHaveBeenCalledTimes(1);
  });

  it('continues while tasks of the plan are left, at most the given times', async () => {
    const { state, driver } = makeFakeDriver();
    unregisterDriver = registerAskAiAutomationDriver(driver);
    const newRun = startAutomatedAiRequest(options);
    run = newRun;
    await advance(500);
    state.aiRequest = makeFakeAiRequest('request-1', 'ready');
    state.hasProject = true;
    state.hasUnfinishedPlan = true;

    await advance(60_000);
    const result = newRun.getResult();
    expect(driver.sendUserMessage).toHaveBeenCalledTimes(2);
    expect(result && result.status).toBe('waiting_for_user');
    expect(result && result.userContinuesCount).toBe(2);
    expect(result && result.hasUnfinishedPlan).toBe(true);
  });

  it('does not take a question of the AI on an opened project as its work done', async () => {
    const { state, driver } = makeFakeDriver();
    state.hasProject = true;
    unregisterDriver = registerAskAiAutomationDriver(driver);
    const newRun = startAutomatedAiRequest({ ...options, maxUserContinues: 1 });
    run = newRun;
    await advance(500);
    // The AI only answered, without calling any function.
    state.aiRequest = makeFakeAiRequest('request-1', 'ready', [
      userMessage,
      assistantTextMessage,
    ]);
    await advance(12_000);
    expect(driver.sendUserMessage).toHaveBeenCalledTimes(1);
    expect(newRun.getResult()).toBe(null);

    // Told to continue, it asks again: the run ends, not as finished.
    state.aiRequest = makeFakeAiRequest('request-1', 'ready', [
      userMessage,
      assistantTextMessage,
      userMessage,
      assistantTextMessage,
    ]);
    await advance(12_000);
    const result = newRun.getResult();
    expect(driver.sendUserMessage).toHaveBeenCalledTimes(1);
    expect(result && result.status).toBe('waiting_for_user');
    expect(result && result.userContinuesCount).toBe(1);
  });

  it('finishes once the AI worked after being told to continue', async () => {
    const { state, driver } = makeFakeDriver();
    state.hasProject = true;
    unregisterDriver = registerAskAiAutomationDriver(driver);
    const newRun = startAutomatedAiRequest({ ...options, maxUserContinues: 1 });
    run = newRun;
    await advance(500);
    state.aiRequest = makeFakeAiRequest('request-1', 'ready', [
      userMessage,
      assistantTextMessage,
    ]);
    await advance(12_000);
    state.aiRequest = makeFakeAiRequest('request-1', 'ready', [
      userMessage,
      assistantTextMessage,
      userMessage,
      assistantFunctionCallMessage,
      functionCallOutput,
      assistantTextMessage,
    ]);
    await advance(12_000);
    const result = newRun.getResult();
    expect(result && result.status).toBe('finished');
    expect(result && result.userContinuesCount).toBe(1);
  });

  it('ends with the error of the request', async () => {
    const { state, driver } = makeFakeDriver();
    unregisterDriver = registerAskAiAutomationDriver(driver);
    const newRun = startAutomatedAiRequest(options);
    run = newRun;
    await advance(500);
    state.aiRequest = makeFakeAiRequest('request-1', 'working');
    state.hasWorkInProgress = true;
    await advance(5000);
    state.aiRequest = makeFakeAiRequest('request-1', 'error');
    await advance(2000);

    const result = newRun.getResult();
    expect(result && result.status).toBe('error');
    expect(result && result.error).toBe('internal-error: Failed.');
    // Another request can then be started.
    expect(() => {
      run = startAutomatedAiRequest(options);
    }).not.toThrow();
  });

  it('ends when the request could not be sent', async () => {
    const { state, driver } = makeFakeDriver();
    unregisterDriver = registerAskAiAutomationDriver(driver);
    const newRun = startAutomatedAiRequest(options);
    run = newRun;
    await advance(500);
    state.lastSendError = new Error('Not enough credits.');
    await advance(1000);

    const result = newRun.getResult();
    expect(result && result.status).toBe('error');
    expect(result && result.error).toBe(
      'The AI request could not be started: Not enough credits.'
    );
  });

  it('gives up after the timeout', async () => {
    const { state, driver } = makeFakeDriver();
    unregisterDriver = registerAskAiAutomationDriver(driver);
    const newRun = startAutomatedAiRequest({ ...options, timeoutMs: 60_000 });
    run = newRun;
    await advance(500);
    state.aiRequest = makeFakeAiRequest('request-1', 'working');
    state.hasWorkInProgress = true;
    await advance(62_000);

    const result = newRun.getResult();
    expect(result && result.status).toBe('timeout');
    expect(result && result.aiRequestId).toBe('request-1');
    // The AI does not keep working on it.
    expect(driver.stop).toHaveBeenCalledTimes(1);
  });
});
