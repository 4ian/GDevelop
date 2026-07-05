// @flow
import {
  getAllSubAgentFunctionCalls,
  getFunctionCallsToProcess,
  getPendingSubAgentFunctionCalls,
  aiRequestPollSawActivity,
} from './AiRequestUtils';
import { type AiRequest } from '../Utils/GDevelopServices/Generation';

const makeAiRequest = (output: Array<any>): AiRequest => ({
  id: 'request-1',
  createdAt: '',
  updatedAt: '',
  userId: 'user-1',
  status: 'working',
  error: null,
  output,
});

const makeAssistantMessage = (functionCalls: Array<any>) => ({
  type: 'message',
  status: 'completed',
  role: 'assistant',
  content: functionCalls,
});

const makeFunctionCall = (callId: string, name: string) => ({
  type: 'function_call',
  status: 'completed',
  call_id: callId,
  name,
  arguments: '{}',
});

const makeSubAgentFunctionCall = (
  callId: string,
  name: string,
  subAgentAiRequestId: string
) => ({
  type: 'function_call',
  status: 'completed',
  call_id: callId,
  name,
  arguments: '{}',
  subAgentAiRequestId,
});

const makeFunctionCallOutput = (callId: string) => ({
  type: 'function_call_output',
  call_id: callId,
  output: '{"success":true}',
});

describe('getFunctionCallsToProcess', () => {
  it('skips sub-agent function calls', () => {
    const aiRequest = makeAiRequest([
      makeAssistantMessage([
        makeFunctionCall('call-1', 'create_object'),
        makeSubAgentFunctionCall(
          'call-2',
          'run_project_edit_agent',
          'sub-agent-1'
        ),
        makeFunctionCall('call-3', 'add_scene_events'),
      ]),
    ]);

    const result = getFunctionCallsToProcess({
      aiRequest,
      editorFunctionCallResults: null,
    });

    expect(result.map(fc => fc.call_id)).toEqual(['call-1', 'call-3']);
  });
});

describe('getPendingSubAgentFunctionCalls', () => {
  it('returns pending sub-agent function calls', () => {
    const aiRequest = makeAiRequest([
      makeAssistantMessage([
        makeFunctionCall('call-1', 'create_object'),
        makeSubAgentFunctionCall(
          'call-2',
          'run_project_edit_agent',
          'sub-agent-1'
        ),
      ]),
      makeFunctionCallOutput('call-1'),
    ]);

    const result = getPendingSubAgentFunctionCalls({ aiRequest });

    expect(result).toHaveLength(1);
    expect(result[0].call_id).toBe('call-2');
    expect(result[0].subAgentAiRequestId).toBe('sub-agent-1');
  });

  it('excludes completed sub-agent function calls', () => {
    const aiRequest = makeAiRequest([
      makeAssistantMessage([
        makeSubAgentFunctionCall(
          'call-1',
          'run_project_edit_agent',
          'sub-agent-1'
        ),
      ]),
      makeFunctionCallOutput('call-1'),
    ]);

    const result = getPendingSubAgentFunctionCalls({ aiRequest });

    expect(result).toHaveLength(0);
  });
});

describe('getAllSubAgentFunctionCalls', () => {
  it('returns both pending and completed sub-agent function calls', () => {
    const aiRequest = makeAiRequest([
      makeAssistantMessage([
        makeSubAgentFunctionCall(
          'call-1',
          'run_project_edit_agent',
          'sub-agent-1'
        ),
        makeSubAgentFunctionCall(
          'call-2',
          'run_project_edit_agent',
          'sub-agent-2'
        ),
      ]),
      makeFunctionCallOutput('call-1'),
    ]);

    const result = getAllSubAgentFunctionCalls({ aiRequest });

    expect(result.map(fc => fc.call_id)).toEqual(['call-1', 'call-2']);
    expect(result.map(fc => fc.subAgentAiRequestId)).toEqual([
      'sub-agent-1',
      'sub-agent-2',
    ]);
  });

  it('excludes non-sub-agent function calls', () => {
    const aiRequest = makeAiRequest([
      makeAssistantMessage([
        makeFunctionCall('call-1', 'create_object'),
        makeSubAgentFunctionCall(
          'call-2',
          'run_project_edit_agent',
          'sub-agent-1'
        ),
        makeFunctionCall('call-3', 'add_scene_events'),
      ]),
    ]);

    const result = getAllSubAgentFunctionCalls({ aiRequest });

    expect(result).toHaveLength(1);
    expect(result[0].call_id).toBe('call-2');
  });

  it('returns an empty array when there are no sub-agent function calls', () => {
    const aiRequest = makeAiRequest([
      makeAssistantMessage([makeFunctionCall('call-1', 'create_object')]),
    ]);

    const result = getAllSubAgentFunctionCalls({ aiRequest });

    expect(result).toEqual([]);
  });
});

describe('aiRequestPollSawActivity', () => {
  const makeRequestWithStatus = (
    status: 'working' | 'ready' | 'error' | 'suspended',
    output: Array<any>
  ): AiRequest => ({ ...makeAiRequest(output), status });

  it('is true when the status changed', () => {
    const previous = makeRequestWithStatus('working', [{ messageId: 'm1' }]);
    const fetched = makeRequestWithStatus('ready', [{ messageId: 'm1' }]);
    expect(aiRequestPollSawActivity(previous, fetched)).toBe(true);
  });

  it('is false when the status is unchanged and the incremental fetch only echoes the last known message', () => {
    const previous = makeRequestWithStatus('working', [{ messageId: 'm1' }]);
    // Incremental fetch returns just the echoed last known message.
    const fetched = makeRequestWithStatus('working', [{ messageId: 'm1' }]);
    expect(aiRequestPollSawActivity(previous, fetched)).toBe(false);
  });

  it('is true when the incremental fetch returns new messages beyond the echo', () => {
    const previous = makeRequestWithStatus('working', [{ messageId: 'm1' }]);
    const fetched = makeRequestWithStatus('working', [
      { messageId: 'm1' },
      { messageId: 'm2' },
    ]);
    expect(aiRequestPollSawActivity(previous, fetched)).toBe(true);
  });

  it('is true on the first fetch, when there is no previously known request', () => {
    const fetched = makeRequestWithStatus('working', [{ messageId: 'm1' }]);
    expect(aiRequestPollSawActivity(null, fetched)).toBe(true);
  });

  it('is false when status is unchanged and there are no messages', () => {
    const previous = makeRequestWithStatus('working', []);
    const fetched = makeRequestWithStatus('working', []);
    expect(aiRequestPollSawActivity(previous, fetched)).toBe(false);
  });
});
