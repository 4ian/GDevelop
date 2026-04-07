// @flow
import {
  getFunctionCallsToProcess,
  getSubAgentFunctionCalls,
} from './AiRequestUtils';

const makeAiRequest = (output: Array<any>) => ({
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

describe('getSubAgentFunctionCalls', () => {
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

    const result = getSubAgentFunctionCalls({ aiRequest });

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

    const result = getSubAgentFunctionCalls({ aiRequest });

    expect(result).toHaveLength(0);
  });
});
