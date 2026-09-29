// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import FlatButton from '../FlatButton';
import Text from '../Text';
import Slider from '../Slider';
import RichSelectField, {
  type RichSelectFieldOption,
} from '../RichSelectField';
import EasingPreview from '../EasingPreview';
import PlayIcon from '../CustomSvgIcons/Play';
import { LineStackLayout, ColumnStackLayout } from '../Layout';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import {
  allEasingNames,
  createCubicBezierEasing,
  easingFunctions,
  getEasingValueRange,
  getNamedEasingFunction,
  type CubicBezierPoints,
  type EasingValueRange,
} from '../../Utils/Easings';
import { useAnimatedProgress } from './UseAnimatedProgress';

type Props = {|
  points: CubicBezierPoints,
  // Incremented by the dialog when a handle is released, to play once.
  playToken: number,
|};

const trackInset = 32;
// In seconds.
const minDuration = 0.2;
const rangeSamplesCount = 200;

const prefersReducedMotion = (): boolean => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const referenceOptions: Array<RichSelectFieldOption> = allEasingNames.map(
  (name): RichSelectFieldOption => ({
    value: name,
    label: name,
    adornment: <EasingPreview easingName={name} width={40} height={24} />,
  })
);

/**
 * Position on a track, between 0 (left end) and 1 (right end), of an eased
 * value displayed in the given range.
 */
export const getTrackPosition = (
  value: number,
  range: EasingValueRange
): number => {
  const position = (value - range.min) / (range.max - range.min);
  return Number.isFinite(position) ? Math.min(1, Math.max(0, position)) : 0;
};

const getTrackLeft = (position: number, halfWidth: number): string =>
  `calc(${trackInset}px + (100% - ${trackInset *
    2}px) * ${position} - ${halfWidth}px)`;

const Track = ({
  value,
  range,
  color,
}: {|
  value: number,
  range: EasingValueRange,
  color: string,
|}): React.Node => (
  <div style={styles.track} aria-hidden>
    <div style={styles.trackLine} />
    {[0, 1].map(tickValue => (
      <div
        key={tickValue}
        style={{
          ...styles.tick,
          left: getTrackLeft(
            getTrackPosition(tickValue, range),
            styles.tick.width / 2
          ),
        }}
      />
    ))}
    <div
      style={{
        ...styles.dot,
        backgroundColor: color,
        left: getTrackLeft(
          getTrackPosition(value, range),
          styles.dot.width / 2
        ),
      }}
    />
  </div>
);

const styles = {
  duration: {
    flex: 1,
    minWidth: 100,
  },
  referenceField: {
    width: 200,
    flexShrink: 0,
  },
  trackLabel: {
    width: 200,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  track: {
    position: 'relative',
    flex: 1,
    height: 28,
  },
  trackLine: {
    position: 'absolute',
    left: trackInset,
    right: trackInset,
    top: 13,
    height: 2,
    backgroundColor: 'currentColor',
    opacity: 0.35,
  },
  // Marks the start (0) and end (1) values, so an overshoot is visible.
  tick: {
    position: 'absolute',
    top: 8,
    width: 2,
    height: 12,
    backgroundColor: 'currentColor',
    opacity: 0.6,
  },
  dot: {
    position: 'absolute',
    top: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
};

const CubicBezierAnimatedPreview = ({
  points,
  playToken,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [duration, setDuration] = React.useState(1);
  const [referenceEasingName, setReferenceEasingName] = React.useState(
    'linear'
  );
  const { progress, play } = useAnimatedProgress(
    Math.max(duration, minDuration) * 1000
  );

  const customEasing = React.useMemo(() => createCubicBezierEasing(points), [
    points,
  ]);
  const referenceEasing =
    getNamedEasingFunction(referenceEasingName) || easingFunctions.linear;
  // Shared by both tracks, so that they can be compared.
  const trackRange = React.useMemo(
    () => {
      const customRange = getEasingValueRange(customEasing, rangeSamplesCount);
      const referenceRange = getEasingValueRange(
        referenceEasing,
        rangeSamplesCount
      );
      return {
        min: Math.min(customRange.min, referenceRange.min),
        max: Math.max(customRange.max, referenceRange.max),
      };
    },
    [customEasing, referenceEasing]
  );

  React.useEffect(
    () => {
      if (playToken === 0 || prefersReducedMotion()) return;
      play();
    },
    [playToken, play]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <LineStackLayout alignItems="center" noMargin>
            <FlatButton
              label={<Trans>Play</Trans>}
              onClick={play}
              leftIcon={<PlayIcon />}
              primary
            />
            <Text noMargin>
              <Trans>Duration</Trans>
            </Text>
            <div style={styles.duration}>
              <Slider
                value={duration}
                min={minDuration}
                max={3}
                step={0.1}
                onChange={(value: number) => setDuration(value)}
              />
            </div>
            <Text noMargin>{i18n._(t`${duration.toFixed(1)} s`)}</Text>
          </LineStackLayout>
          <LineStackLayout alignItems="center" noMargin>
            <div style={styles.trackLabel}>
              <Text noMargin>
                <Trans>Custom</Trans>
              </Text>
            </div>
            <Track
              value={customEasing(progress)}
              range={trackRange}
              color={gdevelopTheme.palette.secondary}
            />
          </LineStackLayout>
          <LineStackLayout alignItems="center" noMargin>
            <div style={styles.referenceField}>
              <RichSelectField
                value={referenceEasingName}
                onChange={setReferenceEasingName}
                fullWidth
                margin="dense"
                floatingLabelText={<Trans>Compare to</Trans>}
                options={referenceOptions}
              />
            </div>
            <Track
              value={referenceEasing(progress)}
              range={trackRange}
              color={gdevelopTheme.palette.primary}
            />
          </LineStackLayout>
        </ColumnStackLayout>
      )}
    </I18n>
  );
};

export default CubicBezierAnimatedPreview;
