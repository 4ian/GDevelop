// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import {
  type MarketingPlan,
  type GameFeaturing,
  type Game,
} from '../Utils/GDevelopServices/Game';
import { Column } from '../UI/Grid';
import Paper from '../UI/Paper';
import Text from '../UI/Text';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import MarketingPlanFeatures from './MarketingPlanFeatures';
import usePurchaseMarketingPlan from './UsePurchaseMarketingPlan';
import {
  getRequirementsErrors,
  isMarketingPlanActive,
} from './MarketingPlanUtils';
import MarketingPlansDialog from './MarketingPlansDialog';
import Link from '../UI/Link';

const styles = {
  container: {
    borderRadius: 8,
    padding: 8,
  },
};

type Props = {|
  game: Game,
  marketingPlan: MarketingPlan,
  gameFeaturings: ?(GameFeaturing[]),
  fetchGameFeaturings: () => Promise<void>,
|};

const MarketingPlanSingleDisplay = ({
  game,
  marketingPlan,
  gameFeaturings,
  fetchGameFeaturings,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const [
    marketingPlansDialogOpen,
    setMarketingPlansDialogOpen,
  ] = React.useState<boolean>(false);
  const activeGameFeaturings: ?(GameFeaturing[]) = React.useMemo(
    () => {
      if (!gameFeaturings) return null;

      return gameFeaturings.filter(
        gameFeaturing => gameFeaturing.expiresAt > Date.now() / 1000
      );
    },
    [gameFeaturings]
  );

  const { onPurchaseMarketingPlan } = usePurchaseMarketingPlan({
    game,
    activeGameFeaturings,
    fetchGameFeaturings,
  });

  const isPlanActive = isMarketingPlanActive(
    marketingPlan,
    activeGameFeaturings
  );

  const requirementsErrors = isPlanActive
    ? getRequirementsErrors(game, marketingPlan)
    : [];

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: gdevelopTheme.credits.backgroundColor,
        color: gdevelopTheme.credits.color,
      }}
    >
      <Column>
        <Text size="block-title" color="inherit">
          <Trans>Get more players on your game</Trans>
        </Text>
        <Paper background="dark">
          <MarketingPlanFeatures
            gameFeaturings={gameFeaturings}
            marketingPlan={marketingPlan}
            onPurchase={i18n => onPurchaseMarketingPlan(i18n, marketingPlan)}
            isPlanActive={isPlanActive}
            requirementsErrors={requirementsErrors}
            hideBorder
          />
        </Paper>
        <Text size="body-small" color="inherit">
          <Trans>
            Make your game visible to the GDevelop community and to the world
            with{' '}
            <Link onClick={() => setMarketingPlansDialogOpen(true)} href="#">
              <Trans>Marketing Boosts</Trans>
            </Link>
            .
          </Trans>
        </Text>
      </Column>
      {marketingPlansDialogOpen && game && (
        <MarketingPlansDialog
          game={game}
          onClose={() => setMarketingPlansDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default MarketingPlanSingleDisplay;
