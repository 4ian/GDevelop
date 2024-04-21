// @flow

import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import { LineStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Column, LargeSpacer, Line, Spacer } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
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
import Link from '../../UI/Link';
import PublicProfileDialog from '../../Profile/PublicProfileDialog';
import CheckCircleFilled from '../../UI/CustomSvgIcons/CheckCircleFilled';
import CheckCircle from '../../UI/CustomSvgIcons/CheckCircle';
import Dislike from '../../UI/CustomSvgIcons/Dislike';
import Like from '../../UI/CustomSvgIcons/Like';
import Danger from '../../UI/CustomSvgIcons/Danger';
import Heart from '../../UI/CustomSvgIcons/Heart';

const styles = {
  textComment: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' },
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

export const getRatings = (ratings: ?GameRatings) => {
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

  const [
    openPlayerPublicProfileDialog,
    setOpenPlayerPublicProfileDialog,
  ] = React.useState<boolean>(false);

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
          i18n._(t`Unable to change read status of feedback.`) +
          ' ' +
          i18n._(t`Verify your internet connection or try again later.`),
        rawError: error,
        errorId: 'feedback-card-set-processed-error',
      });
    }
  };

  const [processed, setProcessed] = useOptimisticState(
    !!comment.processedAt,
    processComment
  );

  const [ownerQualityRating, setOwnerQualityRating] = useOptimisticState(
    (comment.qualityRatingPerRole && comment.qualityRatingPerRole.owner) ||
      null,
    async (qualityRating, i18n) => {
      if (!profile) return;
      try {
        const updatedComment: Comment = await updateComment(
          getAuthorizationHeader,
          profile.id,
          {
            gameId: comment.gameId,
            commentId: comment.id,
            qualityRating,
          }
        );
        onCommentUpdated(updatedComment);
      } catch (error) {
        console.error(`Unable to update comment: `, error);
        showErrorBox({
          message:
            i18n._(t`Unable to change quality rating of feedback.`) +
            ' ' +
            i18n._(t`Verify your internet connection or try again later.`),
          rawError: error,
          errorId: 'feedback-card-set-quality-rating-error',
        });
      }
    }
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Card
            disabled={processed}
            cardCornerAction={
              <LineStackLayout noMargin>
                <IconButton
                  size="small"
                  tooltip={t`Rank this comment as great`}
                  onClick={() => setOwnerQualityRating('great', i18n)}
                >
                  <Heart
                    htmlColor={
                      ownerQualityRating === 'great'
                        ? theme.message.valid
                        : undefined
                    }
                  />
                </IconButton>
                <IconButton
                  size="small"
                  tooltip={t`Rank this comment as good`}
                  onClick={() => setOwnerQualityRating('good', i18n)}
                >
                  <Like
                    htmlColor={
                      ownerQualityRating === 'good'
                        ? theme.message.valid
                        : undefined
                    }
                  />
                </IconButton>
                <IconButton
                  size="small"
                  tooltip={t`Rank this comment as bad`}
                  onClick={() => setOwnerQualityRating('bad', i18n)}
                >
                  <Dislike
                    htmlColor={
                      ownerQualityRating === 'bad'
                        ? theme.message.warning
                        : undefined
                    }
                  />
                </IconButton>
                <IconButton
                  size="small"
                  tooltip={t`Report this comment as abusive, harmful or spam`}
                  onClick={() => setOwnerQualityRating('harmful', i18n)}
                >
                  <Danger
                    htmlColor={
                      ownerQualityRating === 'harmful'
                        ? theme.message.error
                        : undefined
                    }
                  />
                </IconButton>
                <IconButton
                  size="small"
                  tooltip={processed ? t`Mark as unread` : t`Mark as read`}
                  onClick={() => setProcessed(!processed, i18n)}
                >
                  {processed ? (
                    <CheckCircleFilled htmlColor={theme.message.valid} />
                  ) : (
                    <CheckCircle />
                  )}
                </IconButton>
              </LineStackLayout>
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
                  {comment.playerId ? (
                    <Link
                      onClick={() => setOpenPlayerPublicProfileDialog(true)}
                      href="#"
                    >
                      <Text noMargin color="inherit">
                        {comment.playerName || 'Anonymous player'}
                      </Text>
                    </Link>
                  ) : (
                    <BackgroundText style={styles.backgroundText}>
                      {comment.playerName || 'Anonymous player'}
                    </BackgroundText>
                  )}
                  {comment.contact && (
                    <LineStackLayout alignItems="center" noMargin>
                      <BackgroundText style={styles.backgroundText}>
                        <Trans>Contact:</Trans>
                      </BackgroundText>
                      <Text allowSelection>{comment.contact}</Text>
                    </LineStackLayout>
                  )}
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
              <Text style={styles.textComment} allowSelection>
                {comment.text}
              </Text>
            </Column>
          </Card>
          {comment.playerId && openPlayerPublicProfileDialog && (
            <PublicProfileDialog
              userId={comment.playerId}
              onClose={() => setOpenPlayerPublicProfileDialog(false)}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default FeedbackCard;
