// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';

import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import {
  listGameFeaturings,
  type Game,
  type GameFeaturing,
} from '../Utils/GDevelopServices/Game';
import Text from '../UI/Text';
import Link from '../UI/Link';
import Window from '../Utils/Window';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { MarketingPlansStoreContext } from './MarketingPlansStoreContext';
import {
  getRequirementsErrors,
  isMarketingPlanActive,
} from './MarketingPlanUtils';
import MarketingPlanFeatures from './MarketingPlanFeatures';
import usePurchaseMarketingPlan from './UsePurchaseMarketingPlan';

type Props = {|
  game?: Game,
|};

const MarketingPlans = ({ game }: Props) => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const {
    marketingPlans,
    error: marketingPlansError,
    fetchMarketingPlans,
  } = React.useContext(MarketingPlansStoreContext);
  const [gameFeaturings, setGameFeaturings] = React.useState<
    GameFeaturing[] | null
  >(null);
  const [gameFeaturingsError, setGameFeaturingsError] = React.useState<?Error>(
    null
  );

  const activeGameFeaturings: ?(GameFeaturing[]) = React.useMemo(
    () => {
      if (!gameFeaturings) return null;

      return gameFeaturings.filter(
        gameFeaturing => gameFeaturing.expiresAt > Date.now() / 1000
      );
    },
    [gameFeaturings]
  );

  React.useEffect(
    () => {
      fetchMarketingPlans();
    },
    [fetchMarketingPlans]
  );

  const fetchGameFeaturings = React.useCallback(
    async () => {
      if (!profile || !game) {
        setGameFeaturings([]);
        return;
      }

      try {
        setGameFeaturingsError(null);
        const gameFeaturings = await listGameFeaturings(
          getAuthorizationHeader,
          {
            gameId: game.id,
            userId: profile.id,
          }
        );
        setGameFeaturings(gameFeaturings);
      } catch (error) {
        console.error(
          'An error occurred while fetching game featurings.',
          error
        );
        setGameFeaturingsError(error);
      }
    },
    [game, getAuthorizationHeader, profile]
  );

  React.useEffect(
    () => {
      fetchGameFeaturings();
    },
    [fetchGameFeaturings]
  );

  const { onPurchaseMarketingPlan } = usePurchaseMarketingPlan({
    game,
    activeGameFeaturings,
    fetchGameFeaturings,
  });

  return (
    <I18n>
      {({ i18n }) =>
        marketingPlansError || gameFeaturingsError ? (
          <PlaceholderError
            onRetry={() => {
              fetchMarketingPlans();
              fetchGameFeaturings();
            }}
          >
            <Trans>
              Error while loading the marketing plans. Verify your internet
              connection or try again later.
            </Trans>
          </PlaceholderError>
        ) : !marketingPlans ? (
          <PlaceholderLoader />
        ) : (
          <ColumnStackLayout noMargin>
            <Text color="secondary" noMargin>
              <Trans>
                Make your game visible to the GDevelop community and to the
                world with Marketing Boosts.{' '}
                <Link
                  href="https://wiki.gdevelop.io/gdevelop5/interface/games-dashboard/marketing"
                  onClick={() =>
                    Window.openExternalURL(
                      'https://wiki.gdevelop.io/gdevelop5/interface/games-dashboard/marketing'
                    )
                  }
                >
                  Read more
                </Link>{' '}
                about how they increase your views.
              </Trans>
            </Text>
            <ResponsiveLineStackLayout noColumnMargin>
              {marketingPlans.map(marketingPlan => {
                const isPlanActive = isMarketingPlanActive(
                  marketingPlan,
                  activeGameFeaturings
                );

                const requirementsErrors =
                  isPlanActive && game
                    ? getRequirementsErrors(game, marketingPlan)
                    : [];

                return (
                  <MarketingPlanFeatures
                    gameFeaturings={gameFeaturings}
                    marketingPlan={marketingPlan}
                    onPurchase={i18n =>
                      onPurchaseMarketingPlan(i18n, marketingPlan)
                    }
                    isPlanActive={isPlanActive}
                    requirementsErrors={requirementsErrors}
                  />
                );
              })}
            </ResponsiveLineStackLayout>
          </ColumnStackLayout>
        )
      }
    </I18n>
  );
};

export default MarketingPlans;
