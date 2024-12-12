// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';

import { LineStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Spacer } from '../../UI/Grid';
import BackgroundText from '../../UI/BackgroundText';
import Link from '../../UI/Link';
import Window from '../../Utils/Window';
import RaisedButton from '../../UI/RaisedButton';
import Coin from '../../Credits/Icons/Coin';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import PlaceholderError from '../../UI/PlaceholderError';
import { Tooltip } from '@material-ui/core';
import CreditOutDialog from './CashOutDialog';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import DashboardWidget from '../Widgets/DashboardWidget';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';

const styles = {
  separator: {
    height: 50,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
};

type Props = {|
  fullWidth?: boolean,
|};

const UserEarningsWidget = ({ fullWidth }: Props) => {
  const {
    userEarningsBalance,
    onRefreshEarningsBalance,
    onRefreshLimits,
  } = React.useContext(AuthenticatedUserContext);
  const theme = React.useContext(GDevelopThemeContext);
  const { isMobile } = useResponsiveWindowSize();

  const [earningsInMilliUsd, setEarningsInMilliUsd] = React.useState(0);
  const [earningsInCredits, setEarningsInCredits] = React.useState(0);
  const [error, setError] = React.useState(null);
  const intervalValuesUpdate = React.useRef(null);

  const [selectedCashOutType, setSelectedCashOutType] = React.useState<
    ?'cash' | 'credits'
  >(null);

  const fetchUserEarningsBalance = React.useCallback(
    async () => {
      if (!userEarningsBalance) return;

      try {
        // Create an animation to show the earnings increasing.
        const targetMilliUsd = userEarningsBalance.amountInMilliUSDs;
        const targetCredits = userEarningsBalance.amountInCredits;

        const duration = 500;
        const steps = 30;
        const intervalTime = duration / steps;

        const milliUsdIncrement = (targetMilliUsd - earningsInMilliUsd) / steps;
        const creditsIncrement = (targetCredits - earningsInCredits) / steps;

        let currentMilliUsd = earningsInMilliUsd;
        let currentCredits = earningsInCredits;
        let step = 0;

        intervalValuesUpdate.current = setInterval(() => {
          step++;
          currentMilliUsd += milliUsdIncrement;
          currentCredits += creditsIncrement;

          setEarningsInMilliUsd(currentMilliUsd);
          setEarningsInCredits(currentCredits);

          if (step >= steps) {
            clearInterval(intervalValuesUpdate.current);
            // Ensure final values are exactly the target values
            setEarningsInMilliUsd(targetMilliUsd);
            setEarningsInCredits(targetCredits);
          }
        }, intervalTime);
      } catch (error) {
        console.error('Unable to get user earnings balance:', error);
        setError(error);
      }
    },
    [userEarningsBalance, earningsInMilliUsd, earningsInCredits]
  );

  React.useEffect(
    () => {
      fetchUserEarningsBalance();
    },
    // Fetch the earnings once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  React.useEffect(
    () => () => {
      // Cleanup the interval when the component is unmounted.
      if (intervalValuesUpdate.current) {
        clearInterval(intervalValuesUpdate.current);
      }
    },
    []
  );

  const onCashOrCreditOut = React.useCallback(
    async () => {
      await onRefreshEarningsBalance();
      await onRefreshLimits();
    },
    [onRefreshEarningsBalance, onRefreshLimits]
  );

  const canCashout =
    userEarningsBalance &&
    earningsInMilliUsd >= userEarningsBalance.minAmountToCashoutInMilliUSDs;

  const content = error ? (
    <LineStackLayout noMargin alignItems="center">
      <PlaceholderError onRetry={onRefreshEarningsBalance}>
        <Trans>
          Can't load the total earnings. Verify your internet connection or try
          again later.
        </Trans>
      </PlaceholderError>
    </LineStackLayout>
  ) : (
    <ResponsiveLineStackLayout
      noMargin
      alignItems="center"
      justifyContent="space-between"
      expand
    >
      <BackgroundText align={isMobile ? 'center' : 'left'}>
        <Link
          href="https://wiki.gdevelop.io/gdevelop5/monetization/"
          onClick={() =>
            Window.openExternalURL(
              'https://wiki.gdevelop.io/gdevelop5/monetization/'
            )
          }
        >
          <Trans>Learn about revenue on gd.games</Trans>
        </Link>
      </BackgroundText>
      <LineStackLayout noMargin alignItems="center">
        <ResponsiveLineStackLayout alignItems="center" noMargin>
          <LineStackLayout noMargin alignItems="center" justifyContent="center">
            <BackgroundText>USD</BackgroundText>
            <Text
              size="sub-title"
              align="center"
              noMargin
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {(earningsInMilliUsd / 1000).toFixed(2)}
            </Text>
          </LineStackLayout>
          <Spacer />
          <Tooltip
            title={
              !!userEarningsBalance && !canCashout ? (
                <Trans>
                  Collect at least{' '}
                  {userEarningsBalance.minAmountToCashoutInMilliUSDs / 1000} USD
                  to cash out your earnings
                </Trans>
              ) : (
                ''
              )
            }
          >
            {/* Button must be wrapped in a container so that the parent tooltip
                  can display even if the button is disabled. */}
            <div style={styles.buttonContainer}>
              <RaisedButton
                disabled={!canCashout}
                primary
                label={<Trans>Cash out</Trans>}
                onClick={() => {
                  setSelectedCashOutType('cash');
                }}
              />
            </div>
          </Tooltip>
        </ResponsiveLineStackLayout>
        <Spacer />
        <div
          style={{
            ...styles.separator,
            border: `1px solid ${theme.home.separator.color}`,
          }}
        />
        <Spacer />
        <ResponsiveLineStackLayout alignItems="center" noMargin>
          <LineStackLayout noMargin alignItems="center" justifyContent="center">
            <Coin fontSize="small" />
            <Text
              size="sub-title"
              align="center"
              noMargin
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {earningsInCredits.toFixed(0)}
            </Text>
          </LineStackLayout>
          <Spacer />
          <RaisedButton
            primary
            disabled={earningsInCredits === 0}
            label={<Trans>Credit out</Trans>}
            onClick={() => {
              setSelectedCashOutType('credits');
            }}
          />
        </ResponsiveLineStackLayout>
      </LineStackLayout>
    </ResponsiveLineStackLayout>
  );

  return (
    <>
      <DashboardWidget
        gridSize={fullWidth ? 3 : 2}
        title={<Trans>Game earnings</Trans>}
        widgetName="earnings"
      >
        {content}
      </DashboardWidget>
      {selectedCashOutType && userEarningsBalance && (
        <CreditOutDialog
          userEarningsBalance={userEarningsBalance}
          onClose={() => setSelectedCashOutType(null)}
          onSuccess={onCashOrCreditOut}
          type={selectedCashOutType}
        />
      )}
    </>
  );
};

export default UserEarningsWidget;