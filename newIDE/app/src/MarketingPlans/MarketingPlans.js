// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import {
  buyGameFeaturing,
  listGameFeaturings,
  type Game,
  type MarketingPlan,
  type GameFeaturing,
} from '../Utils/GDevelopServices/Game';
import Text from '../UI/Text';
import Link from '../UI/Link';
import Window from '../Utils/Window';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { CreditsPackageStoreContext } from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { MarketingPlansStoreContext } from './MarketingPlansStoreContext';
import {
  getMarketingPlanPrice,
  getRequirementsErrors,
  isMarketingPlanActive,
} from './MarketingPlanUtils';
import MarketingPlanFeatures from './MarketingPlanFeatures';

type Props = {|
  game: Game,
|};

const MarketingPlans = ({ game }: Props) => {
  const { profile, limits, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const { openCreditsPackageDialog, openCreditsUsageDialog } = React.useContext(
    CreditsPackageStoreContext
  );
  const {
    marketingPlans,
    error: marketingPlansError,
    fetchMarketingPlans,
  } = React.useContext(MarketingPlansStoreContext);
  const { showAlert } = useAlertDialog();
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
      if (!profile) return;
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

  const onPurchase = React.useCallback(
    async (i18n: I18nType, marketingPlan: MarketingPlan) => {
      if (!profile || !limits) return;

      const {
        id,
        nameByLocale,
        canExtend,
        requiresManualContact,
        additionalSuccessMessageByLocale,
      } = marketingPlan;
      const planCreditsAmount = getMarketingPlanPrice(marketingPlan, limits);
      if (!planCreditsAmount) return;

      const translatedName = selectMessageByLocale(i18n, nameByLocale);

      const isPlanActive = isMarketingPlanActive(
        marketingPlan,
        activeGameFeaturings
      );
      if (isPlanActive && !canExtend) {
        if (requiresManualContact) {
          await showAlert({
            title: t`Featuring already active`,
            message: t`You already have an active ${translatedName} featuring for your game ${
              game.gameName
            }. Check your emails or discord, we will get in touch with you to get the campaign up!`,
          });
        }
        return;
      }

      const currentCreditsAmount = limits.credits.userBalance.amount;
      if (currentCreditsAmount < planCreditsAmount) {
        openCreditsPackageDialog({
          missingCredits: planCreditsAmount - currentCreditsAmount,
        });
        return;
      }

      openCreditsUsageDialog({
        title:
          isPlanActive && canExtend ? (
            <Trans>Extend Featuring</Trans>
          ) : (
            <Trans>Get Featuring</Trans>
          ),
        message: canExtend ? (
          <Trans>
            You are about to use {planCreditsAmount} credits to extend the game
            featuring {translatedName} for your game {game.gameName} and push it
            to the top of gd.games. Continue?
          </Trans>
        ) : (
          <Trans>
            You are about to use {planCreditsAmount} credits to purchase the
            game featuring {translatedName} for your game {game.gameName}.
            Continue?
          </Trans>
        ),
        onConfirm: async () => {
          await buyGameFeaturing(getAuthorizationHeader, {
            gameId: game.id,
            usageType: id,
            userId: profile.id,
          });
          await fetchGameFeaturings();
        },
        successMessage: (
          <span>
            <Trans>
              🎉 Congrats on getting the {translatedName} featuring for your
              game {game.gameName}!
            </Trans>{' '}
            {selectMessageByLocale(i18n, additionalSuccessMessageByLocale)}
          </span>
        ),
      });
    },
    [
      game,
      getAuthorizationHeader,
      limits,
      profile,
      showAlert,
      fetchGameFeaturings,
      openCreditsPackageDialog,
      openCreditsUsageDialog,
      activeGameFeaturings,
    ]
  );

  if (!profile || !limits) return null;

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
                Get ready-made packs to make your game visible to the GDevelop
                community.{' '}
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

                const requirementsErrors = isPlanActive
                  ? getRequirementsErrors(game, marketingPlan)
                  : [];

                return (
                  <MarketingPlanFeatures
                    gameFeaturings={gameFeaturings}
                    marketingPlan={marketingPlan}
                    onPurchase={i18n => onPurchase(i18n, marketingPlan)}
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
