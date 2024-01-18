// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import {
  buyGameFeaturing,
  listMarketingPlans,
  listGameFeaturings,
  type Game,
  type MarketingPlan,
  type GameFeaturing,
} from '../../Utils/GDevelopServices/Game';
import Text from '../../UI/Text';
import Link from '../../UI/Link';
import Window from '../../Utils/Window';
import Basic from './Icons/Basic';
import Pro from './Icons/Pro';
import Premium from './Icons/Premium';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { Column, Line } from '../../UI/Grid';
import RaisedButton from '../../UI/RaisedButton';
import CheckCircleFilled from '../../UI/CustomSvgIcons/CheckCircleFilled';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import PlaceholderError from '../../UI/PlaceholderError';
import CircularProgress from '../../UI/CircularProgress';

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
  const {
    profile,
    limits,
    getAuthorizationHeader,
    onRefreshLimits,
  } = React.useContext(AuthenticatedUserContext);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { showConfirmation, showAlert } = useAlertDialog();
  const [marketingPlans, setMarketingPlans] = React.useState<
    MarketingPlan[] | null
  >(null);
  const [marketingPlansError, setMarketingPlansError] = React.useState<?Error>(
    null
  );
  const [gameFeaturings, setGameFeaturings] = React.useState<
    GameFeaturing[] | null
  >(null);
  const [gameFeaturingsError, setGameFeaturingsError] = React.useState<?Error>(
    null
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

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

  const fetchMarketingPlans = React.useCallback(async () => {
    try {
      setMarketingPlansError(null);
      const marketingPlans = await listMarketingPlans();
      setMarketingPlans(marketingPlans);
    } catch (error) {
      console.error('An error occurred while fetching marketing plans.', error);
      setMarketingPlansError(error);
    }
  }, []);

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
        creditsAmount: packCreditsAmount,
        id,
        nameByLocale,
      } = marketingPlan;

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
      if (currentCreditsAmount < packCreditsAmount) {
        await showAlert({
          title: t`Get Featuring`,
          message: t`You do not have enough credits to purchase the ${translatedName} game featuring. You currently have ${currentCreditsAmount} credits.`,
        });
        return;
      }

      const response = await showConfirmation({
        title: activeFeaturing ? t`Extend Featuring` : t`Get Featuring`,
        message: activeFeaturing
          ? t`You are about to use ${packCreditsAmount} credits to extend the game featuring ${translatedName} for your game ${
              game.gameName
            }. Continue?`
          : t`You are about to use ${packCreditsAmount} credits to purchase the game featuring ${translatedName} for your game ${
              game.gameName
            }. Continue?`,
        confirmButtonLabel: activeFeaturing
          ? t`Extend featuring`
          : t`Get featuring`,
      });
      if (!response) return;

      try {
        setIsLoading(true);
        await buyGameFeaturing(getAuthorizationHeader, {
          gameId: game.id,
          usageType: id,
          userId: profile.id,
        });
        // Refresh the game featurings and the credits.
        await fetchGameFeaturings();
        await onRefreshLimits();
        if (marketingPlan.id === 'featuring-basic') {
          showAlert({
            title: t`Featuring purchased 🎉`,
            message: t`Congrats on getting the ${translatedName} featuring for your game ${
              game.gameName
            }! Ensure that your game is public and you have configured a thumbnail for gd.games.`,
          });
        } else {
          showAlert({
            title: t`Featuring purchased 🎉`,
            message: t`Congrats on getting the ${translatedName} featuring for your game ${
              game.gameName
            }. We will get in touch with you to get the campaign up!`,
          });
        }
      } catch {
        await showAlert({
          title: t`Could not purchase featuring`,
          message: t`An error happened while purchasing the featuring. Verify your internet connection or try again later.`,
        });
        return;
      } finally {
        setIsLoading(false);
      }
    },
    [
      game,
      getAuthorizationHeader,
      limits,
      profile,
      showAlert,
      showConfirmation,
      getActiveFeaturing,
      fetchGameFeaturings,
      onRefreshLimits,
    ]
  );

  if (!profile) return null;

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
        ) : !marketingPlans || !gameFeaturings ? (
          <PlaceholderLoader />
        ) : (
          <ColumnStackLayout noMargin>
            <Text size="sub-title">
              <Trans>Marketing Campaigns</Trans>
            </Text>
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
            <ResponsiveLineStackLayout>
              {marketingPlans.map(marketingPlan => {
                const {
                  creditsAmount: packCreditsAmount,
                  id,
                  nameByLocale,
                  descriptionByLocale,
                  bulletPointsByLocale,
                } = marketingPlan;
                const activeFeaturing = getActiveFeaturing(marketingPlan);
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
                            <Trans>{packCreditsAmount} credits</Trans>
                          </Text>
                        </LineStackLayout>
                      </div>

                      <div style={styles.bulletPointsContainer}>
                        {bulletPointsByLocale.map(
                          (bulletPointByLocale, index) => (
                            <Column key={index} expand noMargin>
                              <Line noMargin alignItems="center">
                                <CheckCircleFilled
                                  style={{
                                    ...styles.bulletIcon,
                                    ...(activeFeaturing
                                      ? { color: gdevelopTheme.message.valid }
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
                          {activeFeaturing ? (
                            activeFeaturing.featuring ===
                            'games-platform-home' ? (
                              <Trans>
                                Active until{' '}
                                {i18n.date(activeFeaturing.expiresAt * 1000)}
                              </Trans>
                            ) : (
                              <Trans>
                                Active, we will get in touch to get the campaign
                                up!
                              </Trans>
                            )
                          ) : (
                            selectMessageByLocale(i18n, descriptionByLocale)
                          )}
                        </Text>
                      </Column>
                      <RaisedButton
                        primary={!activeFeaturing}
                        onClick={() => onPurchase(i18n, marketingPlan)}
                        label={
                          isLoading ? (
                            <Column
                              noMargin
                              justifyContent="center"
                              alignItems="center"
                            >
                              <CircularProgress size={20} />
                            </Column>
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
                        disabled={isLoading}
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
