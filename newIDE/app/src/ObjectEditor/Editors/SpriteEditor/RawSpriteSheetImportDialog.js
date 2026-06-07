// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import FlatButton from '../../../UI/FlatButton';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import AlertMessage from '../../../UI/AlertMessage';
import Text from '../../../UI/Text';
import { Column, Line } from '../../../UI/Grid';

export type RawSpriteSheetImportOptions = {|
  columns: number,
  rows: number,
  frameCount: number,
|};

type Props = {|
  resourceName: string,
  sheetWidth: number,
  sheetHeight: number,
  onApply: RawSpriteSheetImportOptions => void,
  onRequestClose: () => void,
|};

const styles = {
  field: {
    width: 120,
  },
};

const parsePositiveInteger = (value: string): number => {
  const parsedValue = parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
};

const RawSpriteSheetImportDialog = ({
  resourceName,
  sheetWidth,
  sheetHeight,
  onApply,
  onRequestClose,
}: Props): React.Node => {
  const [columnsText, setColumnsText] = React.useState('1');
  const [rowsText, setRowsText] = React.useState('1');
  const [frameCountText, setFrameCountText] = React.useState('1');
  const previousMaxFrameCount = React.useRef(1);

  const columns = parsePositiveInteger(columnsText);
  const rows = parsePositiveInteger(rowsText);
  const frameCount = parsePositiveInteger(frameCountText);
  const hasValidGrid = columns > 0 && rows > 0;
  const maxFrameCount = hasValidGrid ? columns * rows : 0;
  const frameWidth = hasValidGrid ? sheetWidth / columns : 0;
  const frameHeight = hasValidGrid ? sheetHeight / rows : 0;
  const isGridDividingImage =
    hasValidGrid &&
    Number.isInteger(frameWidth) &&
    Number.isInteger(frameHeight);
  const isFrameCountValid = frameCount > 0 && frameCount <= maxFrameCount;
  const canApply = isGridDividingImage && isFrameCountValid;

  React.useEffect(
    () => {
      if (!maxFrameCount) return;

      const lastMaxFrameCount = previousMaxFrameCount.current;
      previousMaxFrameCount.current = maxFrameCount;
      if (frameCount === lastMaxFrameCount || frameCount > maxFrameCount) {
        setFrameCountText(String(maxFrameCount));
      }
    },
    [frameCount, maxFrameCount]
  );

  return (
    <Dialog
      title={<Trans>Import raw sprite sheet</Trans>}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onRequestClose}
        />,
        <DialogPrimaryButton
          key="apply"
          primary
          disabled={!canApply}
          label={<Trans>Add frames</Trans>}
          onClick={() => {
            if (!canApply) return;
            onApply({ columns, rows, frameCount });
          }}
        />,
      ]}
      open
      onRequestClose={onRequestClose}
      maxWidth="sm"
    >
      <Column noMargin>
        <Text size="body-small" color="secondary">
          {resourceName} - {sheetWidth} x {sheetHeight}
        </Text>
        <Line alignItems="center">
          <SemiControlledTextField
            margin="dense"
            type="number"
            min={1}
            step={1}
            style={styles.field}
            floatingLabelText={<Trans>Columns</Trans>}
            value={columnsText}
            onChange={setColumnsText}
            commitOnBlur
          />
          <SemiControlledTextField
            margin="dense"
            type="number"
            min={1}
            step={1}
            style={styles.field}
            floatingLabelText={<Trans>Rows</Trans>}
            value={rowsText}
            onChange={setRowsText}
            commitOnBlur
          />
          <SemiControlledTextField
            margin="dense"
            type="number"
            min={1}
            max={maxFrameCount || undefined}
            step={1}
            style={styles.field}
            floatingLabelText={<Trans>Frames</Trans>}
            value={frameCountText}
            onChange={setFrameCountText}
            commitOnBlur
          />
        </Line>
        {hasValidGrid && isGridDividingImage && (
          <Text size="body-small" color="secondary">
            <Trans>
              Frame size: {frameWidth} x {frameHeight}
            </Trans>
          </Text>
        )}
        {hasValidGrid && !isGridDividingImage && (
          <AlertMessage kind="warning">
            <Trans>
              The columns and rows must divide the image into whole-pixel
              frames.
            </Trans>
          </AlertMessage>
        )}
        {hasValidGrid && !isFrameCountValid && (
          <AlertMessage kind="warning">
            <Trans>
              Frame count must be between 1 and the number of cells in the
              grid.
            </Trans>
          </AlertMessage>
        )}
      </Column>
    </Dialog>
  );
};

export default RawSpriteSheetImportDialog;
