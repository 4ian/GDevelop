// @flow
import {
  getAllFunctionCalls,
  getResolvedCallIds,
  getPendingClientCalls,
  getSpawnedSubAgentIds,
  getAssistantText,
  hasUnresolvedCalls,
} from './AiRequestUtils';

const makeRequest = (output): any => ({
  id: 'req-1',
  status: 'ready',
  mode: 'orchestrator',
  output,
});

describe('AiRequestUtils', () => {
  const request = makeRequest([
    {
      type: 'message',
      role: 'user',
      content: [{ type: 'user_request', text: 'do it' }],
    },
    {
      type: 'message',
      role: 'assistant',
      content: [
        { type: 'output_text', text: 'Working on it.' },
        {
          type: 'function_call',
          call_id: 'c1',
          name: 'create_object',
          arguments: '{"object_name":"Enemy"}',
        },
        {
          type: 'function_call',
          call_id: 'c2',
          name: 'run_edit_agent',
          arguments: '{}',
          subAgentAiRequestId: 'sub-1',
        },
        {
          type: 'function_call',
          call_id: 'c3',
          name: 'read_docs',
          arguments: '{}',
        },
      ],
    },
    { type: 'function_call_output', call_id: 'c1', output: '{"success":true}' },
  ]);

  test('getAllFunctionCalls returns every call', () => {
    expect(getAllFunctionCalls(request).map(c => c.name)).toEqual([
      'create_object',
      'run_edit_agent',
      'read_docs',
    ]);
  });

  test('getResolvedCallIds reflects function_call_output messages', () => {
    expect(Array.from(getResolvedCallIds(request))).toEqual(['c1']);
  });

  test('getPendingClientCalls excludes resolved AND server-side tools', () => {
    // c1 is resolved; c2 (run_edit_agent) and c3 (read_docs) are server-side.
    expect(getPendingClientCalls(request)).toEqual([]);
  });

  test('getPendingClientCalls returns unresolved client-side calls', () => {
    const req = makeRequest([
      {
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'function_call',
            call_id: 'x1',
            name: 'change_object_property',
            arguments: '{}',
          },
        ],
      },
    ]);
    expect(getPendingClientCalls(req).map(c => c.call_id)).toEqual(['x1']);
  });

  test('getSpawnedSubAgentIds finds sub-agent ids', () => {
    expect(getSpawnedSubAgentIds(request)).toEqual(['sub-1']);
  });

  test('getAssistantText concatenates output_text', () => {
    expect(getAssistantText(request)).toBe('Working on it.');
  });

  test('hasUnresolvedCalls is true when a server-side call awaits its output', () => {
    // c2/c3 have no outputs.
    expect(hasUnresolvedCalls(request)).toBe(true);
  });
});
