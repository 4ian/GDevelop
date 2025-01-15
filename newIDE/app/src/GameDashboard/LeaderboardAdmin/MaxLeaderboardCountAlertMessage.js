// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../UI/Text';
import { Line, Column } from '../../UI/Grid';
import GetSubscriptionCard from '../../Profile/Subscription/GetSubscriptionCard';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../Profile/AuthenticatedUserContext';
import { type Leaderboard } from '../../Utils/GDevelopServices/Play';
import { hasValidSubscriptionPlan } from '../../Utils/GDevelopServices/Usage';

export const checkIfHasTooManyLeaderboards = (
  authenticatedUser: AuthenticatedUser,
  leaderboards: ?Array<Leaderboard>
) => {
  if (!authenticatedUser.authenticated) return false;

  const { limits } = authenticatedUser;

  if (!limits) return false;

  const leaderboardLimits = limits.capabilities.leaderboards;

  return (
    leaderboards &&
    leaderboardLimits &&
    leaderboardLimits.maximumCountPerGame > 0 &&
    leaderboards.filter(leaderboard => !leaderboard.deletedAt).length >=
      leaderboardLimits.maximumCountPerGame
  );
};

const MaxLeaderboardCountAlertMessage = () => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { limits, subscription } = authenticatedUser;
  if (!limits) return null;

  const hasValidSubscription = hasValidSubscriptionPlan(subscription);

  const leaderboardLimits = limits.capabilities.leaderboards;
  if (!leaderboardLimits) return null;

  return (
    <Line>
      <Column expand>
        <GetSubscriptionCard
          subscriptionDialogOpeningReason="Leaderboard count per game limit reached"
          label={
            !hasValidSubscription ? (
              <Trans>Upgrade to GDevelop Premium</Trans>
            ) : (
              <Trans>Upgrade your Premium Plan</Trans>
            )
          }
          hideButton={!leaderboardLimits.canMaximumCountPerGameBeIncreased}
          recommendedPlanIdIfNoSubscription="gdevelop_silver"
        >
          <Line>
            <Column noMargin expand>
              <Text size="block-title">
                <Trans>
                  You've reached your maximum of{' '}
                  {leaderboardLimits.maximumCountPerGame} leaderboards for your
                  game
                </Trans>
              </Text>
              <Text>
                {leaderboardLimits.canMaximumCountPerGameBeIncreased ? (
                  <Trans>
                    Upgrade to GDevelop Premium to get more leaderboards,
                    storage, and one-click packagings!
                  </Trans>
                ) : (
                  // This should not happen at the moment since leaderboards are unlimited
                  // in any paid plans but it could happen in the future with a plan that
                  // cannot be increased and that has a max number of leaderboards.
                  <Trans>
                    To keep using GDevelop leaderboards, consider deleting old,
                    unused leaderboards.
                  </Trans>
                )}
              </Text>
            </Column>
          </Line>
        </GetSubscriptionCard>
      </Column>
    </Line>
  );
};

export default MaxLeaderboardCountAlertMessage;
