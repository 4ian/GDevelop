// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import DashboardWidget from './DashboardWidget';
import { type Comment } from '../../Utils/GDevelopServices/Play';
import { Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import NotificationDot from '../NotificationDot';

type Props = {|
  feedbacks: Array<Comment>,
|};

const AllFeedbacksWidget = ({ feedbacks }: Props) => {
  const unprocessedFeedbacks = feedbacks.filter(
    comment => !comment.processedAt
  );

  return (
    <I18n>
      {({ i18n }) => (
        <DashboardWidget
          gridSize={3}
          title={<Trans>Feedbacks</Trans>}
          topRightAction={
            <Line noMargin alignItems="center">
              {!!unprocessedFeedbacks.length && (
                <NotificationDot color="notification" />
              )}
              <Text color="secondary" size="body-small" noMargin>
                {unprocessedFeedbacks.length === 0 ? (
                  <Trans>No new feedback</Trans>
                ) : unprocessedFeedbacks.length === 1 ? (
                  <Trans>1 new feedback</Trans>
                ) : (
                  <Trans>{unprocessedFeedbacks.length} new feedbacks</Trans>
                )}
              </Text>
            </Line>
          }
        />
      )}
    </I18n>
  );
};

export default AllFeedbacksWidget;
