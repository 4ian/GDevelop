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
