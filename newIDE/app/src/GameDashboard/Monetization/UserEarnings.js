// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';

import { LineStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Column, Line, Spacer } from '../../UI/Grid';
import Card from '../../UI/Card';
import BackgroundText from '../../UI/BackgroundText';
import Link from '../../UI/Link';
import Window from '../../Utils/Window';
import RaisedButton from '../../UI/RaisedButton';
import Coin from '../../Credits/Icons/Coin';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import PlaceholderError from '../../UI/PlaceholderError';
import Bank from '../../UI/CustomSvgIcons/Bank';
import { Tooltip } from '@material-ui/core';
import CreditOutDialog from './CashOutDialog';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';

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
  hideTitle?: boolean,
  margin?: 'dense',
|};

const UserEarnings = ({ hideTitle, margin }: Props) => {
  const { userEarningsBalance, onRefreshEarningsBalance } = React.useContext(
    AuthenticatedUserContext
  );
  const theme = React.useContext(GDevelopThemeContext);

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

  const canCashout =
    userEarningsBalance &&
    earningsInMilliUsd >= userEarningsBalance.minAmountToCashoutInMilliUSDs;

  const content = (
    <ResponsiveLineStackLayout
      expand
      justifyContent={hideTitle ? 'stretch' : 'space-between'}
      alignItems="center"
    >
      {!hideTitle && (
        <Line>
          <Column>
            <Text size="section-title">
              <Trans>Total earnings</Trans>
            </Text>
            <BackgroundText>
              <Link
                href="https://wiki.gdevelop.io/gdevelop5/monetization/"
                onClick={() =>
                  Window.openExternalURL(
                    'https://wiki.gdevelop.io/gdevelop5/monetization/'
                  )
                }
              >
                Learn about revenue on gd.games
              </Link>
            </BackgroundText>
          </Column>
        </Line>
      )}
      {error && (
        <LineStackLayout noMargin alignItems="center">
          <PlaceholderError onRetry={onRefreshEarningsBalance}>
            <Trans>
              Can't load the total earnings. Verify your internet connection or
              try again later.
            </Trans>
          </PlaceholderError>
        </LineStackLayout>
      )}
      {!error && (
        <LineStackLayout
          noMargin
          alignItems="center"
          justifyContent={hideTitle ? 'center' : 'flex-end'}
          expand
        >
          <ResponsiveLineStackLayout alignItems="center">
            <Column noMargin>
              <Text
                size={margin === 'dense' ? 'body' : 'section-title'}
                align="center"
                noMargin={margin === 'dense'}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {(earningsInMilliUsd / 1000).toFixed(2)}
              </Text>
              <BackgroundText>USD</BackgroundText>
            </Column>
            <Spacer />
            <Tooltip
              title={
                !!userEarningsBalance && !canCashout ? (
                  <Trans>
                    Collect at least{' '}
                    {userEarningsBalance.minAmountToCashoutInMilliUSDs / 1000}{' '}
                    USD to cash out your earnings
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
                  icon={<Bank fontSize="small" />}
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
          <ResponsiveLineStackLayout alignItems="center">
            <Column noMargin>
              <Text
                size={margin === 'dense' ? 'body' : 'section-title'}
                align="center"
                noMargin={margin === 'dense'}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {earningsInCredits.toFixed(0)}
              </Text>
              <BackgroundText>Credits</BackgroundText>
            </Column>
            <Spacer />

            <RaisedButton
              icon={<Coin fontSize="small" />}
              primary
              disabled={earningsInCredits === 0}
              label={<Trans>Credit out</Trans>}
              onClick={() => {
                setSelectedCashOutType('credits');
              }}
            />
          </ResponsiveLineStackLayout>
        </LineStackLayout>
      )}
    </ResponsiveLineStackLayout>
  );

  return (
    <>
      <Line noMargin>
        <Column noMargin expand>
          {margin === 'dense' ? (
            content
          ) : (
            <Card background="medium">{content}</Card>
          )}
        </Column>
      </Line>
      {selectedCashOutType && userEarningsBalance && (
        <CreditOutDialog
          userEarningsBalance={userEarningsBalance}
          onClose={() => setSelectedCashOutType(null)}
          onSuccess={onRefreshEarningsBalance}
          type={selectedCashOutType}
        />
      )}
    </>
  );
};

export default UserEarnings;
