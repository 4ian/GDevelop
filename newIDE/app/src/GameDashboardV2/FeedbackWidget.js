// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import FlatButton from '../UI/FlatButton';
import { Trans } from '@lingui/macro';
import DashboardWidget from './DashboardWidget';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';
import { type Comment } from '../Utils/GDevelopServices/Play';
import { Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import { shortenString } from '../Utils/StringHelpers';
import { Divider } from '@material-ui/core';
import { ColumnStackLayout } from '../UI/Layout';
import ScrollView from '../UI/ScrollView';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

const styles = {
  dot: {
    height: 6,
    width: 6,
    marginRight: 4,
    borderRadius: 5,
    flexShrink: 0,
  },
};

const NotificationDot = () => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <span
      style={{
        ...styles.dot,
        backgroundColor: gdevelopTheme.notification.badgeColor,
      }}
    />
  );
};

type Props = {|
  feedbacks: ?Array<Comment>,
  onSeeAll: () => void,
|};

const FeedbackWidget = ({ onSeeAll, feedbacks }: Props) => {
  const isLoading = !feedbacks;
  const unprocessedFeedbacks = feedbacks
    ? feedbacks.filter(comment => !comment.processedAt)
    : null;
  const hasNoFeedbacks = !feedbacks || feedbacks.length === 0;

  return (
    <I18n>
      {({ i18n }) => (
        <DashboardWidget
          gridSize={1}
          title={<Trans>Feedbacks</Trans>}
          seeMoreButton={
            <FlatButton
              label={<Trans>See all</Trans>}
              rightIcon={<ArrowRight fontSize="small" />}
              onClick={onSeeAll}
              primary
            />
          }
          withMaxHeight
          renderSubtitle={() =>
            isLoading ? null : !unprocessedFeedbacks ||
              unprocessedFeedbacks.length === 0 ? (
              <Text color="secondary" size="body-small" noMargin>
                {hasNoFeedbacks ? (
                  <Trans>No new feedbacks</Trans>
                ) : (
                  <Trans>All feedbacks processed</Trans>
                )}
              </Text>
            ) : (
              <Line noMargin alignItems="center">
                <NotificationDot />
                <Text color="secondary" size="body-small" noMargin>
                  {unprocessedFeedbacks.length === 1 ? (
                    <Trans>1 new feedback</Trans>
                  ) : (
                    <Trans>{unprocessedFeedbacks.length} new feedbacks</Trans>
                  )}
                </Text>
              </Line>
            )
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
                          <NotificationDot />

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
          ) : null}
        </DashboardWidget>
      )}
    </I18n>
  );
};

export default FeedbackWidget;
