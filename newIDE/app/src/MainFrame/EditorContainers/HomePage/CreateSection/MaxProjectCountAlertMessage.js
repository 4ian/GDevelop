// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../../../UI/Text';
import { Line, Column } from '../../../../UI/Grid';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../../Profile/AuthenticatedUserContext';
import GetSubscriptionCard from '../../../../Profile/Subscription/GetSubscriptionCard';

type Props = {|
  margin?: 'dense',
|};

export const checkIfHasTooManyCloudProjects = (
  authenticatedUser: AuthenticatedUser
): boolean => {
  if (!authenticatedUser.authenticated) return false;

  const { limits, cloudProjects } = authenticatedUser;

  return limits &&
    cloudProjects &&
    limits.capabilities.cloudProjects.maximumCount > 0
    ? cloudProjects.filter(cloudProject => !cloudProject.deletedAt).length >=
        limits.capabilities.cloudProjects.maximumCount
    : false;
};

export const MaxProjectCountAlertMessage = ({
  margin,
}: Props): null | React.Node => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { limits } = authenticatedUser;
  if (!limits) return null;

  const {
    maximumCount,
    canMaximumCountBeIncreased: _canMaximumCountBeIncreased,
  } = limits.capabilities.cloudProjects;

  void _canMaximumCountBeIncreased;

  return (
    <GetSubscriptionCard
      subscriptionDialogOpeningReason="Cloud Project limit reached"
      label={
        margin === 'dense' ? (
          <Trans>Storage limit reached</Trans>
        ) : (
          <Trans>Cloud storage limit reached</Trans>
        )
      }
      hideButton
      recommendedPlanId="gdevelop_silver"
      placementId="max-projects-reached"
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
            <Trans>
              To keep using cloud projects, delete old or unused projects.
            </Trans>
          </Text>
        </Column>
      </Line>
    </GetSubscriptionCard>
  );
};
