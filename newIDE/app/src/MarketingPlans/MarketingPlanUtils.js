// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import type { Limits } from '../Utils/GDevelopServices/Usage';
import {
  type MarketingPlan,
  type GameFeaturing,
  type Game,
  getGameMainImageUrl,
} from '../Utils/GDevelopServices/Game';
import Speaker from './Icons/Speaker';
import Speedometer from './Icons/Speedometer';
import Stars from './Icons/Stars';
import { Trans } from '@lingui/macro';

const styles = {
  iconStyle: { width: 40, height: 40 },
};

export const getIconForMarketingPlan = (marketingPlan: MarketingPlan) => {
  switch (marketingPlan.icon) {
    case 'speaker':
      return <Speaker style={styles.iconStyle} />;
    case 'speedometer':
      return <Speedometer style={styles.iconStyle} />;
    case 'stars':
      return <Stars style={styles.iconStyle} />;
    default:
      return null;
  }
};

const getActiveFeaturingsOfMarketingPlan = (
  marketingPlan: MarketingPlan,
  activeGameFeaturings: GameFeaturing[]
) => {
  return activeGameFeaturings.filter(activeGameFeaturing =>
    marketingPlan.includedFeaturings.includes(activeGameFeaturing.featuring)
  );
};

export const getMarketingPlanPrice = (
  marketingPlan: MarketingPlan,
  limits: ?Limits
) => {
  if (!limits) return null;

  const prices = limits.credits.prices;
  const usagePrice = prices[marketingPlan.id];
  if (!usagePrice) return null;

  return usagePrice.priceInCredits;
};

export const isMarketingPlanActive = (
  marketingPlan: MarketingPlan,
  activeGameFeaturings: ?(GameFeaturing[])
) => {
  if (!activeGameFeaturings) return false;
  const includedMarketingPlanFeaturings = marketingPlan.includedFeaturings;

  // A marketing plan is considered active if it has all the included featurings active.
  return includedMarketingPlanFeaturings.every(includedMarketingPlanFeaturing =>
    activeGameFeaturings.some(
      activeGameFeaturing =>
        activeGameFeaturing.featuring === includedMarketingPlanFeaturing
    )
  );
};

export const getRequirementsErrors = (
  game: Game,
  marketingPlan: MarketingPlan
): React.Node[] => {
  const requirementsErrors = [];
  const marketingPlanGameRequirements = marketingPlan.gameRequirements;
  if (
    !!marketingPlanGameRequirements.hasThumbnail &&
    !getGameMainImageUrl(game)
  ) {
    requirementsErrors.push(<Trans>You don't have a thumbnail</Trans>);
  }
  if (!marketingPlanGameRequirements.isPublished && !game.publicWebBuildId) {
    requirementsErrors.push(
      <Trans>Your game is not published on gd.games</Trans>
    );
  }
  if (!!marketingPlanGameRequirements.isDiscoverable && !game.discoverable) {
    requirementsErrors.push(<Trans>Your game is hidden on gd.games</Trans>);
  }

  return requirementsErrors;
};

export const getActiveMessage = ({
  marketingPlan,
  i18n,
  hasErrors,
  activeGameFeaturings,
}: {|
  marketingPlan: MarketingPlan,
  i18n: I18nType,
  hasErrors: boolean,
  activeGameFeaturings: GameFeaturing[],
|}) => {
  if (hasErrors) {
    return <Trans>Fix those issues to get the campaign up!</Trans>;
  }

  const activeFeaturingsForPlan = getActiveFeaturingsOfMarketingPlan(
    marketingPlan,
    activeGameFeaturings
  );

  if (
    activeFeaturingsForPlan.length === 0 || // Still loading or no active featurings
    !marketingPlan.showExpirationDate
  ) {
    return null;
  }

  // Assume they will all have the same expiration date, so pick the first one.
  const activeFeaturing = activeFeaturingsForPlan[0];

  return !marketingPlan.requiresManualContact ? (
    <Trans>Active until {i18n.date(activeFeaturing.expiresAt * 1000)}</Trans>
  ) : marketingPlan.requiresManualContact ? (
    <Trans>Active, we will get in touch to get the campaign up!</Trans>
  ) : (
    <Trans>Active</Trans>
  );
};
