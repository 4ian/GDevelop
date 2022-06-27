// @flow

import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CheckCircleIcon from '@material-ui/icons//CheckCircle';

import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Column, LargeSpacer, Line, Spacer } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';

import Rating from './Rating';

import {
  updateComment,
  type Comment,
  type GameRatings,
} from '../../Utils/GDevelopServices/Play';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { useDebounce } from '../../Utils/UseDebounce';
import { useOptimisticState } from '../../Utils/UseOptimisticState';

const styles = { textComment: { whiteSpace: 'pre-wrap' } };

type Props = {|
  comment: Comment,
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
        message: i18n._(t`Unable to change resolved status of feedback.`),
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
        <Card variant="outlined" style={{ opacity: processed ? '0.5' : '1' }}>
          <Line noMargin alignItems="start">
            <Column expand>
              <CardContent>
                <Column noMargin>
                  <Line
                    noMargin
                    justifyContent="space-between"
                    alignItems="start"
                  >
                    <Column noMargin>
                      <Text size="body2">
                        <Trans>{i18n.date(comment.createdAt)}</Trans>
                      </Text>
                      <Text size="body2" noMargin>
                        {comment.playerName}
                      </Text>
                    </Column>
                  </Line>
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
              </CardContent>
            </Column>
            <IconButton
              tooltip={processed ? t`Unresolve` : t`Resolve`}
              onClick={() => setProcessed(!processed, i18n)}
            >
              {processed ? (
                <CheckCircleIcon htmlColor={theme.message.valid} />
              ) : (
                <CheckCircleOutlineIcon />
              )}
            </IconButton>
          </Line>
        </Card>
      )}
    </I18n>
  );
};

export default FeedbackCard;
