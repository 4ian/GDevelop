// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../../../UI/Text';
import { Line, Column } from '../../../../UI/Grid';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../../Profile/AuthenticatedUserContext';
import GetSubscriptionCard from '../../../../Profile/Subscription/GetSubscriptionCard';
import { hasValidSubscriptionPlan } from '../../../../Utils/GDevelopServices/Usage';

type Props = {|
  margin?: 'dense',
|};

export const checkIfHasTooManyCloudProjects = (
  authenticatedUser: AuthenticatedUser
) => {
  if (!authenticatedUser.authenticated) return false;

  const { limits, cloudProjects } = authenticatedUser;

  return limits &&
    cloudProjects &&
    limits.capabilities.cloudProjects.maximumCount > 0
    ? cloudProjects.filter(cloudProject => !cloudProject.deletedAt).length >=
        limits.capabilities.cloudProjects.maximumCount
    : false;
};

export const MaxProjectCountAlertMessage = ({ margin }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { limits, subscription } = authenticatedUser;
  if (!limits) return null;

  const hasValidSubscription = hasValidSubscriptionPlan(subscription);

  const {
    maximumCount,
    canMaximumCountBeIncreased,
  } = limits.capabilities.cloudProjects;

  return (
    <GetSubscriptionCard
      subscriptionDialogOpeningReason="Cloud Project limit reached"
      label={
        margin === 'dense' ? (
          <Trans>Upgrade</Trans>
        ) : !hasValidSubscription ? (
          <Trans>Upgrade to GDevelop Premium</Trans>
        ) : (
          <Trans>Upgrade your Premium Plan</Trans>
        )
      }
      hideButton={!canMaximumCountBeIncreased}
      recommendedPlanIdIfNoSubscription="gdevelop_silver"
    >
      <Line>
        <Column noMargin expand>
          <Text
            size={margin === 'dense' ? 'sub-title' : 'block-title'}
            noMargin={margin === 'dense'}
          >
            {maximumCount === 1 ? (
              <Trans>One project at a time — Upgrade for more</Trans>
            ) : (
              <Trans>
                You've reached your maximum storage of {maximumCount}
                cloud projects
              </Trans>
            )}
          </Text>
          <Text noMargin={margin === 'dense'}>
            {canMaximumCountBeIncreased ? (
              !hasValidSubscription ? (
                <Trans>
                  Thanks for trying GDevelop! Unlock more projects, publishing,
                  multiplayer, courses and much more by upgrading.
                </Trans>
              ) : (
                <Trans>
                  Upgrade to get more cloud projects, publishing, multiplayer,
                  courses and credits every month with GDevelop Premium.
                </Trans>
              )
            ) : (
              <Trans>
                To keep using GDevelop cloud, consider deleting old, unused
                projects.
              </Trans>
            )}
          </Text>
        </Column>
      </Line>
    </GetSubscriptionCard>
  );
};
