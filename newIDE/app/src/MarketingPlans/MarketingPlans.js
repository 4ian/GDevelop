// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
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
import Basic from './Icons/Basic';
import Pro from './Icons/Pro';
import Premium from './Icons/Premium';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { Column, Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import CheckCircle from '../UI/CustomSvgIcons/CheckCircle';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { CreditsPackageStoreContext } from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { MarketingPlansStoreContext } from './MarketingPlansStoreContext';

const styles = {
  campaign: {
    display: 'flex',
    flex: 1,
    borderRadius: 8,
    padding: 16,
  },
  titleContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  bulletPointsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  bulletIcon: { width: 20, height: 20, marginRight: 10 },
  iconStyle: { width: 40, height: 40 },
};

const getIconForMarketingPlan = (marketingPlan: MarketingPlan) => {
  switch (marketingPlan.id) {
    case 'featuring-basic':
      return <Basic style={styles.iconStyle} />;
    case 'featuring-pro':
      return <Pro style={styles.iconStyle} />;
    case 'featuring-premium':
      return <Premium style={styles.iconStyle} />;
    default:
      return null;
  }
};

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
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { showAlert } = useAlertDialog();
  const [gameFeaturings, setGameFeaturings] = React.useState<
    GameFeaturing[] | null
  >(null);
  const [gameFeaturingsError, setGameFeaturingsError] = React.useState<?Error>(
    null
  );

  const {
    activeBasicFeaturing,
    activeProFeaturing,
    activePremiumFeaturing,
  }: {|
    activeBasicFeaturing: ?GameFeaturing,
    activeProFeaturing: ?GameFeaturing,
    activePremiumFeaturing: ?GameFeaturing,
  |} = React.useMemo(
    () => {
      if (!gameFeaturings)
        return {
          activeBasicFeaturing: null,
          activeProFeaturing: null,
          activePremiumFeaturing: null,
        };

      const activeGameFeaturings = gameFeaturings.filter(
        gameFeaturing => gameFeaturing.expiresAt > Date.now() / 1000
      );
      return {
        activeBasicFeaturing: activeGameFeaturings.filter(
          gameFeaturing => gameFeaturing.featuring === 'games-platform-home'
        )[0],
        activeProFeaturing: activeGameFeaturings.filter(
          gameFeaturing => gameFeaturing.featuring === 'socials-newsletter'
        )[0],
        activePremiumFeaturing: activeGameFeaturings.filter(
          gameFeaturing => gameFeaturing.featuring === 'gdevelop-banner'
        )[0],
      };
    },
    [gameFeaturings]
  );

  const getActiveFeaturing = React.useCallback(
    (marketingPlan: MarketingPlan) => {
      switch (marketingPlan.id) {
        case 'featuring-basic':
          return activeBasicFeaturing;
        case 'featuring-pro':
          return activeProFeaturing;
        case 'featuring-premium':
          return activePremiumFeaturing;
        default:
          return null;
      }
    },
    [activeBasicFeaturing, activePremiumFeaturing, activeProFeaturing]
  );

  const getMarketingPlanPrice = React.useCallback(
    (marketingPlan: MarketingPlan) => {
      if (!profile || !limits) return null;

      const prices = limits.credits.prices;
      const usagePrice = prices[marketingPlan.id];
      if (!usagePrice) return null;

      return usagePrice.priceInCredits;
    },
    [limits, profile]
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

      const { id, nameByLocale } = marketingPlan;
      const planCreditsAmount = getMarketingPlanPrice(marketingPlan);
      if (!planCreditsAmount) return;

      const translatedName = selectMessageByLocale(i18n, nameByLocale);

      const activeFeaturing = getActiveFeaturing(marketingPlan);
      if (
        activeFeaturing &&
        (marketingPlan.id === 'featuring-pro' ||
          marketingPlan.id === 'featuring-premium')
      ) {
        await showAlert({
          title: t`Featuring already active`,
          message: t`You already have an active ${translatedName} featuring for your game ${
            game.gameName
          }. Check your emails or discord, we will get in touch with you to get the campaign up!`,
        });
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
        title: activeFeaturing ? (
          <Trans>Extend Featuring</Trans>
        ) : (
          <Trans>Get Featuring</Trans>
        ),
        message: activeFeaturing ? (
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
        successMessage:
          marketingPlan.id === 'featuring-basic' ? (
            <Trans>
              🎉 Congrats on getting the {translatedName} featuring for your
              game {game.gameName}! Ensure that your game is public and you have
              configured a thumbnail for gd.games. This can take a few minutes
              for your game to be visible on the platform.
            </Trans>
          ) : (
            <Trans>
              🎉 Congrats on getting the {translatedName} featuring for your
              game {game.gameName}. We will get in touch with you to get the
              campaign up!
            </Trans>
          ),
      });
    },
    [
      game,
      getAuthorizationHeader,
      limits,
      profile,
      showAlert,
      getActiveFeaturing,
      fetchGameFeaturings,
      openCreditsPackageDialog,
      openCreditsUsageDialog,
      getMarketingPlanPrice,
    ]
  );

  const getRequirementsErrors = (marketingPlan: MarketingPlan) => {
    const requirementsErrors = [];
    if (marketingPlan.id === 'featuring-basic') {
      if (!game.thumbnailUrl) {
        requirementsErrors.push(<Trans>You don't have a thumbnail</Trans>);
      }
      if (!game.publicWebBuildId) {
        requirementsErrors.push(
          <Trans>Your game does not have a public build</Trans>
        );
      }
      if (!game.discoverable) {
        requirementsErrors.push(<Trans>Your game is not discoverable</Trans>);
      }
    }

    return requirementsErrors;
  };

  const getActiveMessage = ({
    marketingPlan,
    activeFeaturing,
    i18n,
    hasErrors,
  }: {|
    marketingPlan: MarketingPlan,
    activeFeaturing: GameFeaturing,
    i18n: I18nType,
    hasErrors: boolean,
  |}) => {
    if (hasErrors) {
      return <Trans>Fix those issues to get the campaign up!</Trans>;
    }

    return activeFeaturing.featuring === 'games-platform-home' ? (
      <Trans>Active until {i18n.date(activeFeaturing.expiresAt * 1000)}</Trans>
    ) : (
      <Trans>Active, we will get in touch to get the campaign up!</Trans>
    );
  };

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
                const {
                  id,
                  nameByLocale,
                  descriptionByLocale,
                  bulletPointsByLocale,
                } = marketingPlan;
                const planCreditsAmount = getMarketingPlanPrice(marketingPlan);
                if (!planCreditsAmount) {
                  console.error(
                    `Could not find price for marketing plan ${id}, hiding it.`
                  );
                  return null;
                }
                const activeFeaturing = getActiveFeaturing(marketingPlan);
                const requirementsErrors = activeFeaturing
                  ? getRequirementsErrors(marketingPlan)
                  : [];
                const hasErrors = requirementsErrors.length > 0;
                return (
                  <div
                    style={{
                      ...styles.campaign,
                      border: activeFeaturing
                        ? `2px solid ${gdevelopTheme.message.valid}`
                        : `1px solid ${gdevelopTheme.palette.secondary}`,
                    }}
                    key={id}
                  >
                    <ColumnStackLayout
                      alignItems="center"
                      justifyContent="space-between"
                      noMargin
                      expand
                    >
                      <div style={styles.titleContainer}>
                        <LineStackLayout
                          justifyContent="space-between"
                          alignItems="flex-start"
                          expand
                        >
                          <LineStackLayout noMargin alignItems="flex-start">
                            {getIconForMarketingPlan(marketingPlan)}
                            <Text size="sub-title">
                              {selectMessageByLocale(i18n, nameByLocale)}
                            </Text>
                          </LineStackLayout>
                          <Text size="body-small" color="secondary">
                            <Trans>{planCreditsAmount} credits</Trans>
                          </Text>
                        </LineStackLayout>
                      </div>

                      <div style={styles.bulletPointsContainer}>
                        {hasErrors
                          ? requirementsErrors.map((error, index) => (
                              <Column key={index} expand noMargin>
                                <Line noMargin alignItems="center">
                                  <CheckCircle
                                    style={{
                                      ...styles.bulletIcon,
                                      color: gdevelopTheme.message.error,
                                    }}
                                  />
                                  <Text style={{ flex: 1 }}>{error}</Text>
                                </Line>
                              </Column>
                            ))
                          : bulletPointsByLocale.map(
                              (bulletPointByLocale, index) => (
                                <Column key={index} expand noMargin>
                                  <Line noMargin alignItems="center">
                                    <CheckCircle
                                      style={{
                                        ...styles.bulletIcon,
                                        ...(activeFeaturing
                                          ? {
                                              color:
                                                gdevelopTheme.message.valid,
                                            }
                                          : {}),
                                      }}
                                    />
                                    <Text style={{ flex: 1 }}>
                                      {selectMessageByLocale(
                                        i18n,
                                        bulletPointByLocale
                                      )}
                                    </Text>
                                  </Line>
                                </Column>
                              )
                            )}
                      </div>

                      <Column
                        noMargin
                        alignItems="flex-start"
                        expand
                        justifyContent="flex-end"
                      >
                        <Text
                          size="body-small"
                          noMargin
                          color="secondary"
                          align="left"
                        >
                          {activeFeaturing
                            ? getActiveMessage({
                                activeFeaturing,
                                marketingPlan,
                                i18n,
                                hasErrors,
                              })
                            : selectMessageByLocale(i18n, descriptionByLocale)}
                        </Text>
                      </Column>
                      <RaisedButton
                        primary={!activeFeaturing}
                        onClick={() => onPurchase(i18n, marketingPlan)}
                        label={
                          !gameFeaturings ? (
                            <Trans>Loading...</Trans>
                          ) : activeFeaturing ? (
                            activeFeaturing.featuring ===
                            'games-platform-home' ? (
                              <Trans>Extend</Trans>
                            ) : (
                              <Trans>Activated</Trans>
                            )
                          ) : (
                            <Trans>Purchase</Trans>
                          )
                        }
                        fullWidth
                        disabled={!gameFeaturings}
                      />
                    </ColumnStackLayout>
                  </div>
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
