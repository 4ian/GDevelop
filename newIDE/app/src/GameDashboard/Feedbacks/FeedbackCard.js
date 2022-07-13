// @flow

import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CheckCircleIcon from '@material-ui/icons//CheckCircle';

import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Column, LargeSpacer, Line, Spacer } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';
import Card from '../../UI/Card';
import BackgroundText from '../../UI/BackgroundText';
import { showErrorBox } from '../../UI/Messages/MessageBox';

import Rating from './Rating';

import {
  shortenUuidForDisplay,
  updateComment,
  type Comment,
  type GameRatings,
} from '../../Utils/GDevelopServices/Play';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { useOptimisticState } from '../../Utils/UseOptimisticState';

const styles = {
  textComment: { whiteSpace: 'pre-wrap' },
  backgroundText: { padding: 0, textAlign: 'left' },
};

type BuildProperties = {
  id: string,
  name?: string,
  isDeleted?: boolean,
};
type Props = {|
  comment: Comment,
  buildProperties?: BuildProperties,
  authenticatedUser: AuthenticatedUser,
  onCommentUpdated: (comment: Comment) => void,
|};

const getRatings = (ratings: ?GameRatings) => {
  if (!ratings) return null;
  if (ratings.version === 1) {
    return [
      {
        key: 'rating-sound',
        label: <Trans>Sound</Trans>,
        value: ratings.sound,
      },
      {
        key: 'rating-visuals',
        label: <Trans>Visuals</Trans>,
        value: ratings.visuals,
      },
      { key: 'rating-fun', label: <Trans>Fun</Trans>, value: ratings.fun },
      {
        key: 'rating-ease-of-use',
        label: <Trans>Ease of use</Trans>,
        value: ratings.easeOfUse,
      },
    ];
  }
};

const FeedbackCard = ({
  comment,
  buildProperties,
  authenticatedUser,
  onCommentUpdated,
}: Props) => {
  const { getAuthorizationHeader, profile } = authenticatedUser;
  const ratings = getRatings(comment.ratings);
  const theme = React.useContext(GDevelopThemeContext);

  const processComment = async (newProcessed: boolean, i18n: I18nType) => {
    if (!profile) return;
    try {
      const updatedComment: Comment = await updateComment(
        getAuthorizationHeader,
        profile.id,
        {
          gameId: comment.gameId,
          commentId: comment.id,
          processed: newProcessed,
        }
      );
      onCommentUpdated(updatedComment);
    } catch (error) {
      console.error(`Unable to update comment: `, error);
      showErrorBox({
        message:
          i18n._(t`Unable to change resolved status of feedback.`) +
          ' ' +
          i18n._(t`Verify your internet connection or try again later.`),
        rawError: error,
        errorId: 'feedback-card-set-processed-error',
      });
      throw new Error();
    }
  };

  const [processed, setProcessed] = useOptimisticState(
    !!comment.processedAt,
    processComment
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Card
          disabled={processed}
          cardCornerAction={
            <IconButton
              size="small"
              tooltip={processed ? t`Unresolve` : t`Resolve`}
              onClick={() => setProcessed(!processed, i18n)}
            >
              {processed ? (
                <CheckCircleIcon htmlColor={theme.message.valid} />
              ) : (
                <CheckCircleOutlineIcon />
              )}
            </IconButton>
          }
          header={
            <BackgroundText style={styles.backgroundText}>
              <Trans>{i18n.date(comment.createdAt)}</Trans>
            </BackgroundText>
          }
        >
          <Column noMargin>
            <Line noMargin justifyContent="space-between" alignItems="start">
              <Column noMargin>
                {buildProperties && (
                  <Text color="primary">
                    {buildProperties.name ||
                      shortenUuidForDisplay(buildProperties.id)}
                    {buildProperties.isDeleted && (
                      <>
                        {' '}
                        <Trans>(deleted)</Trans>
                      </>
                    )}
                  </Text>
                )}
                <BackgroundText style={styles.backgroundText}>
                  {comment.playerName}
                </BackgroundText>
              </Column>
            </Line>
            <Spacer />
            {ratings && (
              <ResponsiveLineStackLayout noColumnMargin expand>
                {ratings.map(rating => (
                  <Line expand noMargin key={rating.key}>
                    <Rating label={rating.label} value={rating.value} />
                    <Spacer />
                  </Line>
                ))}
              </ResponsiveLineStackLayout>
            )}
            <LargeSpacer />
            <Text style={styles.textComment}>{comment.text}</Text>
          </Column>
        </Card>
      )}
    </I18n>
  );
};

export default FeedbackCard;
