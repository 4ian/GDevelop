// @flow
import * as React from 'react';
import { ChatBubble } from './ChatBubble';
import { Column, Line } from '../../UI/Grid';
import { ChatMarkdownText } from './ChatMarkdownText';
import { FunctionCallRow } from './FunctionCallRow';
import { FunctionCallsGroup } from './FunctionCallsGroup';
import { Trans } from '@lingui/macro';
import {
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestAssistantMessage,
  type AiRequestFunctionCallOutput,
} from '../../Utils/GDevelopServices/Generation';
import { type EditorCallbacks } from '../../EditorFunctions';
import Text from '../../UI/Text';
import { ColumnStackLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import classes from './SuggestionLines.module.css';
import { type FunctionCallItem } from './Utils';

type Props = {|
  aiRequest: AiRequest,
  onUserRequestTextChange: (
    userRequestText: string,
    aiRequestIdToChange: string
  ) => void,
  disabled?: boolean,
  message: AiRequestAssistantMessage | AiRequestFunctionCallOutput,
  messageIndex: number,
  onlyShowExplanationMessage?: boolean,
  functionCallItems?: Array<FunctionCallItem>,
  project: ?gdProject,
  onProcessFunctionCalls: (
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
    options: ?{|
      ignore?: boolean,
    |}
  ) => Promise<void>,
  editorCallbacks: EditorCallbacks,
|};

export const SuggestionLines = ({
  aiRequest,
  onUserRequestTextChange,
  disabled,
  message,
  messageIndex,
  onlyShowExplanationMessage,
  functionCallItems,
  project,
  onProcessFunctionCalls,
  editorCallbacks,
}: Props): React.Node => {
  const { isMobile } = useResponsiveWindowSize();
  const suggestions = message.suggestions;

  if (!suggestions) return null;

  return (
    <>
      {suggestions.explanationMessage && (
        <Line
          key={`${messageIndex}-suggestion-message`}
          justifyContent="flex-start"
        >
          <ChatBubble role="assistant">
            <Column noMargin>
              {functionCallItems && functionCallItems.length > 0 && (
                <FunctionCallsGroup>
                  {functionCallItems.map(
                    ({
                      key: functionCallKey,
                      messageContent: functionCallMessageContent,
                      existingFunctionCallOutput,
                      editorFunctionCallResult,
                    }) => (
                      <FunctionCallRow
                        project={project}
                        key={functionCallKey}
                        onProcessFunctionCalls={onProcessFunctionCalls}
                        functionCall={functionCallMessageContent}
                        editorFunctionCallResult={editorFunctionCallResult}
                        existingFunctionCallOutput={existingFunctionCallOutput}
                        editorCallbacks={editorCallbacks}
                      />
                    )
                  )}
                </FunctionCallsGroup>
              )}
              <ChatMarkdownText source={suggestions.explanationMessage} />
            </Column>
          </ChatBubble>
        </Line>
      )}
      {!onlyShowExplanationMessage && suggestions.suggestions.length > 0 && (
        <>
          <Line
            key={`${messageIndex}-suggestions-title`}
            justifyContent="flex-start"
            noMargin
          >
            <Text size="sub-title">
              <Trans>What should I do next?</Trans>
            </Text>
          </Line>
          <Line
            key={`${messageIndex}-suggestions`}
            justifyContent="flex-start"
            noMargin
          >
            {isMobile ? (
              <ColumnStackLayout noMargin expand>
                {suggestions.suggestions.map((suggestion, suggestionIndex) => (
                  <FlatButton
                    key={`suggestion-${suggestionIndex}`}
                    onClick={() => {
                      onUserRequestTextChange(
                        suggestion.suggestedMessage,
                        aiRequest.id
                      );
                    }}
                    label={suggestion.title}
                    disabled={disabled}
                    color="ai"
                    fullWidth
                  />
                ))}
              </ColumnStackLayout>
            ) : (
              <div className={classes.suggestionsWrap}>
                {suggestions.suggestions.map((suggestion, suggestionIndex) => (
                  <FlatButton
                    key={`suggestion-${suggestionIndex}`}
                    onClick={() => {
                      onUserRequestTextChange(
                        suggestion.suggestedMessage,
                        aiRequest.id
                      );
                    }}
                    label={suggestion.title}
                    disabled={disabled}
                    color="ai"
                  />
                ))}
              </div>
            )}
          </Line>
        </>
      )}
    </>
  );
};
