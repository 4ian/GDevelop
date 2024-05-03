// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import { Column, Line } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import Text from '../../UI/Text';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import PlaceholderError from '../../UI/PlaceholderError';

import FeedbackCard from './FeedbackCard';

import {
  shortenUuidForDisplay,
  listComments,
  type Comment,
  updateComment,
} from '../../Utils/GDevelopServices/Play';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { getBuilds, type Build } from '../../Utils/GDevelopServices/Build';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import IconButton from '../../UI/IconButton';
import BackgroundText from '../../UI/BackgroundText';
import FeedbackAverageCard from './FeedbackAverageCard';
import Options from '../../UI/CustomSvgIcons/Options';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../UI/Menu/ContextMenu';
import { type MenuItemTemplate } from '../../UI/Menu/Menu.flow';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import CircularProgress from '../../UI/CircularProgress';
import FlatButton from '../../UI/FlatButton';

const styles = {
  // Make select field width not dependent on build names (name is truncated).
  selectFieldContainer: { minWidth: 200, maxWidth: 350, width: '100%' },
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
  const contextMenu = React.useRef<?ContextMenuInterface>(null);
  const { getAuthorizationHeader, profile } = authenticatedUser;
  const [showProcessed, setShowProcessed] = React.useState(false);
  const [sortByDate, setSortByDate] = React.useState(true);
  const [feedbacks, setFeedbacks] = React.useState<?Array<Comment>>(null);
  const [buildsByIds, setBuildsByIds] = React.useState<?{
    [id: string]: Build,
  }>(null);
  const [filter, setFilter] = React.useState<string>('');
  const [isErrored, setIsErrored] = React.useState(false);
  const [isMarkingAllAsProcessed, setIsMarkingAllAsProcessed] = React.useState(
    false
  );

  const displayedFeedbacks = getDisplayedFeedbacks(
    i18n,
    feedbacks,
    showProcessed,
    sortByDate,
    filter
  );

  const displayedFeedbacksArray: Comment[] = displayedFeedbacks
    ? // $FlowFixMe - Flow doesn't understand that we're flattening the array.
      Object.values(displayedFeedbacks)
        .filter(Boolean)
        .flat()
    : [];

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

  const openOptionsContextMenu = (event: MouseEvent) => {
    if (contextMenu.current) {
      contextMenu.current.open(event.clientX, event.clientY);
    }
  };

  const markAllCommentsAsProcessed = async (i18n: I18nType) => {
    if (!profile || isMarkingAllAsProcessed) return;
    try {
      setIsMarkingAllAsProcessed(true);
      await Promise.all(
        displayedFeedbacksArray
          .filter(comment => !comment.processedAt)
          .map(comment =>
            updateComment(getAuthorizationHeader, profile.id, {
              gameId: comment.gameId,
              commentId: comment.id,
              processed: true,
            })
          )
      );
      // Reload the feedbacks
      loadFeedbacksAndBuilds();
    } catch (error) {
      console.error(`Unable to update one of the comments: `, error);
      showErrorBox({
        message:
          i18n._(t`Unable to mark one of the feedback as read.`) +
          ' ' +
          i18n._(t`Verify your internet connection or try again later.`),
        rawError: error,
        errorId: 'all-feedback-card-set-processed-error',
      });
    } finally {
      setIsMarkingAllAsProcessed(false);
    }
  };

  const buildOptionsContextMenu = (i18n: I18nType): Array<MenuItemTemplate> => [
    {
      label: i18n._(t`Sort by most recent`),
      click: () => setSortByDate(!sortByDate),
      checked: sortByDate,
      type: 'checkbox',
    },
    {
      label: i18n._(t`Show unread feedback only`),
      click: () => setShowProcessed(!showProcessed),
      checked: showProcessed,
      type: 'checkbox',
    },
    { type: 'separator' },
    {
      label: i18n._(t`Mark all as solved`),
      click: () => markAllCommentsAsProcessed(i18n),
    },
  ];

  return (
    <>
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
            <PlaceholderError onRetry={loadFeedbacksAndBuilds}>
              <Trans>
                An error occurred while retrieving feedbacks for this game.
              </Trans>
            </PlaceholderError>
          )}
          {authenticatedUser.authenticated && displayedFeedbacks && (
            <Column expand noMargin>
              <ResponsiveLineStackLayout justifyContent="space-between">
                <Column justifyContent="center">
                  <LineStackLayout noMargin alignItems="center">
                    <BackgroundText>
                      <Trans>
                        This is all the feedback received on {game.gameName}{' '}
                        coming from gd.games.
                      </Trans>
                    </BackgroundText>
                  </LineStackLayout>
                </Column>
                {buildsByIds && (
                  <Column>
                    <Line>
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
                            label={t`All builds`}
                          />
                          <SelectOption
                            key={'game-only'}
                            value={'game-only'}
                            label={t`On game page only`}
                          />
                          {Object.keys(buildsByIds).map(buildId => {
                            return (
                              <SelectOption
                                key={buildId}
                                value={buildId}
                                label={getBuildNameOption(buildId)}
                              />
                            );
                          })}
                        </SelectField>
                      </div>
                    </Line>
                  </Column>
                )}
              </ResponsiveLineStackLayout>
              <ColumnStackLayout expand noMargin>
                {!!feedbacks && feedbacks.length > 0 && (
                  <FeedbackAverageCard feedbacks={feedbacks} />
                )}
              </ColumnStackLayout>
              {displayedFeedbacksArray.length === 0 && (
                <>
                  {showProcessed ? (
                    <LineStackLayout
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text>
                        <Trans>
                          You don't have any unread feedback for this game.
                        </Trans>
                      </Text>
                      <FlatButton
                        onClick={() => setShowProcessed(false)}
                        label={<Trans>Show all feedbacks</Trans>}
                      />
                    </LineStackLayout>
                  ) : (
                    <Text>
                      <Trans>You don't have any feedback for this game.</Trans>
                    </Text>
                  )}
                </>
              )}
              {displayedFeedbacksArray.length !== 0 && (
                <ColumnStackLayout expand noMargin>
                  {Object.keys(displayedFeedbacks).map((key, index) => {
                    const title = sortByDate ? key : getBuildNameTitle(key);
                    return (
                      <ColumnStackLayout key={key} noMargin>
                        <Line
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Column>
                            <Text size="block-title">
                              {title}
                              {title ? ' - ' : ' '}
                              <Trans>
                                {displayedFeedbacks[key].length} feedback cards
                              </Trans>
                            </Text>
                          </Column>
                          {index === 0 && (
                            <Column justifyContent="center">
                              <IconButton
                                disabled={isMarkingAllAsProcessed}
                                onClick={event => openOptionsContextMenu(event)}
                              >
                                {!isMarkingAllAsProcessed ? (
                                  <Options fontSize="small" />
                                ) : (
                                  <CircularProgress size={20} />
                                )}
                              </IconButton>
                            </Column>
                          )}
                        </Line>
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
                    );
                  })}
                </ColumnStackLayout>
              )}
            </Column>
          )}
        </Line>
      </Column>
      <ContextMenu
        ref={contextMenu}
        buildMenuTemplate={buildOptionsContextMenu}
      />
    </>
  );
};

export default GameFeedback;
