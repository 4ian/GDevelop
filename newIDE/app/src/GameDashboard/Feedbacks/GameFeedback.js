// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import { Column, Line, Spacer } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import Text from '../../UI/Text';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import PlaceholderError from '../../UI/PlaceholderError';
import Checkbox from '../../UI/Checkbox';

import FeedbackCard from './FeedbackCard';

import {
  breakUuid,
  listComments,
  type Comment,
} from '../../Utils/GDevelopServices/Play';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { getBuilds, type Build } from '../../Utils/GDevelopServices/Build';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

type Props = {|
  authenticatedUser: AuthenticatedUser,
  game: Game,
  i18n: I18nType,
|};

const RETRIEVED_COMMENT_TYPE = 'FEEDBACK';
const filterUnsolvedComments = (comments: Array<Comment>) => {
  return comments.filter((comment: Comment) => !comment.processedAt);
};

const pushOrCreateKey = (
  key: string,
  value: Comment,
  object: { [key: string]: Array<Comment> }
) => {
  if (!object[key]) {
    object[key] = [value];
  } else {
    object[key].push(value);
  }
  return object;
};

const groupFeedbacks = (
  i18n: I18nType,
  feedbacks: Array<Comment>,
  { build, date }: { build: boolean, date: boolean }
) => {
  const feedbacksByBuild = feedbacks.reduce((acc, feedback) => {
    if (build) {
      if (!feedback.buildId) {
        return pushOrCreateKey('game-only', feedback, acc);
      } else {
        return pushOrCreateKey(feedback.buildId, feedback, acc);
      }
    } else {
      const dateKey = i18n.date(feedback.createdAt, {
        month: 'long',
        year: 'numeric',
      });
      return pushOrCreateKey(dateKey, feedback, acc);
    }
  }, {});
  return feedbacksByBuild;
};

const getDisplayedFeedbacks = (
  i18n: I18nType,
  feedbacks: ?Array<Comment>,
  showUnsolved: boolean,
  sortByDate: boolean,
  selectedBuildId: string
) => {
  if (!feedbacks) return null;
  let filteredFeedbacksByBuild = feedbacks;
  if (selectedBuildId === 'game-only') {
    filteredFeedbacksByBuild = feedbacks.filter(feedback => !feedback.buildId);
  } else if (selectedBuildId) {
    filteredFeedbacksByBuild = feedbacks.filter(
      feedback => feedback.buildId === selectedBuildId
    );
  }

  const filteredFeedbacksByBuildAndUnsolved = showUnsolved
    ? filterUnsolvedComments(filteredFeedbacksByBuild)
    : filteredFeedbacksByBuild;

  return sortByDate
    ? groupFeedbacks(i18n, filteredFeedbacksByBuildAndUnsolved, {
        build: false,
        date: true,
      })
    : groupFeedbacks(i18n, filteredFeedbacksByBuildAndUnsolved, {
        build: true,
        date: false,
      });
};

const GameFeedback = ({ i18n, authenticatedUser, game }: Props) => {
  const [showUnsolved, setShowUnsolved] = React.useState(false);
  const [sortByDate, setSortByDate] = React.useState(true);
  const [feedbacks, setFeedbacks] = React.useState<?Array<Comment>>(null);
  const [buildsByIds, setBuildsByIds] = React.useState<?{
    [id: string]: Build,
  }>(null);
  const [selectedBuildId, setSelectedBuildId] = React.useState<string>('');
  const [isErrored, setIsErrored] = React.useState(false);

  const displayedFeedbacks = getDisplayedFeedbacks(
    i18n,
    feedbacks,
    showUnsolved,
    sortByDate,
    selectedBuildId
  );

  const getBuildName = (buildId: string) => {
    if (!buildsByIds) return '';
    const build = buildsByIds[buildId];
    return build ? build.name : '';
  };

  const loadFeedbacksAndBuilds = React.useCallback(
    async () => {
      setIsErrored(false);
      const { getAuthorizationHeader, profile } = authenticatedUser;
      if (!profile) {
        setIsErrored(true);
        return;
      }
      try {
        const [feedbacks, builds] = await Promise.all([
          listComments(getAuthorizationHeader, profile.id, {
            gameId: game.id,
            type: RETRIEVED_COMMENT_TYPE,
          }),
          getBuilds(getAuthorizationHeader, profile.id, game.id),
        ]);
        setFeedbacks(feedbacks);
        const buildsByIds = builds.reduce((acc, build) => {
          acc[build.id] = build;
          return acc;
        }, {});
        setBuildsByIds(buildsByIds);
      } catch {
        setIsErrored(true);
      }
    },
    [authenticatedUser, game]
  );

  const onCommentUpdated = (updatedComment: Comment) => {
    if (!feedbacks) return;
    setFeedbacks((previousFeedbacks: ?Array<Comment>) => {
      if (!previousFeedbacks) return previousFeedbacks;
      const newFeedbacks = [...previousFeedbacks];
      const updatedFeedbackIndex = newFeedbacks.findIndex(
        feedback => feedback.id === updatedComment.id
      );
      if (updatedFeedbackIndex === -1) return;
      newFeedbacks[updatedFeedbackIndex] = updatedComment;
      return newFeedbacks;
    });
  };

  React.useEffect(
    () => {
      loadFeedbacksAndBuilds();
    },
    [loadFeedbacksAndBuilds]
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
          <PlaceholderError onRetry={() => loadFeedbacksAndBuilds()}>
            <Text>
              <Trans>
                An error occured while retrieving feedbacks for this game.
              </Trans>
            </Text>
          </PlaceholderError>
        )}
        {authenticatedUser.authenticated && displayedFeedbacks && (
          <Column expand>
            <ResponsiveLineStackLayout justifyContent="space-between">
              <Column justifyContent="center">
                <LineStackLayout noMargin alignItems="center">
                  <Checkbox
                    checked={sortByDate}
                    onCheck={() => {
                      setSortByDate(!sortByDate);
                    }}
                    label={<Trans>Sort by most recent</Trans>}
                  />
                  <Spacer />
                  <Checkbox
                    checked={showUnsolved}
                    onCheck={() => {
                      setShowUnsolved(!showUnsolved);
                    }}
                    label={<Trans>Show unsolved feedbacks only</Trans>}
                  />
                </LineStackLayout>
              </Column>
              {buildsByIds && (
                <Column>
                  <div style={{ maxWidth: 350 }}>
                    <SelectField
                      fullWidth
                      floatingLabelText={<Trans>Show</Trans>}
                      value={selectedBuildId}
                      onChange={(e, i, value) => {
                        setSelectedBuildId(value);
                      }}
                    >
                      <SelectOption
                        key={'all'}
                        value={''}
                        primaryText={t`All builds`}
                      />
                      <SelectOption
                        key={'game-only'}
                        value={'game-only'}
                        primaryText={t`On game page only`}
                      />
                      <SelectOption
                        key={'game-only'}
                        value={'game-only'}
                        primaryText={t`verryyyyyyyyyyy long naaaaaaame`}
                      />
                      {Object.keys(buildsByIds).map(buildId => (
                        <SelectOption
                          key={buildId}
                          value={buildId}
                          primaryText={
                            buildsByIds[buildId].name || breakUuid(buildId)
                          }
                        />
                      ))}
                    </SelectField>
                  </div>
                </Column>
              )}
            </ResponsiveLineStackLayout>
            {Object.keys(displayedFeedbacks).length === 0 && (
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
            {Object.keys(displayedFeedbacks).length !== 0 && (
              <ColumnStackLayout expand noMargin>
                {Object.keys(displayedFeedbacks).map(key => (
                  <ColumnStackLayout>
                    <Spacer />
                    <Text>{sortByDate ? key : getBuildName(key)}</Text>
                    {displayedFeedbacks[key].map(
                      (comment: Comment, index: number) => (
                        <FeedbackCard
                          key={comment.id}
                          comment={comment}
                          build={
                            buildsByIds && comment.buildId
                              ? buildsByIds[comment.buildId]
                              : undefined
                          }
                          authenticatedUser={authenticatedUser}
                          onCommentUpdated={onCommentUpdated}
                        />
                      )
                    )}
                  </ColumnStackLayout>
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
