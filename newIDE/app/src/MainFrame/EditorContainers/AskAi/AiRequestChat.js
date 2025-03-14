// @flow
import * as React from 'react';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';
import { Trans } from '@lingui/macro';
import { type AiRequest } from '../../../Utils/GDevelopServices/Generation';
import RaisedButton from '../../../UI/RaisedButton';
import { CompactTextAreaField } from '../../../UI/CompactTextAreaField';
import { Column, Line } from '../../../UI/Grid';
import LeftLoader from '../../../UI/LeftLoader';
import Paper from '../../../UI/Paper';
import { ChatMarkdownText } from './ChatMarkdownText';
import ScrollView, { type ScrollViewInterface } from '../../../UI/ScrollView';
import AlertMessage from '../../../UI/AlertMessage';
import classes from './AiRequestChat.module.css';

type Props = {
  aiRequest: AiRequest | null,
  isLaunchingAiRequest: boolean,
  onSendUserRequest: string => Promise<void>,
};

export type AiRequestChatInterface = {|
  resetUserInput: () => void,
|};

const styles = {
  chatBubble: {
    paddingTop: 5,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 5,
  },
};

type ChatBubbleProps = {|
  children: React.Node,
  role: 'assistant' | 'user',
|};

const ChatBubble = ({ children, role }: ChatBubbleProps) => {
  return (
    <div className={classes.chatBubbleContainer}>
      <Paper
        background={role === 'user' ? 'light' : 'medium'}
        style={styles.chatBubble}
      >
        <div className={classes.chatBubbleContent}>{children}</div>
      </Paper>
    </div>
  );
};

export const AiRequestChat = React.forwardRef<Props, AiRequestChatInterface>(
  ({ aiRequest, isLaunchingAiRequest, onSendUserRequest }: Props, ref) => {
    const [userRequestText, setUserRequestText] = React.useState('');
    const scrollViewRef = React.useRef<ScrollViewInterface | null>(null);

    React.useImperativeHandle(ref, () => ({
      resetUserInput: () => {
        setUserRequestText('');
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToBottom({
            behavior: 'smooth',
          });
        }
      },
    }));

    if (!aiRequest) {
      return (
        <ColumnStackLayout expand alignItems="stretch" justifyContent="center">
          <Column noMargin alignItems="center">
            <Text size="bold-title">
              <Trans>What do you want to make?</Trans>
            </Text>
          </Column>
          <Column noMargin alignItems="stretch" justifyContent="stretch">
            <CompactTextAreaField
              value={userRequestText}
              disabled={isLaunchingAiRequest}
              onChange={userRequestText => setUserRequestText(userRequestText)}
              placeholder="How to add a leaderboard to my game?"
              rows={5}
            />
            <Text size="body2" color="secondary">
              <Trans>
                The AI will answer according to your game project. Be precise in
                your question and always verify AI answers before applying them.
              </Trans>
            </Text>
          </Column>
          <Column noMargin alignItems="flex-end">
            <LeftLoader isLoading={isLaunchingAiRequest}>
              <RaisedButton
                color="primary"
                label={<Trans>Send</Trans>}
                onClick={() => {
                  onSendUserRequest(userRequestText);
                }}
              />
            </LeftLoader>
          </Column>
        </ColumnStackLayout>
      );
    }

    return (
      <ColumnStackLayout
        expand
        alignItems="stretch"
        justifyContent="stretch"
        useFullHeight
      >
        <ScrollView ref={scrollViewRef}>
          {aiRequest.output.flatMap((message, messageIndex) => {
            if (message.role === 'user') {
              return [
                <Line key={messageIndex} justifyContent="flex-end">
                  <ChatBubble role="user">
                    <ChatMarkdownText
                      source={message.content
                        .map(messageContent => messageContent.text)
                        .join('\n')}
                    />
                  </ChatBubble>
                </Line>,
              ];
            }
            if (message.role === 'assistant') {
              return [
                ...message.content
                  .map((messageContent, messageContentIndex) => {
                    const key = `messageIndex${messageIndex}-${messageContentIndex}`;
                    if (messageContent.type === 'output_text') {
                      return (
                        <Line key={key} justifyContent="flex-start">
                          <ChatBubble role="assistant">
                            <ChatMarkdownText source={messageContent.text} />
                          </ChatBubble>
                        </Line>
                      );
                    }
                    if (messageContent.type === 'reasoning') {
                      return (
                        <Line key={key} justifyContent="flex-start">
                          <ChatBubble role="assistant">
                            <ChatMarkdownText
                              source={messageContent.summary.text}
                            />
                          </ChatBubble>
                        </Line>
                      );
                    }
                    return null;
                  })
                  .filter(Boolean),
              ];
            }

            return [];
          })}

          {aiRequest.status === 'error' ? (
            <Line justifyContent="flex-start">
              <AlertMessage kind="error">
                <Trans>
                  The AI encountered an error while handling your request. Try
                  again later.
                </Trans>
              </AlertMessage>
            </Line>
          ) : aiRequest.status === 'working' ? (
            <Line justifyContent="flex-start">
              <div className={classes.thinkingText}>
                <LeftLoader isLoading>
                  <Text noMargin displayInlineAsSpan>
                    <Trans>Thinking about your request...</Trans>
                  </Text>
                </LeftLoader>
              </div>
            </Line>
          ) : null}
        </ScrollView>
        <CompactTextAreaField
          value={userRequestText}
          disabled={isLaunchingAiRequest}
          onChange={userRequestText => setUserRequestText(userRequestText)}
          placeholder="Ask a follow up question"
          rows={2}
        />
        <Column noMargin alignItems="flex-end">
          <LeftLoader isLoading={isLaunchingAiRequest}>
            <RaisedButton
              color="primary"
              disabled={aiRequest.status === 'working'}
              label={<Trans>Send</Trans>}
              onClick={() => {
                onSendUserRequest(userRequestText);
              }}
            />
          </LeftLoader>
        </Column>
      </ColumnStackLayout>
    );
  }
);
