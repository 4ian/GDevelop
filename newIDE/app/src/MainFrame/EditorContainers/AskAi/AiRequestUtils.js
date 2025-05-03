// @flow
import {
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestFunctionCallOutput,
} from '../../../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../../../Commands/EditorFunctionCallRunner';

export const getFunctionCallToFunctionCallOutputMap = ({
  aiRequest,
}: {|
  aiRequest: AiRequest,
|}): Map<AiRequestMessageAssistantFunctionCall, AiRequestFunctionCallOutput | null> => {
  // Maps each function call to its corresponding output (or null if no output)
  const functionCallsToOutputs = new Map<
    AiRequestMessageAssistantFunctionCall,
    AiRequestFunctionCallOutput | null
  >();

  // Track function calls by their call_id to match with outputs
  const functionCallsByCallId = new Map<string, AiRequestMessageAssistantFunctionCall>();

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
  editorFunctionCallResults: Array<EditorFunctionCallResult>,
|}): Array<AiRequestMessageAssistantFunctionCall> => {
  const functionCallsToProcess: AiRequestMessageAssistantFunctionCall[] = [];
  const appliedFunctionCallIds = new Set<string>();
  const alreadyProcessedFunctionCallIds = new Set<string>();

  // Track already applied function calls
  editorFunctionCallResults.forEach(functionCallOutput => {
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
