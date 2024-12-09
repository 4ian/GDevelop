// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import {
  type Game,
  type MarketingPlan,
  type GameFeaturing,
  buyGameFeaturing,
} from '../Utils/GDevelopServices/Game';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import {
  getMarketingPlanPrice,
  isMarketingPlanActive,
} from './MarketingPlanUtils';
import { t, Trans } from '@lingui/macro';
import { CreditsPackageStoreContext } from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

type Props = {|
  game: ?Game,
  activeGameFeaturings?: ?(GameFeaturing[]),
  fetchGameFeaturings: () => Promise<void>,
|};

const usePurchaseMarketingPlan = ({
  game,
  activeGameFeaturings,
  fetchGameFeaturings,
}: Props) => {
  const { profile, getAuthorizationHeader, limits } = React.useContext(
    AuthenticatedUserContext
  );
  const { openCreditsPackageDialog, openCreditsUsageDialog } = React.useContext(
    CreditsPackageStoreContext
  );
  const { showAlert } = useAlertDialog();

  const onPurchase = React.useCallback(
    async (i18n: I18nType, marketingPlan: MarketingPlan) => {
      if (!game || !profile || !limits) {
        await showAlert({
          title: t`Select a game`,
          message: t`In order to purchase a marketing boost, log-in and select a game in your dashboard.`,
        });
        return;
      }

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
        message:
          isPlanActive && canExtend ? (
            <Trans>
              You are about to use {planCreditsAmount} credits to extend the
              game featuring {translatedName} for your game {game.gameName} and
              push it to the top of gd.games. Continue?
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
  return { onPurchaseMarketingPlan: onPurchase };
};

export default usePurchaseMarketingPlan;
