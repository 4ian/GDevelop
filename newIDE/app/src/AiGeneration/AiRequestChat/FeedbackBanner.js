// @flow

import React from 'react';
import { Trans, t } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import Paper from '../../UI/Paper';
import IconButton from '../../UI/IconButton';
import Like from '../../UI/CustomSvgIcons/Like';
import Dislike from '../../UI/CustomSvgIcons/Dislike';
import Text from '../../UI/Text';
import classes from './FeedbackBanner.module.css';
import { DislikeFeedbackDialog } from './DislikeFeedbackDialog';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';

type Props = {
  onSendFeedback: (
    feedback: 'like' | 'dislike',
    reason?: string,
    freeFormDetails?: string
  ) => void,
};

export const FeedbackBanner = ({ onSendFeedback }: Props) => {
  const [currentFeedback, setCurrentFeedback] = React.useState<
    'like' | 'dislike' | null
  >(null);
  const theme = React.useContext(GDevelopThemeContext);
  const [
    dislikeFeedbackDialogOpened,
    setDislikeFeedbackDialogOpened,
  ] = React.useState<boolean>(false);

  return (
    <Line noMargin justifyContent="center">
      <Paper background="dark" variant="outlined">
        <Column expand>
          <div className={classes.textAndButtonsContainer}>
            <Text size="block-title" color="inherit">
              <Trans>How did it go?</Trans>
            </Text>
            <Line alignItems="center" noMargin neverShrink>
              <IconButton
                tooltip={t`This was helpful`}
                onClick={() => {
                  setCurrentFeedback('like');
                  onSendFeedback('like');
                }}
                color="inherit"
              >
                <Like
                  htmlColor={
                    currentFeedback === 'like' ? theme.message.valid : undefined
                  }
                />
              </IconButton>
              <IconButton
                tooltip={t`There was a problem`}
                onClick={() => {
                  setDislikeFeedbackDialogOpened(true);
                }}
                color="inherit"
              >
                <Dislike
                  htmlColor={
                    currentFeedback === 'dislike'
                      ? theme.message.warning
                      : undefined
                  }
                />
              </IconButton>
            </Line>
          </div>
        </Column>
      </Paper>
      {dislikeFeedbackDialogOpened && (
        <DislikeFeedbackDialog
          mode="agent"
          open={dislikeFeedbackDialogOpened}
          onClose={() => setDislikeFeedbackDialogOpened(false)}
          onSendFeedback={(reason: string, freeFormDetails: string) => {
            setDislikeFeedbackDialogOpened(false);
            onSendFeedback('dislike', reason, freeFormDetails);
            setCurrentFeedback('dislike');
          }}
        />
      )}
    </Line>
  );
};
