// @flow
import {
  type AiRequest,
  type AiRequestMessage,
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestFunctionCallOutput,
} from '../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../EditorFunctions/EditorFunctionCallRunner';
import { type RelatedAiRequestLastMessages } from '../EditorFunctions';

export const getFunctionCallToFunctionCallOutputMap = ({
  aiRequest,
}: {|
  aiRequest: AiRequest,
|}): Map<
  AiRequestMessageAssistantFunctionCall,
  AiRequestFunctionCallOutput | null
> => {
  // Maps each function call to its corresponding output (or null if no output)
  const functionCallsToOutputs = new Map<
    AiRequestMessageAssistantFunctionCall,
    AiRequestFunctionCallOutput | null
  >();

  // Track function calls by their call_id to match with outputs
  const functionCallsByCallId = new Map<
    string,
    AiRequestMessageAssistantFunctionCall
  >();

  // Process messages in a single loop
  for (let i = 0; i < aiRequest.output.length; i++) {
    const message = aiRequest.output[i];

    if (message.type === 'message' && message.role === 'assistant') {
      // Process function calls in this message
      message.content.forEach(content => {
        if (content.type === 'function_call') {
          // Initialize with null output - will be updated if we find a matching output
          functionCallsToOutputs.set(content, null);

          // Store function call by call_id for later matching
          functionCallsByCallId.set(content.call_id, content);
        }
      });
    } else if (message.type === 'function_call_output') {
      // Find the corresponding function calls with this call_id
      const functionCall = functionCallsByCallId.get(message.call_id);
      functionCallsByCallId.delete(message.call_id);

      // Match with the most recent function call with this call_id
      if (functionCall) {
        functionCallsToOutputs.set(functionCall, message);
      }
    }
  }

  return functionCallsToOutputs;
};

export const getFunctionCallsToProcess = ({
  aiRequest,
  editorFunctionCallResults,
}: {|
  aiRequest: AiRequest,
  editorFunctionCallResults: Array<EditorFunctionCallResult> | null,
|}): Array<AiRequestMessageAssistantFunctionCall> => {
  const functionCallsToProcess: AiRequestMessageAssistantFunctionCall[] = [];
  const appliedFunctionCallIds = new Set<string>();
  const alreadyProcessedFunctionCallIds = new Set<string>();

  // Track already applied function calls
  (editorFunctionCallResults || []).forEach(functionCallOutput => {
    appliedFunctionCallIds.add(functionCallOutput.call_id);
  });

  // Process from the end and collect function calls until we hit a message with no function calls
  let foundFunctionCall = false;

  for (let i = aiRequest.output.length - 1; i >= 0; i--) {
    const message = aiRequest.output[i];

    // Track already processed function call outputs
    if (message.type === 'function_call_output') {
      alreadyProcessedFunctionCallIds.add(message.call_id);
    }

    // Collect function calls that need processing
    if (message.type === 'message' && message.role === 'assistant') {
      const functionCalls = message.content.filter(
        content => content.type === 'function_call'
      );

      if (functionCalls.length > 0) {
        foundFunctionCall = true;

        // Add new unique function calls that haven't been processed or applied
        for (let j = functionCalls.length - 1; j >= 0; j--) {
          const functionCall = functionCalls[j];
          if (functionCall.type !== 'function_call') continue;

          if (
            !alreadyProcessedFunctionCallIds.has(functionCall.call_id) &&
            !appliedFunctionCallIds.has(functionCall.call_id)
          ) {
            functionCallsToProcess.unshift(functionCall); // Add to beginning to preserve original order
          }
        }
      } else if (foundFunctionCall) {
        // If we've found function calls and now hit a message with no function calls, stop
        break;
      }
    }
  }

  return functionCallsToProcess;
};

export const getFunctionCallNameByCallId = ({
  aiRequest,
  callId,
}: {|
  aiRequest: AiRequest,
  callId: string,
|}): string | null => {
  for (let i = 0; i < aiRequest.output.length; i++) {
    const message = aiRequest.output[i];
    if (message.type === 'message' && message.role === 'assistant') {
      for (const content of message.content) {
        if (content.type === 'function_call' && content.call_id === callId) {
          return content.name;
        }
      }
    }
  }
  return null;
};

/**
 * Extract the latest plan from the AI request if it exists and should be displayed.
 * Returns null if no plan should be displayed (no plan exists, or all tasks are done/voided).
 */
export const getLatestActivePlan = (
  aiRequest: AiRequest
): {| tasks: Array<any> |} | null => {
  let latestPlan = null;
  for (let i = aiRequest.output.length - 1; i >= 0; i--) {
    const message = aiRequest.output[i];
    if (message.type === 'function_call_output' && message.output) {
      try {
        const output = JSON.parse(message.output);
        if (output && output.plan && output.plan.tasks) {
          latestPlan = output.plan;
          break;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  if (!latestPlan) return null;

  const hasActiveTasks = latestPlan.tasks.some(
    task => task.status !== 'done' && task.status !== 'voided'
  );

  if (!hasActiveTasks) return null;

  return latestPlan;
};

/**
 * Returns true if the AI request has work in progress that should be suspended:
 * - The server is actively processing (status === 'working')
 * - OR the request is ready with function calls that still need to be processed and sent back
 */
export const aiRequestHasWorkInProgress = (
  aiRequest: AiRequest,
  editorFunctionCallResults: Array<EditorFunctionCallResult> | null
): boolean => {
  if (aiRequest.status === 'working') return true;
  // A function call is either either being processed or has been processed by the editor but not yet sent back
  // (e.g. generateEvents that finished execution but the output hasn't been sent back to the AI with the follow-up request).
  // This means there's still work in progress from the AI perspective, even if the editor is not actively working on a function call.
  if (
    editorFunctionCallResults &&
    editorFunctionCallResults.some(
      r => r.status === 'finished' || r.status === 'working'
    )
  )
    return true;
  if (aiRequest.status === 'ready') {
    return (
      getFunctionCallsToProcess({
        aiRequest,
        editorFunctionCallResults,
      }).length > 0
    );
  }
  return false;
};

export const getFunctionCallOutputsFromEditorFunctionCallResults = (
  editorFunctionCallResults: Array<EditorFunctionCallResult> | null
): {|
  hasUnfinishedResult: boolean,
  functionCallOutputs: Array<AiRequestFunctionCallOutput>,
|} => {
  if (!editorFunctionCallResults)
    return { hasUnfinishedResult: false, functionCallOutputs: [] };

  let hasUnfinishedResult = false;
  const functionCallOutputs = editorFunctionCallResults
    .map(functionCallOutput => {
      if (functionCallOutput.status === 'finished') {
        return {
          type: 'function_call_output',
          call_id: functionCallOutput.call_id,
          output: JSON.stringify({
            success: functionCallOutput.success,
            ...functionCallOutput.output,
          }),
        };
      }

      hasUnfinishedResult = true;
      return null;
    })
    .filter(Boolean);

  return {
    // $FlowFixMe[incompatible-type]
    functionCallOutputs,
    hasUnfinishedResult,
  };
};

/**
 * Extract the last user message and last assistant messages from an AI request's
 * output, to provide context for enhanced LLM reranking (e.g., asset search).
 *
 * Collects up to 5 assistant `output_text` messages from the end of the conversation,
 * stopping when the last user message is reached.
 */
export const getLastMessagesFromAiRequestOutput = (
  output: Array<AiRequestMessage>
): RelatedAiRequestLastMessages => {
  let lastUserMessage: string | null = null;
  const lastAssistantMessages: string[] = [];

  for (let i = output.length - 1; i >= 0; i--) {
    const message = output[i];
    if (message.type === 'message' && message.role === 'user') {
      const textContent = message.content.find(c => c.type === 'user_request');
      if (textContent) {
        lastUserMessage = textContent.text;
      }
      break;
    }
    if (message.type === 'message' && message.role === 'assistant') {
      for (const content of message.content) {
        if (
          content.type === 'output_text' &&
          lastAssistantMessages.length < 5
        ) {
          lastAssistantMessages.push(content.text);
        }
      }
    }
  }

  return {
    lastUserMessage,
    lastAssistantMessages,
  };
};
