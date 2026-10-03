// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import IconButton from '../IconButton';
import SemiControlledTextField from '../SemiControlledTextField';
import CopyIcon from '../CustomSvgIcons/Copy';
import { ColumnStackLayout } from '../Layout';
import { copyTextToClipboard } from '../../Utils/Clipboard';
import {
  formatCubicBezier,
  parseCubicBezierOrNull,
  roundCubicBezierNumber,
  type CubicBezierPoints,
} from '../../Utils/Easings';
import { clampCurveX } from './CubicBezierCurveEditor';

type CoordinateField = {|
  label: string,
  index: 0 | 1 | 2 | 3,
  isX: boolean,
|};

const coordinateFields: Array<CoordinateField> = [
  { label: 'x1', index: 0, isX: true },
  { label: 'y1', index: 1, isX: false },
  { label: 'x2', index: 2, isX: true },
  { label: 'y2', index: 3, isX: false },
];

const commitOnEnter = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
  if (event.key !== 'Enter' || event.metaKey || event.ctrlKey) return;
  event.preventDefault();
  event.currentTarget.blur();
};

const styles = {
  coordinates: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    columnGap: 8,
  },
  coordinate: {
    minWidth: 0,
  },
};

type Props = {|
  points: CubicBezierPoints,
  // The rejected text of the Value field, shown with an error. Null if valid.
  invalidValueText: string | null,
  onChangePoints: (points: CubicBezierPoints) => void,
  onInvalidValue: (text: string) => void,
|};

/**
 * The four coordinates and the `cubic-bezier(...)` value of a curve.
 * A coordinate that is not a number is reverted when the field is blurred.
 */
const CubicBezierValueFields = ({
  points,
  invalidValueText,
  onChangePoints,
  onInvalidValue,
}: Props): React.Node => {
  const commitCoordinate = (field: CoordinateField, text: string) => {
    if (text.trim() === '') return;
    const parsed = Number(text);
    if (!Number.isFinite(parsed)) return;
    const rounded = roundCubicBezierNumber(parsed);
    const nextPoints: CubicBezierPoints = [
      points[0],
      points[1],
      points[2],
      points[3],
    ];
    nextPoints[field.index] = field.isX ? clampCurveX(rounded) : rounded;
    onChangePoints(nextPoints);
  };

  const commitValue = (text: string) => {
    const parsed = parseCubicBezierOrNull(text);
    if (parsed) onChangePoints(parsed);
    else onInvalidValue(text);
  };

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <div style={styles.coordinates}>
            {coordinateFields.map(field => (
              <div key={field.label} style={styles.coordinate}>
                <SemiControlledTextField
                  type="number"
                  step={0.01}
                  {...(field.isX ? { min: 0, max: 1 } : {})}
                  fullWidth
                  inputStyle={{ minWidth: 0 }}
                  commitOnBlur
                  margin="dense"
                  floatingLabelText={field.label}
                  value={String(roundCubicBezierNumber(points[field.index]))}
                  onChange={text => commitCoordinate(field, text)}
                  onKeyDown={commitOnEnter}
                />
              </div>
            ))}
          </div>
          <SemiControlledTextField
            fullWidth
            commitOnBlur
            margin="dense"
            floatingLabelText={<Trans>Value</Trans>}
            value={
              invalidValueText !== null
                ? invalidValueText
                : formatCubicBezier(points)
            }
            errorText={
              invalidValueText !== null ? (
                <Trans>
                  Enter a cubic-bezier(x1, y1, x2, y2) value. x1 and x2 must be
                  between 0 and 1.
                </Trans>
              ) : null
            }
            onChange={commitValue}
            onKeyDown={commitOnEnter}
            endAdornment={
              <IconButton
                tooltip={t`Copy`}
                aria-label={i18n._(t`Copy`)}
                onClick={() => copyTextToClipboard(formatCubicBezier(points))}
              >
                <CopyIcon />
              </IconButton>
            }
          />
        </ColumnStackLayout>
      )}
    </I18n>
  );
};

export default CubicBezierValueFields;
