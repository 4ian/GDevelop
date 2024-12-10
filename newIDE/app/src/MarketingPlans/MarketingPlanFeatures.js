// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import type {
  MarketingPlan,
  GameFeaturing,
} from '../Utils/GDevelopServices/Game';
import { Column, Line } from '../UI/Grid';
import CheckCircle from '../UI/CustomSvgIcons/CheckCircle';
import Text from '../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import {
  getActiveMessage,
  getIconForMarketingPlan,
  getMarketingPlanPrice,
} from './MarketingPlanUtils';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import RaisedButton from '../UI/RaisedButton';

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
  bulletPointText: { flex: 1 },
};

type Props = {|
  marketingPlan: MarketingPlan,
  gameFeaturings: ?(GameFeaturing[]),
  requirementsErrors: React.Node[],
  onPurchase: I18nType => Promise<void>,
  isPlanActive: boolean,
  hideBorder?: boolean,
|};

const MarketingPlanFeatures = ({
  marketingPlan,
  gameFeaturings,
  requirementsErrors,
  onPurchase,
  isPlanActive,
  hideBorder,
}: Props) => {
  const { limits } = React.useContext(AuthenticatedUserContext);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const {
    id,
    nameByLocale,
    canExtend,
    descriptionByLocale,
    bulletPointsByLocale,
    ownedBulletPointsByLocale,
  } = marketingPlan;

  const activeGameFeaturings: GameFeaturing[] = React.useMemo(
    () => {
      if (!gameFeaturings) return [];

      return gameFeaturings.filter(
        gameFeaturing => gameFeaturing.expiresAt > Date.now() / 1000
      );
    },
    [gameFeaturings]
  );

  const planCreditsAmount = limits
    ? getMarketingPlanPrice(marketingPlan, limits)
    : null;
  const hasErrors = requirementsErrors.length > 0;

  const bulletPointsToDisplay = isPlanActive
    ? ownedBulletPointsByLocale
    : bulletPointsByLocale;

  return (
    <I18n>
      {({ i18n }) => (
        <div
          style={{
            ...styles.campaign,
            border: hideBorder
              ? undefined
              : isPlanActive
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
                noMargin
              >
                <LineStackLayout noMargin alignItems="flex-start">
                  {getIconForMarketingPlan(marketingPlan)}
                  <Text size="sub-title">
                    {selectMessageByLocale(i18n, nameByLocale)}
                  </Text>
                </LineStackLayout>
                {planCreditsAmount && (
                  <Text size="body-small" color="secondary">
                    <Trans>{planCreditsAmount} credits</Trans>
                  </Text>
                )}
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
                        <Text style={styles.bulletPointText}>{error}</Text>
                      </Line>
                    </Column>
                  ))
                : bulletPointsToDisplay.map((bulletPointByLocale, index) => (
                    <Column key={index} expand noMargin>
                      <Line noMargin alignItems="center">
                        <CheckCircle
                          style={{
                            ...styles.bulletIcon,
                            ...(isPlanActive
                              ? {
                                  color: gdevelopTheme.message.valid,
                                }
                              : {}),
                          }}
                        />
                        <Text style={styles.bulletPointText}>
                          {selectMessageByLocale(i18n, bulletPointByLocale)}
                        </Text>
                      </Line>
                    </Column>
                  ))}
            </div>

            <Column
              noMargin
              alignItems="flex-start"
              expand
              justifyContent="flex-end"
            >
              <Text size="body-small" noMargin color="secondary" align="left">
                {isPlanActive
                  ? getActiveMessage({
                      marketingPlan,
                      i18n,
                      hasErrors,
                      activeGameFeaturings,
                    })
                  : selectMessageByLocale(i18n, descriptionByLocale)}
              </Text>
            </Column>
            <RaisedButton
              primary={!isPlanActive || canExtend}
              onClick={() => onPurchase(i18n)}
              label={
                !gameFeaturings ? (
                  <Trans>Loading...</Trans>
                ) : isPlanActive ? (
                  canExtend ? (
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
      )}
    </I18n>
  );
};

export default MarketingPlanFeatures;
