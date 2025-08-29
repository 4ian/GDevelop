// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../../../UI/Text';
import { Column, Spacer } from '../../../../UI/Grid';
import { LineStackLayout } from '../../../../UI/Layout';

const styles = {
  limitedTimeContainer: {
    display: 'flex',
    backgroundColor: '#F03F18',
    color: 'white',
    borderRadius: 4,
    padding: '8px 0',
  },
};

type Props = {|
  visibleUntil: string,
  hideMinutesAndSeconds?: boolean,
  alignCenter?: boolean,
|};

const ProductLimitedTimeOffer = ({
  visibleUntil,
  hideMinutesAndSeconds,
  alignCenter,
}: Props) => {
  const [timeLeft, setTimeLeft] = React.useState<{|
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
  |}>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(
    () => {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const targetTime = new Date(visibleUntil).getTime();
        const difference = targetTime - now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor(
              (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            ),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    },
    [visibleUntil]
  );

  if (!timeLeft) return null;

  return (
    <div style={styles.limitedTimeContainer}>
      <Column
        justifyContent="center"
        expand
        alignItems={alignCenter ? 'center' : undefined}
      >
        <Text>
          <Trans>Limited time offer:</Trans>
        </Text>
        <LineStackLayout alignItems="center" noMargin>
          <Text noMargin size="block-title">
            {String(timeLeft.days).padStart(2, '0')}
          </Text>
          <Text noMargin>
            <Trans>Days</Trans>
          </Text>
          <Spacer />
          <Text
            noMargin
            size="block-title"
            style={{
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(timeLeft.hours).padStart(2, '0')}
          </Text>
          <Text noMargin>
            <Trans>Hours</Trans>
          </Text>
          {!hideMinutesAndSeconds && (
            <LineStackLayout alignItems="center" noMargin>
              <Spacer />
              <Text
                noMargin
                size="block-title"
                style={{
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {String(timeLeft.minutes).padStart(2, '0')}
              </Text>
              <Text noMargin>
                <Trans>Minutes</Trans>
              </Text>
              <Spacer />
              <Text
                noMargin
                size="block-title"
                style={{
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {String(timeLeft.seconds).padStart(2, '0')}
              </Text>
              <Text noMargin>
                <Trans>Seconds</Trans>
              </Text>
            </LineStackLayout>
          )}
        </LineStackLayout>
      </Column>
    </div>
  );
};

export default ProductLimitedTimeOffer;
