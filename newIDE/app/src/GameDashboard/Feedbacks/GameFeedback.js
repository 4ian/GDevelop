// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import { Column, Line } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import Text from '../../UI/Text';
import { ColumnStackLayout } from '../../UI/Layout';
import PlaceholderError from '../../UI/PlaceholderError';
import Checkbox from '../../UI/Checkbox';

import FeedbackCard from './FeedbackCard';

import { listComments, type Comment } from '../../Utils/GDevelopServices/Play';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

type Props = {|
  authenticatedUser: AuthenticatedUser,
  game: Game,
|};

const RETRIEVED_COMMENT_TYPE = 'FEEDBACK';
const filterUnsolvedComments = (comments: Array<Comment>) => {
  return comments.filter((comment: Comment) => !comment.processedAt);
};

const GameFeedback = ({ authenticatedUser, game }: Props) => {
  const [showUnsolved, setShowUnsolved] = React.useState(false);
  const [feedbacks, setFeedbacks] = React.useState<?Array<Comment>>(null);
  const [isErrored, setIsErrored] = React.useState(false);

  const displayedFeedbacks = feedbacks
    ? showUnsolved
      ? filterUnsolvedComments(feedbacks)
      : feedbacks
    : null;

  const loadFeedbacks = React.useCallback(
    async () => {
      setIsErrored(false);
      const { getAuthorizationHeader, profile } = authenticatedUser;
      if (!profile) {
        setIsErrored(true);
        return;
      }
      try {
        const feedbacks = await listComments(
          getAuthorizationHeader,
          profile.id,
          {
            gameId: game.id,
            type: RETRIEVED_COMMENT_TYPE,
          }
        );
        setFeedbacks(feedbacks);
      } catch {
        setIsErrored(true);
      }
    },
    [authenticatedUser, game]
  );

  React.useEffect(
    () => {
      loadFeedbacks();
    },
    [loadFeedbacks]
  );

  return (
    <Column noMargin expand>
      <Line>
        {!authenticatedUser.authenticated && (
          <EmptyMessage>
            <Trans>You need to login first to see your game feedbacks.</Trans>
          </EmptyMessage>
        )}
        {authenticatedUser.authenticated &&
          !displayedFeedbacks &&
          !isErrored && <PlaceholderLoader />}
        {authenticatedUser.authenticated && isErrored && (
          <PlaceholderError onRetry={() => {}}>
            <Text>
              <Trans>
                An error occured while retrieving feedbacks for this game.
              </Trans>
            </Text>
          </PlaceholderError>
        )}
        {authenticatedUser.authenticated && displayedFeedbacks && (
          <Column expand>
            <Column>
              <Line>
                <Checkbox
                  checked={showUnsolved}
                  onCheck={() => {
                    setShowUnsolved(!showUnsolved);
                  }}
                  label={<Trans>Show unsolved feedbacks only</Trans>}
                />
              </Line>
            </Column>
            {displayedFeedbacks.length === 0 && (
              <EmptyMessage>
                {showUnsolved ? (
                  <Trans>
                    You don't have any unsolved feedback for this game.
                  </Trans>
                ) : (
                  <Trans>You don't have any feedback for this game.</Trans>
                )}
              </EmptyMessage>
            )}
            {displayedFeedbacks.length !== 0 && (
              <ColumnStackLayout expand>
                {displayedFeedbacks.map((comment: Comment) => (
                  <FeedbackCard
                    key={comment.id}
                    comment={comment}
                    authenticatedUser={authenticatedUser}
                  />
                ))}
              </ColumnStackLayout>
            )}
          </Column>
        )}
      </Line>
    </Column>
  );
};

export default GameFeedback;
