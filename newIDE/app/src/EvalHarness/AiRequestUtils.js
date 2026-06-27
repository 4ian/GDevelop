// @flow

/**
 * Pure helpers for reading an AiRequest's `output[]`. No network, no `gd` - so
 * these are unit-testable in isolation (see AiRequestUtils.spec.js).
 */

import { type AiRequest, type AiRequestMessage } from './EvalTypes';

/**
 * Tools that are handled entirely server-side: the client must never execute
 * them nor send a `function_call_output` for them. The backend fills their
 * outputs itself (immediately for docs/plan/search, or on completion for the
 * sub-agent spawns `run_explorer_agent` / `run_edit_agent`).
 */
export const SERVER_SIDE_TOOL_NAMES: Set<string> = new Set([
  'run_explorer_agent',
  'run_edit_agent',
  'read_docs',
  'read_full_docs',
  'search_docs',
  'create_or_update_plan',
  'read_game_project_json',
  'search_object_asset_store',
  'get_game_starter_summary',
  'report_fulfilment_problem',
]);

export type FunctionCall = {|
  call_id: string,
  name: string,
  arguments: string,
  subAgentAiRequestId?: ?string,
|};

/** Every assistant function_call in the output, in order. */
export const getAllFunctionCalls = (
  aiRequest: AiRequest
): Array<FunctionCall> => {
  const calls = [];
  (aiRequest.output || []).forEach((message: AiRequestMessage) => {
    if (message.type === 'message' && message.role === 'assistant') {
      (message.content || []).forEach(content => {
        if (content.type === 'function_call') {
          calls.push({
            call_id: content.call_id,
            name: content.name,
            arguments: content.arguments,
            subAgentAiRequestId: content.subAgentAiRequestId,
          });
        }
      });
    }
  });
  return calls;
};

/** The set of call_ids that already have a function_call_output in the output. */
export const getResolvedCallIds = (aiRequest: AiRequest): Set<string> => {
  const resolved = new Set();
  (aiRequest.output || []).forEach((message: AiRequestMessage) => {
    if (message.type === 'function_call_output') {
      resolved.add(message.call_id);
    }
  });
  return resolved;
};

/** Any function call (client or server side) still awaiting an output. */
export const hasUnresolvedCalls = (aiRequest: AiRequest): boolean => {
  const resolved = getResolvedCallIds(aiRequest);
  return getAllFunctionCalls(aiRequest).some(
    call => !resolved.has(call.call_id)
  );
};

/**
 * The client-side tool calls this request is currently waiting on: unresolved
 * and not server-side-owned. These are the ones the harness must execute.
 */
export const getPendingClientCalls = (
  aiRequest: AiRequest
): Array<FunctionCall> => {
  const resolved = getResolvedCallIds(aiRequest);
  return getAllFunctionCalls(aiRequest).filter(
    call =>
      !resolved.has(call.call_id) && !SERVER_SIDE_TOOL_NAMES.has(call.name)
  );
};

/** call_ids that spawned a sub-agent, with the sub-agent's request id. */
export const getSpawnedSubAgentIds = (
  aiRequest: AiRequest
): Array<string> => {
  const ids = [];
  getAllFunctionCalls(aiRequest).forEach(call => {
    if (call.subAgentAiRequestId) ids.push(call.subAgentAiRequestId);
  });
  return ids;
};

/** Concatenated assistant text output of a request. */
export const getAssistantText = (aiRequest: AiRequest): string =>
  (aiRequest.output || [])
    .flatMap((message: AiRequestMessage) => {
      if (message.type === 'message' && message.role === 'assistant') {
        return (message.content || [])
          .map(content =>
            content.type === 'output_text' ? content.text : null
          )
          .filter(Boolean);
      }
      return [];
    })
    .join('\n\n');
