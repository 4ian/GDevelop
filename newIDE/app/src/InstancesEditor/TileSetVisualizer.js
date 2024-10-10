// @flow

import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Column, Line, Spacer } from '../UI/Grid';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import ResourcesLoader from '../ResourcesLoader';
import Erase from '../UI/CustomSvgIcons/Erase';
import Brush from '../UI/CustomSvgIcons/Brush';
import IconButton from '../UI/IconButton';
import { LineStackLayout } from '../UI/Layout';
import FlipHorizontal from '../UI/CustomSvgIcons/FlipHorizontal';
import FlipVertical from '../UI/CustomSvgIcons/FlipVertical';
import useForceUpdate from '../Utils/UseForceUpdate';
import { useLongTouch, type ClientCoordinates } from '../Utils/UseLongTouch';
import Text from '../UI/Text';
import EmptyMessage from '../UI/EmptyMessage';
import { isTileSetBadlyConfigured } from '../Utils/TileMap';

const styles = {
  tilesetAndTooltipsContainer: {
    flex: 1,
    display: 'flex',
    position: 'relative',
    width: '100%',
  },
  tilesetContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    overflow: 'auto',
    touchAction: 'none',
  },
  atlasImage: { flex: 1, imageRendering: 'pixelated' },
  icon: { fontSize: 18 },
  tooltipContent: {
    position: 'absolute',
    // Outside of theme.
    background: 'white',
    border: '1px solid black',
    color: 'black',
    padding: '1px 3px',
  },
};

const useStylesForTile = (highlighted: boolean) =>
  makeStyles(theme =>
    createStyles({
      tile: {
        position: 'absolute',
        boxSizing: 'border-box',
        border: highlighted ? '2px solid red' : undefined,
        '&:hover': {
          border: highlighted
            ? '2px solid orange'
            : `1px solid ${theme.palette.type === 'dark' ? 'white' : 'black'}`,
        },
      },
    })
  )();

type TileMapCoordinates = {| x: number, y: number |};

/**
 * Returns the tile id in a tile set.
 * This id corresponds to the index of the tile if the tile set
 * is flattened so that each row is put right after the previous one.
 * Example:
 *   0 | 1 | 2
 *   3 | 4 | 5
 *   6 | 7 | 8
 * @param argument Object that contains x the horizontal position of the tile, y the vertical position and columnCount the number of columns in the tile set.
 * @returns the id of the tile.
 */
export const getTileIdFromGridCoordinates = ({
  x,
  y,
  columnCount,
}: {|
  x: number,
  y: number,
  columnCount: number,
|}): number => y * columnCount + x;

/**
 * Returns the coordinates of a tile in a tile set given its id.
 * This id corresponds to the index of the tile if the tile set
 * is flattened so that each row is put right after the previous one.
 * Example:
 *   0 | 1 | 2
 *   3 | 4 | 5
 *   6 | 7 | 8
 * @param argument Object that contains the id of the tile and columnCount the number of columns in the tile set.
 * @returns the id of the tile.
 */
export const getGridCoordinatesFromTileId = ({
  id,
  columnCount,
}: {|
  id: number,
  columnCount: number,
|}): {| x: number, y: number |} => {
  const x = id % columnCount;
  const y = (id - x) / columnCount;
  return { x, y };
};

const getGridCoordinatesFromPointerCoordinates = ({
  displayedTileSize,
  pointerX,
  pointerY,
  columnCount,
  rowCount,
}: {|
  displayedTileSize: number,
  pointerX: number,
  pointerY: number,
  columnCount: number,
  rowCount: number,
|}): TileMapCoordinates => {
  const x = Math.min(Math.floor(pointerX / displayedTileSize), columnCount - 1);
  const y = Math.min(Math.floor(pointerY / displayedTileSize), rowCount - 1);
  return { x, y };
};

const getImageCoordinatesFromPointerEvent = (
  event: PointerEvent | MouseEvent | ClientCoordinates
) => {
  const divContainer = event.currentTarget;
  if (!(divContainer instanceof HTMLDivElement)) {
    return;
  }

  const bounds = divContainer.getBoundingClientRect();
  const mouseXWithoutScrollLeft = event.clientX - bounds.left + 1;
  const mouseX = mouseXWithoutScrollLeft + divContainer.scrollLeft;
  const mouseY = event.clientY - bounds.top + 1;
  return {
    mouseX,
    mouseY,
    mouseXWithoutScrollLeft,
    parentRightBound: bounds.right,
  };
};

const addOrRemoveCoordinatesInArray = (
  array: TileMapCoordinates[],
  newCoordinates: TileMapCoordinates
) => {
  const indexInArray = array.findIndex(
    coordinates =>
      coordinates.x === newCoordinates.x && coordinates.y === newCoordinates.y
  );
  if (indexInArray === -1) {
    array.push(newCoordinates);
  } else {
    array.splice(indexInArray, 1);
  }
};

type TileProps = {|
  x: number,
  y: number,
  size: number,
  highlighted?: boolean,
  width?: number,
  height?: number,
|};

const Tile = ({
  x,
  y,
  size,
  width = 1,
  height = 1,
  highlighted,
}: TileProps) => {
  const classes = useStylesForTile(!!highlighted);
  return (
    <div
      className={classes.tile}
      style={{
        left: x * size,
        top: y * size,
        width: size * width,
        height: size * height,
      }}
    />
  );
};

export type TileMapTileSelection =
  | {|
      kind: 'multiple',
      coordinates: TileMapCoordinates[],
    |}
  | {|
      kind: 'rectangle',
      coordinates: TileMapCoordinates[],
      flipHorizontally: boolean,
      flipVertically: boolean,
    |}
  | {|
      kind: 'erase',
    |};

type Props = {|
  project: gdProject,
  objectConfiguration: gdObjectConfiguration,
  tileMapTileSelection: ?TileMapTileSelection,
  onSelectTileMapTile: (?TileMapTileSelection) => void,
  allowMultipleSelection: boolean,
  allowRectangleSelection: boolean,
  showPaintingToolbar: boolean,
  interactive: boolean,
  onAtlasImageLoaded?: (
    e: SyntheticEvent<HTMLImageElement>,
    atlasResourceName: string
  ) => void,
  /**
   * Needed to enable scrolling on touch devices when the user is not using
   * a long touch to make a tile selection on the tile set.
   */
  onScrollY: number => void,
|};

const TileSetVisualizer = ({
  project,
  objectConfiguration,
  tileMapTileSelection,
  onSelectTileMapTile,
  allowMultipleSelection,
  allowRectangleSelection,
  showPaintingToolbar,
  interactive,
  onAtlasImageLoaded,
  onScrollY,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const atlasResourceName = objectConfiguration
    .getProperties()
    .get('atlasImage')
    .getValue();
  const [
    shouldFlipVertically,
    setShouldFlipVertically,
  ] = React.useState<boolean>(false);
  const [
    shouldFlipHorizontally,
    setShouldFlipHorizontally,
  ] = React.useState<boolean>(false);
  const [
    lastSelection,
    setLastSelection,
  ] = React.useState<?TileMapTileSelection>(null);
  const tilesetContainerRef = React.useRef<?HTMLDivElement>(null);
  const tilesetAndTooltipContainerRef = React.useRef<?HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = React.useState<?{|
    label: string,
    x: number,
    y: number,
  |}>(null);
  const objectConfigurationProperties = objectConfiguration.getProperties();
  const columnCount = parseFloat(
    objectConfigurationProperties.get('columnCount').getValue()
  );
  const rowCount = parseFloat(
    objectConfigurationProperties.get('rowCount').getValue()
  );
  const tileSize = parseFloat(
    objectConfigurationProperties.get('tileSize').getValue()
  );
  const isBadlyConfigured = isTileSetBadlyConfigured({
    atlasImage: '',
    columnCount,
    rowCount,
    tileSize,
  });
  const startCoordinatesRef = React.useRef<?{|
    x: number,
    y: number,
  |}>(null);
  const isLongTouchRef = React.useRef<boolean>(false);
  const tooltipDisplayTimeoutId = React.useRef<?TimeoutID>(null);
  const [
    rectangularSelectionTilePreview,
    setRectangularSelectionTilePreview,
  ] = React.useState<?{|
    topLeftCoordinates: TileMapCoordinates,
    width: number,
    height: number,
  |}>(null);

  const [hoveredTile, setHoveredTile] = React.useState<?{
    x: number,
    y: number,
  }>(null);
  const imageElement = tilesetContainerRef.current
    ? tilesetContainerRef.current.getElementsByTagName('img')[0]
    : null;
  const imageWidth = imageElement
    ? parseFloat(getComputedStyle(imageElement).width.replace('px', ''))
    : 0;
  const imageNaturalWidth = imageElement ? imageElement.naturalWidth : 1;
  const displayedTileSize =
    imageWidth && imageNaturalWidth
      ? (imageWidth / imageNaturalWidth) * tileSize
      : null;

  const _onAtlasImageLoaded = React.useCallback(
    e => {
      if (onAtlasImageLoaded) onAtlasImageLoaded(e, atlasResourceName);
    },
    [onAtlasImageLoaded, atlasResourceName]
  );

  const displayTileIdTooltip = React.useCallback(
    (e: ClientCoordinates) => {
      if (!displayedTileSize || isBadlyConfigured) return;

      const imageCoordinates = getImageCoordinatesFromPointerEvent(e);
      if (!imageCoordinates) return;

      const { x, y } = getGridCoordinatesFromPointerCoordinates({
        pointerX: imageCoordinates.mouseX,
        pointerY: imageCoordinates.mouseY,
        columnCount,
        rowCount,
        displayedTileSize,
      });
      setTooltipContent({
        x: Math.min(
          imageCoordinates.mouseXWithoutScrollLeft,
          imageCoordinates.parentRightBound - 40
        ),
        y: imageCoordinates.mouseY,
        label: getTileIdFromGridCoordinates({ x, y, columnCount }).toString(),
      });
    },
    [displayedTileSize, columnCount, rowCount, isBadlyConfigured]
  );

  const handleLongTouch = React.useCallback(
    (e: ClientCoordinates) => {
      isLongTouchRef.current = true;
      displayTileIdTooltip(e);
    },
    [displayTileIdTooltip]
  );

  const longTouchProps = useLongTouch(handleLongTouch, {
    doNotCancelOnScroll: true,
  });

  React.useEffect(
    () => {
      forceUpdate();
    },
    // Force update component after first mount to make sure displayedTileSize
    // can be computed after ref has been set.
    [forceUpdate]
  );

  const onPointerDown = React.useCallback(
    (event: PointerEvent) => {
      if (isBadlyConfigured) return;
      const coordinates = getImageCoordinatesFromPointerEvent(event);
      if (!coordinates) return;
      startCoordinatesRef.current = {
        x: coordinates.mouseX,
        y: coordinates.mouseY,
      };
    },
    [isBadlyConfigured]
  );

  const onPointerMove = React.useCallback(
    (event: PointerEvent) => {
      if (
        isBadlyConfigured ||
        !startCoordinatesRef ||
        !displayedTileSize ||
        (!allowMultipleSelection && !allowRectangleSelection)
      ) {
        return;
      }

      const startCoordinates = startCoordinatesRef.current;
      if (!startCoordinates) return;

      const isTouchDevice = event.pointerType === 'touch';

      if (isTouchDevice) {
        // Distinguish between a long touch (to multi select tiles) and a scroll.
        if (!isLongTouchRef.current) {
          const coordinates = getImageCoordinatesFromPointerEvent(event);
          if (!coordinates) return;
          if (tilesetContainerRef.current) {
            const deltaY = -event.movementY;
            const deltaX =
              startCoordinates.x - coordinates.mouseXWithoutScrollLeft;
            tilesetContainerRef.current.scrollLeft = deltaX;
            onScrollY(deltaY);
          }
          return;
        }
      }
      const imageCoordinates = getImageCoordinatesFromPointerEvent(event);
      if (!imageCoordinates) return;

      const { x, y } = getGridCoordinatesFromPointerCoordinates({
        pointerX: imageCoordinates.mouseX,
        pointerY: imageCoordinates.mouseY,
        columnCount,
        rowCount,
        displayedTileSize,
      });

      const { x: startX, y: startY } = getGridCoordinatesFromPointerCoordinates(
        {
          pointerX: startCoordinates.x,
          pointerY: startCoordinates.y,
          columnCount,
          rowCount,
          displayedTileSize,
        }
      );

      setRectangularSelectionTilePreview({
        topLeftCoordinates: {
          x: Math.min(x, startX),
          y: Math.min(y, startY),
        },
        width: Math.abs(x - startX) + 1,
        height: Math.abs(y - startY) + 1,
      });
    },
    [
      isBadlyConfigured,
      displayedTileSize,
      columnCount,
      rowCount,
      allowMultipleSelection,
      allowRectangleSelection,
      onScrollY,
    ]
  );

  const onPointerUp = React.useCallback(
    (event: PointerEvent) => {
      try {
        if (!displayedTileSize || isBadlyConfigured) return;

        const isTouchDevice = event.pointerType === 'touch';
        const startCoordinates = startCoordinatesRef.current;
        if (!startCoordinates) return;

        if (isTouchDevice && !isLongTouchRef.current) {
          return;
        }

        const imageCoordinates = getImageCoordinatesFromPointerEvent(event);
        if (!imageCoordinates) return;

        const { x, y } = getGridCoordinatesFromPointerCoordinates({
          pointerX: imageCoordinates.mouseX,
          pointerY: imageCoordinates.mouseY,
          columnCount,
          rowCount,
          displayedTileSize,
        });
        if (!startCoordinates) return;

        const {
          x: startX,
          y: startY,
        } = getGridCoordinatesFromPointerCoordinates({
          pointerX: startCoordinates.x,
          pointerY: startCoordinates.y,
          columnCount,
          rowCount,
          displayedTileSize,
        });
        if (allowMultipleSelection) {
          const newSelection =
            tileMapTileSelection && tileMapTileSelection.kind === 'multiple'
              ? { ...tileMapTileSelection }
              : { kind: 'multiple', coordinates: [] };
          if (startX === x && startY === y) {
            if (
              tileMapTileSelection &&
              tileMapTileSelection.kind === 'multiple'
            ) {
              addOrRemoveCoordinatesInArray(newSelection.coordinates, {
                x,
                y,
              });
            }
          } else {
            for (
              let columnIndex = Math.min(startX, x);
              columnIndex <= Math.max(startX, x);
              columnIndex++
            ) {
              for (
                let rowIndex = Math.min(startY, y);
                rowIndex <= Math.max(startY, y);
                rowIndex++
              ) {
                if (newSelection && newSelection.kind === 'multiple') {
                  addOrRemoveCoordinatesInArray(newSelection.coordinates, {
                    x: columnIndex,
                    y: rowIndex,
                  });
                }
              }
            }
          }
          onSelectTileMapTile(newSelection);
        } else if (allowRectangleSelection) {
          const shouldRemoveSelection =
            tileMapTileSelection &&
            tileMapTileSelection.kind === 'rectangle' &&
            startX === x &&
            startY === y &&
            x <= tileMapTileSelection.coordinates[1].x &&
            x >= tileMapTileSelection.coordinates[0].x &&
            y <= tileMapTileSelection.coordinates[1].y &&
            y >= tileMapTileSelection.coordinates[0].y;
          if (shouldRemoveSelection) {
            // Remove selection when user selects a single tile in the current tile selection.
            onSelectTileMapTile(null);
          } else {
            const topLeftCorner = {
              x: Math.min(startX, x),
              y: Math.min(startY, y),
            };
            const bottomRightCorner = {
              x: Math.max(startX, x),
              y: Math.max(startY, y),
            };
            const newSelection = {
              kind: 'rectangle',
              coordinates: [topLeftCorner, bottomRightCorner],
              flipHorizontally: shouldFlipHorizontally,
              flipVertically: shouldFlipVertically,
            };
            onSelectTileMapTile(newSelection);
          }
        }
      } finally {
        startCoordinatesRef.current = null;
        setRectangularSelectionTilePreview(null);
        isLongTouchRef.current = false;
      }
    },
    [
      isBadlyConfigured,
      displayedTileSize,
      columnCount,
      rowCount,
      tileMapTileSelection,
      onSelectTileMapTile,
      shouldFlipHorizontally,
      shouldFlipVertically,
      allowMultipleSelection,
      allowRectangleSelection,
    ]
  );

  React.useEffect(
    () => {
      if (tileMapTileSelection && tileMapTileSelection.kind === 'rectangle') {
        setLastSelection(tileMapTileSelection);
      }
    },
    [tileMapTileSelection]
  );

  const onHoverAtlas = React.useCallback(
    (event: MouseEvent) => {
      if (!displayedTileSize) return;

      const imageCoordinates = getImageCoordinatesFromPointerEvent(event);
      if (!imageCoordinates) return;
      const { x, y } = getGridCoordinatesFromPointerCoordinates({
        pointerX: imageCoordinates.mouseX,
        pointerY: imageCoordinates.mouseY,
        columnCount,
        rowCount,
        displayedTileSize,
      });
      setHoveredTile({ x, y });
    },
    [displayedTileSize, columnCount, rowCount]
  );

  const onMouseMove = React.useCallback(
    event => {
      if (!displayedTileSize) return;
      onHoverAtlas(event);
      if (tooltipDisplayTimeoutId.current)
        clearTimeout(tooltipDisplayTimeoutId.current);
      const imageCoordinates = getImageCoordinatesFromPointerEvent(event);

      if (!imageCoordinates) return;

      const { x, y } = getGridCoordinatesFromPointerCoordinates({
        pointerX: imageCoordinates.mouseX,
        pointerY: imageCoordinates.mouseY,
        columnCount,
        rowCount,
        displayedTileSize,
      });

      tooltipDisplayTimeoutId.current = setTimeout(() => {
        setTooltipContent({
          x: Math.min(
            imageCoordinates.mouseXWithoutScrollLeft,
            imageCoordinates.parentRightBound - 40
          ),
          y: imageCoordinates.mouseY,
          label: getTileIdFromGridCoordinates({ x, y, columnCount }).toString(),
        });
      }, 500);
    },
    [onHoverAtlas, rowCount, columnCount, displayedTileSize]
  );
  const onMouseEnter = React.useCallback(
    event => {
      if (!displayedTileSize) return;
      const imageCoordinates = getImageCoordinatesFromPointerEvent(event);

      if (!imageCoordinates) return;
      const { x, y } = getGridCoordinatesFromPointerCoordinates({
        pointerX: imageCoordinates.mouseX,
        pointerY: imageCoordinates.mouseY,
        columnCount,
        rowCount,
        displayedTileSize,
      });

      tooltipDisplayTimeoutId.current = setTimeout(() => {
        setTooltipContent({
          x: imageCoordinates.mouseXWithoutScrollLeft,
          y: imageCoordinates.mouseY,
          label: getTileIdFromGridCoordinates({ x, y, columnCount }).toString(),
        });
      }, 500);
    },
    [rowCount, columnCount, displayedTileSize]
  );

  const onMouseLeave = React.useCallback(() => {
    if (tooltipDisplayTimeoutId.current)
      clearTimeout(tooltipDisplayTimeoutId.current);
    setTooltipContent(null);
  }, []);

  const interactionCallbacks = {
    onPointerDown,
    onPointerUp,
    onPointerMove,
  };

  const isAtlasImageSet = !!atlasResourceName;

  return (
    <Column noMargin>
      {showPaintingToolbar && (
        <>
          <Line justifyContent="space-between" noMargin>
            <LineStackLayout alignItems="center" noMargin>
              <IconButton
                id="paintBrush"
                size="small"
                tooltip={t`Paint`}
                selected={
                  !!tileMapTileSelection &&
                  tileMapTileSelection.kind === 'rectangle'
                }
                onClick={e => {
                  if (
                    !!tileMapTileSelection &&
                    tileMapTileSelection.kind === 'rectangle'
                  )
                    onSelectTileMapTile(null);
                  else
                    onSelectTileMapTile(
                      lastSelection || {
                        kind: 'rectangle',
                        coordinates: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
                        flipHorizontally: shouldFlipHorizontally,
                        flipVertically: shouldFlipVertically,
                      }
                    );
                }}
                disabled={!isAtlasImageSet}
              >
                <Brush style={styles.icon} />
              </IconButton>
              <IconButton
                id="horizontalFlip"
                size="small"
                tooltip={t`Horizontal flip`}
                selected={shouldFlipHorizontally}
                disabled={
                  !tileMapTileSelection || tileMapTileSelection.kind === 'erase'
                }
                onClick={e => {
                  const newShouldFlipHorizontally = !shouldFlipHorizontally;
                  setShouldFlipHorizontally(newShouldFlipHorizontally);
                  if (
                    !!tileMapTileSelection &&
                    tileMapTileSelection.kind === 'rectangle'
                  ) {
                    onSelectTileMapTile({
                      ...tileMapTileSelection,
                      flipHorizontally: newShouldFlipHorizontally,
                    });
                  }
                }}
              >
                <FlipHorizontal style={styles.icon} />
              </IconButton>
              <IconButton
                id="verticalFlip"
                size="small"
                tooltip={t`Vertical flip`}
                selected={shouldFlipVertically}
                disabled={
                  !tileMapTileSelection || tileMapTileSelection.kind === 'erase'
                }
                onClick={e => {
                  const newShouldFlipVertically = !shouldFlipVertically;
                  setShouldFlipVertically(newShouldFlipVertically);
                  if (
                    !!tileMapTileSelection &&
                    tileMapTileSelection.kind === 'rectangle'
                  ) {
                    onSelectTileMapTile({
                      ...tileMapTileSelection,
                      flipVertically: newShouldFlipVertically,
                    });
                  }
                }}
              >
                <FlipVertical style={styles.icon} />
              </IconButton>
            </LineStackLayout>
            <IconButton
              id="eraseBrush"
              size="small"
              tooltip={t`Erase`}
              selected={
                !!tileMapTileSelection && tileMapTileSelection.kind === 'erase'
              }
              onClick={e => {
                if (
                  !!tileMapTileSelection &&
                  tileMapTileSelection.kind === 'erase'
                )
                  onSelectTileMapTile(null);
                else onSelectTileMapTile({ kind: 'erase' });
              }}
            >
              <Erase style={styles.icon} />
            </IconButton>
          </Line>
          <Spacer />
        </>
      )}
      <Line justifyContent="stretch" noMargin>
        {isAtlasImageSet ? (
          <div
            style={styles.tilesetAndTooltipsContainer}
            ref={tilesetAndTooltipContainerRef}
          >
            <div
              style={styles.tilesetContainer}
              ref={tilesetContainerRef}
              {...(interactive ? interactionCallbacks : undefined)}
              {...longTouchProps}
              onMouseMove={onMouseMove}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <CorsAwareImage
                style={styles.atlasImage}
                alt={atlasResourceName}
                src={ResourcesLoader.getResourceFullUrl(
                  project,
                  atlasResourceName,
                  {}
                )}
                onLoad={_onAtlasImageLoaded}
              />

              {interactive && hoveredTile && displayedTileSize && (
                <Tile
                  key={`hovered-tile`}
                  size={displayedTileSize}
                  x={hoveredTile.x}
                  y={hoveredTile.y}
                />
              )}
              {tileMapTileSelection &&
                tileMapTileSelection.kind === 'rectangle' &&
                displayedTileSize && (
                  <Tile
                    key={`selected-tile`}
                    highlighted
                    size={displayedTileSize}
                    x={tileMapTileSelection.coordinates[0].x}
                    y={tileMapTileSelection.coordinates[0].y}
                    width={
                      tileMapTileSelection.coordinates[1].x -
                      tileMapTileSelection.coordinates[0].x +
                      1
                    }
                    height={
                      tileMapTileSelection.coordinates[1].y -
                      tileMapTileSelection.coordinates[0].y +
                      1
                    }
                  />
                )}
              {tileMapTileSelection &&
                tileMapTileSelection.kind === 'multiple' &&
                displayedTileSize &&
                tileMapTileSelection.coordinates.map(coordinates => {
                  const id = getTileIdFromGridCoordinates({
                    x: coordinates.x,
                    y: coordinates.y,
                    columnCount,
                  });
                  return (
                    <Tile
                      key={`selected-tile-${id}`}
                      highlighted
                      size={displayedTileSize}
                      x={coordinates.x}
                      y={coordinates.y}
                    />
                  );
                })}
              {interactive &&
                rectangularSelectionTilePreview &&
                displayedTileSize && (
                  <Tile
                    key={`preview-tile`}
                    highlighted
                    size={displayedTileSize}
                    x={rectangularSelectionTilePreview.topLeftCoordinates.x}
                    y={rectangularSelectionTilePreview.topLeftCoordinates.y}
                    width={rectangularSelectionTilePreview.width}
                    height={rectangularSelectionTilePreview.height}
                  />
                )}
            </div>
            {tooltipContent && (
              <div
                style={{
                  ...styles.tooltipContent,
                  top: tooltipContent.y - 40 - (displayedTileSize || 0) / 5,
                  left: tooltipContent.x - 5,
                }}
              >
                <Text color="inherit" noMargin>
                  {tooltipContent.label}
                </Text>
              </div>
            )}
          </div>
        ) : (
          <EmptyMessage>
            <Trans>No atlas image configured.</Trans>
          </EmptyMessage>
        )}
      </Line>
    </Column>
  );
};

export default TileSetVisualizer;
