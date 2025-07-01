// @flow
import * as React from 'react';
import classes from './ChatBubble.module.css';
import Paper from '../../UI/Paper';

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
  feedbackButtons?: React.Node,
  role: 'assistant' | 'user',
|};

export const ChatBubble = ({
  children,
  feedbackButtons,
  role,
}: ChatBubbleProps) => {
  return (
    <div className={classes.chatBubbleContainer}>
      <Paper
        background={role === 'user' ? 'light' : 'medium'}
        style={styles.chatBubble}
      >
        <div className={classes.chatBubbleContent}>{children}</div>
        {feedbackButtons}
      </Paper>
    </div>
  );
};
