// @flow
import {
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestAssistantMessage,
  type AiRequestFunctionCallOutput,
  type AiRequestMessage,
  type AiRequestUserMessage,
  type AiRequestPlanTask,
} from '../../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../../EditorFunctions';
import {
  type Quota,
  type UsagePrice,
} from '../../Utils/GDevelopServices/Usage';

export type FunctionCallItem = {|
  key: string,
  messageContent: AiRequestMessageAssistantFunctionCall,
  existingFunctionCallOutput: AiRequestFunctionCallOutput | null | void,
  editorFunctionCallResult: EditorFunctionCallResult | null,
|};

export type UserMessageRenderItem = {|
  type: 'user_message',
  messageIndex: number,
  message: AiRequestUserMessage,
|};

export type MessageContentRenderItem = {|
  type: 'message_content',
  messageIndex: number,
  messageContentIndex: number,
  message: AiRequestAssistantMessage,
  messageContent: {|
    type: 'output_text' | 'reasoning',
    status: 'completed',
    text?: string,
    summary?: {
      text: string,
      type: 'summary_text',
    },
    annotations?: Array<{}>,
  |},
  isLastMessage: boolean,
  functionCallItems?: Array<FunctionCallItem>,
|};

export type FunctionCallGroupRenderItem = {|
  type: 'function_call_group',
  items: Array<FunctionCallItem>,
|};

export type SaveRenderItem = {|
  type: 'save',
  messageIndex: number,
  message: AiRequestMessage,
  isRestored: boolean,
  isSaving: boolean,
|};

export type SuggestionsRenderItem = {|
  type: 'suggestions',
  messageIndex: number,
  message: AiRequestAssistantMessage | AiRequestFunctionCallOutput,
  onlyShowExplanationMessage: boolean,
  functionCallItems?: Array<FunctionCallItem>,
|};

export type OrchestratorPlanRenderItem = {|
  type: 'orchestrator_plan',
  plan: {| tasks: Array<AiRequestPlanTask> |},
  messageIndex: number,
  messageId: string,
|};

export type RenderItem =
  | UserMessageRenderItem
  | MessageContentRenderItem
  | FunctionCallGroupRenderItem
  | SaveRenderItem
  | SuggestionsRenderItem
  | OrchestratorPlanRenderItem;

/**
 * Whether the user can pay for one more AI request right now: either their AI
 * usage allowance is not exhausted, or they chose to pay with GDevelop credits
 * and have enough of them.
 *
 * Everything this reads comes from the user limits, so the answer follows the
 * user buying credits, subscribing or their allowance resetting. Anything gating
 * the chat on it must be derived from it (never latched), or the chat stays
 * blocked after the user unblocked themselves.
 */
export const canPayForAiRequest = ({
  quota,
  price,
  availableCredits,
  automaticallyUseCreditsForAiRequests,
}: {|
  quota: Quota | null,
  price: UsagePrice | null,
  availableCredits: number,
  automaticallyUseCreditsForAiRequests: boolean,
|}): boolean => {
  // The request is covered by the allowance included in the user's plan.
  if (!quota || !quota.limitReached) return true;
  // The allowance is exhausted and the user didn't accept to pay with credits.
  if (!automaticallyUseCreditsForAiRequests) return false;
  // The price is not known yet: let the user try rather than blocking them on a
  // missing price (the backend refuses the request if they can't pay for it).
  if (!price) return true;
  return availableCredits >= price.priceInCredits;
};
