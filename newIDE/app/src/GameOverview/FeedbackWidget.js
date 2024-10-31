// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import Divider from '@material-ui/core/Divider';
import { t, Trans } from '@lingui/macro';
import FlatButton from '../UI/FlatButton';
import DashboardWidget from './DashboardWidget';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';
import { type Comment } from '../Utils/GDevelopServices/Play';
import {
  getGameUrl,
  type Game,
  type GameUpdatePayload,
} from '../Utils/GDevelopServices/Game';
import { Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import { shortenString } from '../Utils/StringHelpers';
import { ColumnStackLayout } from '../UI/Layout';
import ScrollView from '../UI/ScrollView';
import GameLinkAndShareIcons from './GameLinkAndShareIcons';
import NotificationDot from './NotificationDot';
import { CompactToggleField } from '../UI/CompactToggleField';

type Props = {|
  feedbacks: ?Array<Comment>,
  onSeeAll: () => void,
  game: Game,
  onUpdateGame: GameUpdatePayload => Promise<void>,
|};

const FeedbackWidget = ({ onSeeAll, feedbacks, game, onUpdateGame }: Props) => {
  const unprocessedFeedbacks = feedbacks
    ? feedbacks.filter(comment => !comment.processedAt)
    : null;

  const gameUrl = getGameUrl(game);

  const shouldDisplayControlToCollectFeedback =
    !game.acceptsGameComments && feedbacks && feedbacks.length === 0;

  return (
    <I18n>
      {({ i18n }) => (
        <DashboardWidget
          gridSize={1}
          title={<Trans>Feedbacks</Trans>}
          seeMoreButton={
            !feedbacks || feedbacks.length === 0 ? null : (
              <FlatButton
                label={<Trans>See more</Trans>}
                rightIcon={<ArrowRight fontSize="small" />}
                onClick={onSeeAll}
                primary
              />
            )
          }
          withMaxHeight
          renderSubtitle={() =>
            shouldDisplayControlToCollectFeedback ? null : unprocessedFeedbacks &&
              feedbacks ? (
              unprocessedFeedbacks.length > 0 ? (
                <Line noMargin alignItems="center">
                  <NotificationDot color="notification" />
                  <Text color="secondary" size="body-small" noMargin>
                    {unprocessedFeedbacks.length === 1 ? (
                      <Trans>1 new feedback</Trans>
                    ) : (
                      <Trans>{unprocessedFeedbacks.length} new feedbacks</Trans>
                    )}
                  </Text>
                </Line>
              ) : feedbacks.length > 0 ? (
                <Text color="secondary" size="body-small" noMargin>
                  <Trans>All feedbacks processed</Trans>
                </Text>
              ) : null
            ) : null
          }
        >
          {!!unprocessedFeedbacks && unprocessedFeedbacks.length > 0 ? (
            <ScrollView>
              <ColumnStackLayout noMargin>
                {unprocessedFeedbacks.slice(0, 3).map((comment, index) => (
                  <React.Fragment key={comment.id}>
                    {index > 0 && <Spacer />}
                    {index > 0 && <Divider orientation="horizontal" />}
                    <ColumnStackLayout>
                      <Line
                        noMargin
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Text
                          allowSelection
                          color={'secondary'}
                          size="body-small"
                        >
                          {i18n.date(comment.createdAt)}
                        </Text>
                        <Line noMargin alignItems="center">
                          <NotificationDot color="notification" />
                          <Text
                            allowSelection
                            color={'secondary'}
                            size="body-small"
                          >
                            <Trans>New</Trans>
                          </Text>
                        </Line>
                      </Line>
                      <Text
                        allowSelection
                        color={comment.text ? 'primary' : 'secondary'}
                        size="body-small"
                        noMargin
                      >
                        {comment.text ? (
                          shortenString(comment.text, 120)
                        ) : (
                          <i>
                            <Trans>Empty free text</Trans>
                          </i>
                        )}
                      </Text>
                    </ColumnStackLayout>
                  </React.Fragment>
                ))}
              </ColumnStackLayout>
            </ScrollView>
          ) : (
            !!feedbacks &&
            feedbacks.length === 0 &&
            (shouldDisplayControlToCollectFeedback ? (
              <ColumnStackLayout noMargin expand>
                <Spacer />
                <CompactToggleField
                  checked={false}
                  label={i18n._(t`Collect game feedback`)}
                  onCheck={newValue => {
                    onUpdateGame({ acceptsGameComments: newValue });
                  }}
                />
                <Text color="secondary" noMargin>
                  <Trans>
                    “Player feedback” is off, turn it on to start receiving
                    feedback on your game.
                  </Trans>
                </Text>
              </ColumnStackLayout>
            ) : gameUrl ? (
              <ColumnStackLayout noMargin justifyContent="center" expand>
                <Spacer />
                <Text color="secondary" noMargin>
                  <Trans>
                    You don’t have any player feedback yet. Share your game with
                    more people to start collecting player feedback.
                  </Trans>
                </Text>
                <GameLinkAndShareIcons url={gameUrl} display="column" />
              </ColumnStackLayout>
            ) : null)
          )}
        </DashboardWidget>
      )}
    </I18n>
  );
};

export default FeedbackWidget;
