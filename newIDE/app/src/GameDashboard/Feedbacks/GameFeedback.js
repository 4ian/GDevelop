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
  shortenUuidForDisplay,
  listComments,
  type Comment,
} from '../../Utils/GDevelopServices/Play';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { getBuilds, type Build } from '../../Utils/GDevelopServices/Build';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

const styles = {
  // Make select field width not dependent on build names (name is truncated).
  selectFieldContainer: { minWidth: 300 },
};

type Props = {|
  authenticatedUser: AuthenticatedUser,
  game: Game,
  i18n: I18nType,
|};

const RETRIEVED_COMMENT_TYPE = 'FEEDBACK';
const filterUnprocessedComments = (comments: Array<Comment>) => {
  return comments.filter((comment: Comment) => !comment.processedAt);
};

const pushOrCreateKey = (
  key: string,
  value: Comment,
  object: { [key: string]: Array<Comment> }
): { [key: string]: Array<Comment> } => {
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
): { [buildIdOrDate: string]: Array<Comment> } => {
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
  showUnprocessed: boolean,
  sortByDate: boolean,
  filter: string
): ?{ [buildIdOrDate: string]: Array<Comment> } => {
  if (!feedbacks) return null;
  let filteredFeedbacksByBuild = feedbacks;
  if (filter === 'game-only') {
    filteredFeedbacksByBuild = feedbacks.filter(feedback => !feedback.buildId);
  } else if (filter) {
    filteredFeedbacksByBuild = feedbacks.filter(
      feedback => feedback.buildId === filter
    );
  }

  const filteredFeedbacksByBuildAndUnprocessed = showUnprocessed
    ? filterUnprocessedComments(filteredFeedbacksByBuild)
    : filteredFeedbacksByBuild;

  return sortByDate
    ? groupFeedbacks(i18n, filteredFeedbacksByBuildAndUnprocessed, {
        build: false,
        date: true,
      })
    : groupFeedbacks(i18n, filteredFeedbacksByBuildAndUnprocessed, {
        build: true,
        date: false,
      });
};

const GameFeedback = ({ i18n, authenticatedUser, game }: Props) => {
  const [showProcessed, setShowProcessed] = React.useState(false);
  const [sortByDate, setSortByDate] = React.useState(true);
  const [feedbacks, setFeedbacks] = React.useState<?Array<Comment>>(null);
  const [buildsByIds, setBuildsByIds] = React.useState<?{
    [id: string]: Build,
  }>(null);
  const [filter, setFilter] = React.useState<string>('');
  const [isErrored, setIsErrored] = React.useState(false);

  const displayedFeedbacks = getDisplayedFeedbacks(
    i18n,
    feedbacks,
    showProcessed,
    sortByDate,
    filter
  );

  const getBuildNameOption = (buildId: string) => {
    const shortenedUuid = shortenUuidForDisplay(buildId);
    if (!buildsByIds) return shortenedUuid;

    const build = buildsByIds[buildId];

    const name = build.name;
    return name
      ? `${name.substring(0, 15)}${
          name.length >= 15 ? '...' : ''
        } (${shortenedUuid})`
      : shortenedUuid;
  };

  const getBuildNameTitle = (groupKey: string) => {
    if (groupKey === 'game-only') return '';
    const shortenedUuid = shortenUuidForDisplay(groupKey);
    if (!buildsByIds) return shortenedUuid;

    const build = buildsByIds[groupKey];
    if (!build)
      return (
        <>
          {`${shortenedUuid} `}
          <Trans>(deleted)</Trans>
        </>
      );
    return build.name ? `${build.name} (${shortenedUuid})` : shortenedUuid;
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

  const getBuildPropertiesForComment = (comment: Comment) => {
    if (!comment.buildId) return undefined;
    if (!buildsByIds) return { id: comment.buildId };
    const build = buildsByIds[comment.buildId];
    if (!build) return { id: comment.buildId, isDeleted: true };
    return {
      id: build.id,
      name: build.name,
      isDeleted: false,
    };
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
            <Trans>
              An error occured while retrieving feedbacks for this game.
            </Trans>
          </PlaceholderError>
        )}
        {authenticatedUser.authenticated && displayedFeedbacks && (
          <Column expand noMargin>
            <ResponsiveLineStackLayout justifyContent="space-between">
              <Column justifyContent="center">
                <LineStackLayout noMargin alignItems="center">
                  <Checkbox
                    checked={sortByDate}
                    onCheck={(_event, checked) => {
                      setSortByDate(checked);
                    }}
                    label={<Trans>Sort by most recent</Trans>}
                  />
                  <Spacer />
                  <Checkbox
                    checked={showProcessed}
                    onCheck={(_event, checked) => {
                      setShowProcessed(checked);
                    }}
                    label={<Trans>Show unread feedback only</Trans>}
                  />
                </LineStackLayout>
              </Column>
              {buildsByIds && (
                <Column>
                  <div style={styles.selectFieldContainer}>
                    <SelectField
                      fullWidth
                      floatingLabelText={<Trans>Show</Trans>}
                      value={filter}
                      onChange={(e, i, value) => {
                        setFilter(value);
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
                      {Object.keys(buildsByIds).map(buildId => {
                        return (
                          <SelectOption
                            key={buildId}
                            value={buildId}
                            primaryText={getBuildNameOption(buildId)}
                          />
                        );
                      })}
                    </SelectField>
                  </div>
                </Column>
              )}
            </ResponsiveLineStackLayout>
            {Object.keys(displayedFeedbacks).length === 0 && (
              <EmptyMessage>
                {showProcessed ? (
                  <Trans>
                    You don't have any unread feedback for this game.
                  </Trans>
                ) : (
                  <Trans>You don't have any feedback for this game.</Trans>
                )}
              </EmptyMessage>
            )}
            {Object.keys(displayedFeedbacks).length !== 0 && (
              <ColumnStackLayout expand noMargin>
                {Object.keys(displayedFeedbacks).map(key => (
                  <ColumnStackLayout key={key}>
                    <Spacer />
                    <Text>{sortByDate ? key : getBuildNameTitle(key)}</Text>
                    {displayedFeedbacks[key].map(
                      (comment: Comment, index: number) => (
                        <FeedbackCard
                          key={comment.id}
                          comment={comment}
                          buildProperties={getBuildPropertiesForComment(
                            comment
                          )}
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
