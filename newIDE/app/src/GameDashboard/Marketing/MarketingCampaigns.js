// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import {
  buyGameFeaturing,
  type Game,
  type GameUsageType,
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

type MarketingOption = {|
  translatableTitle: MessageDescriptor,
  description: React.Node,
  icon: React.Node,
  bulletPoints: Array<React.Node>,
  creditsAmount: number,
  id: GameUsageType,
|};

const marketingOptions: {
  [key: string]: MarketingOption,
} = {
  basic: {
    id: 'featuring-games-platform',
    translatableTitle: t`Basic`,
    description: (
      <Trans>Perfect to playtest your alpha build and gather information</Trans>
    ),
    icon: <Basic style={styles.iconStyle} />,
    bulletPoints: [
      <Trans>Be featured on gd.games</Trans>,
      <Trans>Get x% more plays</Trans>,
      <Trans>Get y% more feedback</Trans>,
    ],
    creditsAmount: 500,
  },
  pro: {
    id: 'featuring-socials',
    translatableTitle: t`Pro`,
    description: (
      <Trans>
        Perfect if you have a Steam page or similar, and wish to collect both
        feedback and whishlists
      </Trans>
    ),
    icon: <Pro style={styles.iconStyle} />,
    bulletPoints: [
      <Trans>Featured on newsletter</Trans>,
      <Trans>Featured on social media</Trans>,
      <Trans>Up to 1500 clicks to your game site</Trans>,
    ],
    creditsAmount: 1000,
  },
  premium: {
    id: 'featuring-gdevelop',
    translatableTitle: t`Premium`,
    description: (
      <Trans>
        Perfect for people with a finished game who want to promote it to the
        widest audience possible
      </Trans>
    ),
    icon: <Premium style={styles.iconStyle} />,
    bulletPoints: [
      <Trans>Get a banner within GDevelop on desktop and the web editor</Trans>,
      <Trans>Hundreds of thousands of monthly users</Trans>,
    ],
    creditsAmount: 2000,
  },
};

type Props = {|
  game: Game,
  onGameUpdated: (updatedGame: Game) => void,
|};

export const MarketingCampaigns = ({ game, onGameUpdated }: Props) => {
  const { profile, limits, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { showConfirmation, showAlert } = useAlertDialog();

  const onPurchase = React.useCallback(
    async (i18n: I18nType, marketingOption: MarketingOption) => {
      if (!profile || !limits) return;

      const {
        creditsAmount: packCreditsAmount,
        id,
        translatableTitle,
      } = marketingOption;

      const currentCreditsAmount = limits.credits.userBalance.amount;
      if (currentCreditsAmount < packCreditsAmount) {
        await showAlert({
          title: t`Get Featuring`,
          message: t`You do not have enough credits to purchase the ${i18n._(
            translatableTitle
          )} game featuring. You currently have ${currentCreditsAmount} credits.`,
        });
        return;
      }

      const response = await showConfirmation({
        title: t`Get Featuring`,
        message: t`You are about to use ${packCreditsAmount} credits to purchase the game featuring "${i18n._(
          translatableTitle
        )}" for your game ${game.gameName}. Continue?`,
        confirmButtonLabel: t`Purchase featuring`,
      });
      if (!response) return;

      try {
        await buyGameFeaturing(getAuthorizationHeader, {
          gameId: game.id,
          usageType: id,
          userId: profile.id,
        });
      } catch {
        await showAlert({
          title: t`Could not purchase featuring`,
          message: t`An error happened while purchasing the featuring. Verify your internet connection or try again later.`,
        });
        return;
      }
    },
    [game, getAuthorizationHeader, limits, profile, showAlert, showConfirmation]
  );

  if (!profile) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <Text size="sub-title">
            <Trans>Marketing Campaigns</Trans>
          </Text>
          <Text color="secondary" noMargin>
            <Trans>
              Get ready-made packs to make your game visible to the GDevelop
              community.{' '}
              <Link
                href="{TODO}"
                onClick={() => Window.openExternalURL('{TODO}')}
              >
                Read more
              </Link>{' '}
              about how they increase your views.
            </Trans>
          </Text>
          <ResponsiveLineStackLayout>
            {Object.keys(marketingOptions).map(key => {
              const marketingOption = marketingOptions[key];
              const {
                translatableTitle,
                description,
                icon,
                bulletPoints,
                creditsAmount,
              } = marketingOption;
              return (
                <div
                  style={{
                    ...styles.campaign,
                    border: `1px solid ${gdevelopTheme.palette.secondary}`,
                  }}
                  key={key}
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
                          {icon}
                          <Text size="sub-title">
                            {i18n._(translatableTitle)}
                          </Text>
                        </LineStackLayout>
                        <Text size="body-small" color="secondary">
                          <Trans>{creditsAmount} credits</Trans>
                        </Text>
                      </LineStackLayout>
                    </div>

                    <div style={styles.bulletPointsContainer}>
                      {bulletPoints.map((descriptionBullet, index) => (
                        <Column key={index} expand noMargin>
                          <Line noMargin alignItems="center">
                            <CheckCircleFilled style={styles.bulletIcon} />
                            <Text style={{ flex: 1 }}>{descriptionBullet}</Text>
                          </Line>
                        </Column>
                      ))}
                    </div>

                    <Column noMargin alignItems="center" expand>
                      <Text
                        size="body-small"
                        noMargin
                        color="secondary"
                        align="left"
                      >
                        {description}
                      </Text>
                    </Column>
                    <RaisedButton
                      primary
                      onClick={() => onPurchase(i18n, marketingOption)}
                      label={<Trans>Purchase</Trans>}
                      fullWidth
                    />
                  </ColumnStackLayout>
                </div>
              );
            })}
          </ResponsiveLineStackLayout>
        </ColumnStackLayout>
      )}
    </I18n>
  );
};
