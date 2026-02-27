// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import LinkIcon from '../../UI/CustomSvgIcons/Link';
import UnlinkIcon from '../../UI/CustomSvgIcons/Unlink';
import {
  type GridRect,
  propertiesToGridSelection,
  getEndpointCells,
  handleCellClick,
  gridSelectionToProperties,
} from './AnchorGridMapping';
import styles from './AnchorGrid.module.css';

type Props = {|
  getPropertyValue: (propertyName: string) => string,
  onUpdateProperty: (propertyName: string, value: string) => void,
|};

const gridPositions: Array<{| col: 0 | 1 | 2, row: 0 | 1 | 2 |}> = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 2, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 },
  { col: 0, row: 2 },
  { col: 1, row: 2 },
  { col: 2, row: 2 },
];

const AnchorGrid = ({
  getPropertyValue,
  onUpdateProperty,
}: Props): React.Node => {
  // Read the current anchor properties and convert to grid state
  const leftEdgeAnchor = getPropertyValue('leftEdgeAnchor');
  const rightEdgeAnchor = getPropertyValue('rightEdgeAnchor');
  const topEdgeAnchor = getPropertyValue('topEdgeAnchor');
  const bottomEdgeAnchor = getPropertyValue('bottomEdgeAnchor');

  const gridSelection = propertiesToGridSelection(
    leftEdgeAnchor,
    rightEdgeAnchor,
    topEdgeAnchor,
    bottomEdgeAnchor
  );

  const endpointCells = getEndpointCells(gridSelection.rect);

  // Store the last non-proportional rect so we can restore it when
  // the user toggles proportional mode off.
  const lastNonProportionalRect = React.useRef(gridSelection.rect);
  if (!gridSelection.proportional && gridSelection.rect) {
    lastNonProportionalRect.current = gridSelection.rect;
  }

  const applyGridRect = React.useCallback(
    (rect: GridRect | null, proportional: boolean) => {
      const properties = gridSelectionToProperties(rect, proportional);
      onUpdateProperty('leftEdgeAnchor', properties.leftEdgeAnchor);
      onUpdateProperty('rightEdgeAnchor', properties.rightEdgeAnchor);
      onUpdateProperty('topEdgeAnchor', properties.topEdgeAnchor);
      onUpdateProperty('bottomEdgeAnchor', properties.bottomEdgeAnchor);
    },
    [onUpdateProperty]
  );

  const onCellClick = React.useCallback(
    (col: 0 | 1 | 2, row: 0 | 1 | 2) => {
      // If proportional is on, turn it off and select this cell
      if (gridSelection.proportional) {
        const newRect = { minCol: col, maxCol: col, minRow: row, maxRow: row };
        applyGridRect(newRect, false);
        return;
      }

      const newRect = handleCellClick(gridSelection.rect, col, row);
      applyGridRect(newRect, false);
    },
    [gridSelection, applyGridRect]
  );

  const onToggleProportional = React.useCallback(
    () => {
      if (gridSelection.proportional) {
        // Turn off proportional → restore last non-proportional rect
        applyGridRect(lastNonProportionalRect.current, false);
      } else {
        // Turn on proportional
        applyGridRect(gridSelection.rect, true);
      }
    },
    [gridSelection, applyGridRect]
  );

  const rect = gridSelection.rect;
  const hasRange =
    rect && (rect.minCol !== rect.maxCol || rect.minRow !== rect.maxRow);

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {rect && hasRange && (
          <div
            className={styles.selectionOverlay}
            style={{
              gridColumn: `${rect.minCol + 1} / ${rect.maxCol + 2}`,
              gridRow: `${rect.minRow + 1} / ${rect.maxRow + 2}`,
            }}
          />
        )}
        {gridPositions.map(({ col, row }) => {
          const key = `${col},${row}`;
          const isEndpoint = endpointCells.has(key);
          const isInRange =
            hasRange &&
            rect &&
            col >= rect.minCol &&
            col <= rect.maxCol &&
            row >= rect.minRow &&
            row <= rect.maxRow;
          return (
            <button
              key={key}
              className={`${styles.cell}${
                isEndpoint && !hasRange ? ` ${styles.endpoint}` : ''
              }${isInRange ? ` ${styles.inRange}` : ''}`}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
              }}
              onClick={() => onCellClick(col, row)}
            >
              {isEndpoint && <div className={styles.innerSquare} />}
            </button>
          );
        })}
      </div>
      <div className={styles.linkButton}>
        <Tooltip
          title={
            gridSelection.proportional ? (
              <Trans>Disable proportional resize</Trans>
            ) : (
              <Trans>Enable proportional resize</Trans>
            )
          }
        >
          <button
            className={`${styles.linkToggle}${
              gridSelection.proportional ? ` ${styles.active}` : ''
            }`}
            onClick={onToggleProportional}
          >
            {gridSelection.proportional ? (
              <LinkIcon className={styles.linkIcon} />
            ) : (
              <UnlinkIcon className={styles.linkIcon} />
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default AnchorGrid;
