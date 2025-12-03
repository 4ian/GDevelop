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

const styles = {
  paper: {
    flex: 1,
    display: 'flex',
  },
};

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
    <>
      <div className={classes.feedbackBannerContainer}>
        <Line noMargin justifyContent="center">
          <Paper background="dark" variant="outlined" style={styles.paper}>
            <Column expand alignItems="center" justifyContent="center">
              <div className={classes.textAndButtonsContainer}>
                <Text size="sub-title" color="inherit" noMargin>
                  <Trans>Did it work?</Trans>
                </Text>
                <Line alignItems="center" noMargin neverShrink>
                  <IconButton
                    tooltip={t`This was helpful`}
                    onClick={() => {
                      setCurrentFeedback('like');
                      onSendFeedback('like');
                    }}
                    color="inherit"
                    size="small"
                  >
                    <Like
                      htmlColor={
                        currentFeedback === 'like'
                          ? theme.message.valid
                          : undefined
                      }
                    />
                  </IconButton>
                  <IconButton
                    tooltip={t`There was a problem`}
                    onClick={() => {
                      setDislikeFeedbackDialogOpened(true);
                    }}
                    color="inherit"
                    size="small"
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
        </Line>
      </div>
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
    </>
  );
};
