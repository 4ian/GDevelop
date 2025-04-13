// @flow
import {
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
} from '../../../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../../../Commands/EditorFunctionCallRunner';

export const getFunctionCallsToProcess = ({
  aiRequest,
  appliedFunctionCallOutputs,
}: {|
  aiRequest: AiRequest,
  appliedFunctionCallOutputs: Array<EditorFunctionCallResult>,
|}): Array<AiRequestMessageAssistantFunctionCall> => {
  const allFunctionCalls: AiRequestMessageAssistantFunctionCall[] = [];
  const appliedFunctionCallIds = new Set<string>();
  const alreadyProcessedFunctionCallIds = new Set<string>();

  for (const message of aiRequest.output) {
    if (message.type === 'message' && message.role === 'assistant') {
      message.content.forEach(messageContent => {
        if (messageContent.type === 'function_call') {
          allFunctionCalls.push(messageContent);
        }
      });
    }
    if (message.type === 'function_call_output') {
      alreadyProcessedFunctionCallIds.add(message.call_id);
    }
  }

  appliedFunctionCallOutputs.forEach(functionCallOutput => {
    appliedFunctionCallIds.add(functionCallOutput.call_id);
  });

  const functionCallsToProcess = allFunctionCalls.filter(
    functionCall =>
      !alreadyProcessedFunctionCallIds.has(functionCall.call_id) &&
      !appliedFunctionCallIds.has(functionCall.call_id)
  );

  return functionCallsToProcess;
};
