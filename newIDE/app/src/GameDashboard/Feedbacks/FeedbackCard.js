// @flow

import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import { Card } from '@material-ui/core';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CheckCircleIcon from '@material-ui/icons//CheckCircle';
import CardContent from '../../UI/Card/CardContent';
import Text from '../../UI/Text';

import {
  updateComment,
  type Comment,
  type GameRatings,
} from '../../Utils/GDevelopServices/Play';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Rating from './Rating';
import { Column, LargeSpacer, Line, Spacer } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';
import { useDebounce } from '../../Utils/UseDebounce';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

const styles = { textComment: { whiteSpace: 'pre-wrap' } };

type Props = {
  comment: Comment,
  authenticatedUser: AuthenticatedUser,
  onUpdateComment: () => ?Promise<void>,
};

const getRatings = (ratings: ?GameRatings) => {
  if (!ratings) return null;
  if (ratings.version === 1) {
    return [
      { label: 'Sound', value: ratings.sound },
      { label: 'Visuals', value: ratings.visuals },
      { label: 'Fun', value: ratings.fun },
      { label: 'Ease of use', value: ratings.easeOfUse },
    ];
  }
};

const FeedbackCard = ({
  comment,
  authenticatedUser,
  onUpdateComment,
}: Props) => {
  const { getAuthorizationHeader, profile } = authenticatedUser;
  const ratings = getRatings(comment.ratings);
  const theme = React.useContext(GDevelopThemeContext);

  const [processed, setProcessed] = React.useState<?boolean>(null);

  const isProcessed = processed === null ? !!comment.processedAt : processed;

  const setProcessedAt = useDebounce(
    async ({ processed }: { processed: boolean }) => {
      if (!profile) return;
      try {
        await updateComment(getAuthorizationHeader, profile.id, {
          gameId: comment.gameId,
          commentId: comment.id,
          processed: processed,
        });
      } catch (error) {
        console.warn(`Unable to update comment: ${error}`);
      } finally {
        await onUpdateComment();
        setProcessed(null);
      }
    },
    500
  );

  const onSetProcessed = () => {
    const newProcessedValue = !(processed === null
      ? !!comment.processedAt
      : processed);
    setProcessed(newProcessedValue);
    setProcessedAt({
      processed: newProcessedValue,
    });
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Card variant="outlined" style={{ opacity: isProcessed ? '0.5' : '1' }}>
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
                        <Line expand noMargin key={rating.label}>
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
              tooltip={isProcessed ? t`Unresolve` : t`Resolve`}
              onClick={onSetProcessed}
            >
              {isProcessed ? (
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
