// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../Text';
import EasingPreview from '../EasingPreview';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import { formatCubicBezier, type CubicBezierPoints } from '../../Utils/Easings';
import {
  cssCubicBezierPresets,
  builtInEasingApproximationPresets,
  type CubicBezierPreset,
} from './CubicBezierPresets';

const presetTileSize = 92;
const presetGap = 4;
const maxPresetColumns = 4;
export const presetGridWidth =
  maxPresetColumns * presetTileSize + (maxPresetColumns - 1) * presetGap;

const cubicBezierPresets = [
  ...cssCubicBezierPresets,
  ...builtInEasingApproximationPresets,
];

const samePoints = (
  left: CubicBezierPoints,
  right: CubicBezierPoints
): boolean => left.every((value, index) => value === right[index]);

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, ${presetTileSize}px)`,
    gap: presetGap,
    marginTop: 8,
    overflowY: 'auto',
    flex: 1,
    minHeight: 0,
    maxWidth: presetGridWidth,
  },
  tileLabel: { fontSize: 11, lineHeight: '14px' },
};

type Props = {|
  points: CubicBezierPoints,
  onSelect: (points: CubicBezierPoints) => void,
|};

const CubicBezierPresetGrid = ({ points, onSelect }: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const renderPreset = (preset: CubicBezierPreset) => {
    const selected = samePoints(points, preset.points);
    return (
      <button
        key={preset.name}
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(preset.points)}
        style={{
          font: 'inherit',
          color: gdevelopTheme.text.color.primary,
          backgroundColor: 'transparent',
          border: `1px solid ${
            selected
              ? gdevelopTheme.palette.primary
              : gdevelopTheme.text.color.disabled
          }`,
          borderRadius: 4,
          padding: 4,
          margin: 0,
          width: '100%',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <EasingPreview
          easingName={formatCubicBezier(preset.points)}
          width={40}
          height={24}
        />
        <span style={styles.tileLabel}>{preset.name}</span>
      </button>
    );
  };

  return (
    <>
      <Text noMargin size="body2">
        <Trans>Presets</Trans>
      </Text>
      <div style={styles.grid}>{cubicBezierPresets.map(renderPreset)}</div>
    </>
  );
};

export default CubicBezierPresetGrid;
