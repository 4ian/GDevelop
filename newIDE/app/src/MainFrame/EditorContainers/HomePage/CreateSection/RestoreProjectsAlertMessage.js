// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../../../UI/Text';
import { Line, Column } from '../../../../UI/Grid';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import GetSubscriptionCard from '../../../../Profile/Subscription/GetSubscriptionCard';

type Props = {|
  margin?: 'dense',
|};

const getProjectsRestorationMessage = (
  restorationTimeWindowInSeconds: ?number
): React.Node => {
  if (
    restorationTimeWindowInSeconds == null ||
    restorationTimeWindowInSeconds <= 0
  ) {
    return <Trans>Restore projects with a subscription</Trans>;
  }

  const days = Math.floor(restorationTimeWindowInSeconds / (24 * 3600));
  const hours = Math.floor(restorationTimeWindowInSeconds / 3600);
  const minutes = Math.max(1, Math.floor(restorationTimeWindowInSeconds / 60));
  const duration =
    days > 1 ? (
      <Trans>{days} days</Trans>
    ) : days === 1 ? (
      <Trans>1 day</Trans>
    ) : hours > 1 ? (
      <Trans>{hours} hours</Trans>
    ) : hours === 1 ? (
      <Trans>1 hour</Trans>
    ) : minutes > 1 ? (
      <Trans>{minutes} minutes</Trans>
    ) : (
      <Trans>1 minute</Trans>
    );

  return (
    <Trans>
      Get a subscription to restore projects deleted more than {duration} ago.
    </Trans>
  );
};

export const RestoreProjectsAlertMessage = ({ margin }: Props): React.Node => {
  const { limits } = React.useContext(AuthenticatedUserContext);

  return (
    <GetSubscriptionCard
      subscriptionDialogOpeningReason="Restore deleted project"
      label={<Trans>Get a subscription</Trans>}
      recommendedPlanId="gdevelop_silver"
      placementId="restore-deleted-project"
    >
      <Line>
        <Column noMargin expand>
          <Text
            size={margin === 'dense' ? 'sub-title' : 'block-title'}
            noMargin={margin === 'dense'}
          >
            <Trans>Deleted a project by mistake?</Trans>
          </Text>
          <Text noMargin={margin === 'dense'}>
            {getProjectsRestorationMessage(
              limits
                ? limits.capabilities.cloudProjects
                    .projectRestorationTimeWindowInSeconds
                : null
            )}
          </Text>
        </Column>
      </Line>
    </GetSubscriptionCard>
  );
};
