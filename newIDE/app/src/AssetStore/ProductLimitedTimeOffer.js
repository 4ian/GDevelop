// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../UI/Text';
import { Column } from '../UI/Grid';

const styles = {
  limitedTimeContainer: {
    display: 'flex',
    backgroundColor: '#F03F18',
    color: 'white',
    borderRadius: 4,
    padding: '8px 0',
  },
  // Wrap the units on narrow screens rather than overflowing the page.
  countdown: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 24,
    rowGap: 4,
  },
  countdownUnit: { display: 'flex', alignItems: 'center', gap: 8 },
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
}: Props): null | React.MixedElement => {
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

  const countdownUnits = [
    { value: timeLeft.days, label: <Trans>Days</Trans> },
    { value: timeLeft.hours, label: <Trans>Hours</Trans> },
    ...(hideMinutesAndSeconds
      ? []
      : [
          { value: timeLeft.minutes, label: <Trans>Minutes</Trans> },
          { value: timeLeft.seconds, label: <Trans>Seconds</Trans> },
        ]),
  ];

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
        <div
          style={{
            ...styles.countdown,
            justifyContent: alignCenter ? 'center' : undefined,
          }}
        >
          {countdownUnits.map(({ value, label }, index) => (
            <div key={index} style={styles.countdownUnit}>
              <Text
                noMargin
                size="block-title"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {String(value).padStart(2, '0')}
              </Text>
              <Text noMargin>{label}</Text>
            </div>
          ))}
        </div>
      </Column>
    </div>
  );
};

export default ProductLimitedTimeOffer;
