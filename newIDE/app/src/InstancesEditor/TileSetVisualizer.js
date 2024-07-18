// @flow

import * as React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Column, Line } from '../UI/Grid';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import ResourcesLoader from '../ResourcesLoader';
import Erase from '../UI/CustomSvgIcons/Erase';
import Brush from '../UI/CustomSvgIcons/Brush';
import IconButton from '../UI/IconButton';
import { LineStackLayout } from '../UI/Layout';
import FlipHorizontal from '../UI/CustomSvgIcons/FlipHorizontal';
import FlipVertical from '../UI/CustomSvgIcons/FlipVertical';
import useForceUpdate from '../Utils/UseForceUpdate';

const styles = {
  tileContainer: { flex: 1, position: 'relative', display: 'flex' },
  atlasImage: { flex: 1, imageRendering: 'pixelated' },
  icon: { fontSize: 18 },
};

/**
 * Returns the tile id in a tile set.
 * This id corresponds to the index of the tile if the tile set
 * is flattened so that each column is put right after the previous one.
 * Example:
 *   1 | 4 | 7
 *   2 | 5 | 8
 *   3 | 6 | 9
 * @param argument Object that contains x the horizontal position of the tile, y the vertical position and rowCount the number of rows in the tile set.
 * @returns the id of the tile.
 */
export const getTileIdFromGridCoordinates = ({
  x,
  y,
  rowCount,
}: {|
  x: number,
  y: number,
  rowCount: number,
|}): number => x * rowCount + y;

/**
 * Returns the coordinates of a tile in a tile set given its id.
 * This id corresponds to the index of the tile if the tile set
 * is flattened so that each column is put right after the previous one.
 * Example:
 *   1 | 4 | 7
 *   2 | 5 | 8
 *   3 | 6 | 9
 * @param argument Object that contains id the id of the tile and rowCount the number of rows in the tile set.
 * @returns the id of the tile.
 */
export const getGridCoordinatesFromTileId = ({
  id,
  rowCount,
}: {|
  id: number,
  rowCount: number,
|}): {| x: number, y: number |} => {
  const y = id % rowCount;
  const x = (id - y) / rowCount;
  return { x, y };
};

const useStylesForTile = (highlighted: boolean) =>
  makeStyles(theme =>
    createStyles({
      tile: {
        position: 'absolute',
        boxSizing: 'border-box',
        border: highlighted ? '2px solid red' : undefined,
        '&:hover': {
          border: highlighted ? '2px solid pink' : '1px solid white',
        },
      },
    })
  )();

const getTileset = (objectConfiguration: gdObjectConfiguration) => {
  const columnCount = parseFloat(
    objectConfiguration
      .getProperties()
      .get('columnCount')
      .getValue()
  );
  const rowCount = parseFloat(
    objectConfiguration
      .getProperties()
      .get('rowCount')
      .getValue()
  );
  return { rowCount, columnCount };
};

type TileProps = {|
  x: number,
  y: number,
  size: number,
  highlighted?: boolean,
  title?: string,
|};

const Tile = ({ x, y, size, highlighted, title }: TileProps) => {
  const classes = useStylesForTile(!!highlighted);
  return (
    <div
      className={classes.tile}
      style={{
        left: x * size,
        top: y * size,
        width: size,
        height: size,
      }}
      // TODO: find a way to display title on mobile.
      title={title}
    />
  );
};

type TileMapCoordinates = {| x: number, y: number |};

export type TileMapTileSelection =
  | {|
      kind: 'single',
      coordinates: TileMapCoordinates,
      flipHorizontally: boolean,
      flipVertically: boolean,
    |}
  | {|
      kind: 'multiple',
      coordinates: TileMapCoordinates[],
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
  showPaintingToolbar: boolean,
  onAtlasImageLoaded?: (
    e: SyntheticEvent<HTMLImageElement>,
    atlasResourceName: string
  ) => void,
|};

const TileSetVisualizer = ({
  project,
  objectConfiguration,
  tileMapTileSelection,
  onSelectTileMapTile,
  allowMultipleSelection,
  showPaintingToolbar,
  onAtlasImageLoaded,
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
    lastSelectedTile,
    setLastSelectedTile,
  ] = React.useState<?TileMapCoordinates>(null);
  const tileContainerRef = React.useRef<?HTMLDivElement>(null);
  const { columnCount, rowCount } = getTileset(objectConfiguration);
  const [clickStartCoordinates, setClickStartCoordinates] = React.useState<?{|
    x: number,
    y: number,
  |}>(null);

  const [hoveredTile, setHoveredTile] = React.useState<?{
    x: number,
    y: number,
  }>(null);

  const imageWidth = tileContainerRef.current
    ? parseFloat(
        getComputedStyle(tileContainerRef.current).width.replace('px', '')
      )
    : 0;
  const displayedTileSize = imageWidth ? imageWidth / columnCount : null;

  React.useEffect(
    () => {
      forceUpdate();
    },
    // Force update component after first mount to make sure displayedTileSize
    // can be computed after ref has been set.
    [forceUpdate]
  );

  const onPointerDown = React.useCallback((event: PointerEvent) => {
    if (!(event.currentTarget instanceof HTMLDivElement)) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - bounds.left + 1;
    const mouseY = event.clientY - bounds.top + 1;

    setClickStartCoordinates({ x: mouseX, y: mouseY });
  }, []);

  const onPointerUp = React.useCallback(
    (event: MouseEvent) => {
      try {
        if (
          !(event.currentTarget instanceof HTMLDivElement) ||
          !displayedTileSize
        ) {
          return;
        }
        const bounds = event.currentTarget.getBoundingClientRect();

        const mouseX = event.clientX - bounds.left + 1;
        const mouseY = event.clientY - bounds.top + 1;
        const x = Math.min(
          Math.floor(mouseX / displayedTileSize),
          columnCount - 1
        );
        const y = Math.min(
          Math.floor(mouseY / displayedTileSize),
          rowCount - 1
        );
        if (!allowMultipleSelection) {
          if (
            tileMapTileSelection &&
            tileMapTileSelection.kind === 'single' &&
            tileMapTileSelection.coordinates.x === x &&
            tileMapTileSelection.coordinates.y === y
          ) {
            onSelectTileMapTile(null);
          } else {
            onSelectTileMapTile({
              kind: 'single',
              coordinates: { x, y },
              flipHorizontally: shouldFlipHorizontally,
              flipVertically: shouldFlipVertically,
            });
          }
          return;
        }
        if (!clickStartCoordinates) return;

        const startX = Math.min(
          Math.floor(clickStartCoordinates.x / displayedTileSize),
          columnCount - 1
        );
        const startY = Math.min(
          Math.floor(clickStartCoordinates.y / displayedTileSize),
          rowCount - 1
        );
        const newSelection =
          tileMapTileSelection && tileMapTileSelection.kind === 'multiple'
            ? { ...tileMapTileSelection }
            : { kind: 'multiple', coordinates: [] };
        if (startX === x && startY === y) {
          // Click on a tile.
          const isAlreadySelected =
            tileMapTileSelection &&
            tileMapTileSelection.kind === 'multiple' &&
            tileMapTileSelection.coordinates.some(
              coordinates => coordinates.x === x && coordinates.y === y
            );
          if (!isAlreadySelected) {
            newSelection.coordinates.push({ x, y });
          } else {
            const index = newSelection.coordinates.findIndex(
              coordinates => coordinates.x === x && coordinates.y === y
            );
            if (index > -1) {
              newSelection.coordinates.splice(index, 1);
            }
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
              const isAlreadySelected =
                newSelection &&
                newSelection.kind === 'multiple' &&
                newSelection.coordinates.some(
                  coordinates =>
                    coordinates.x === columnIndex && coordinates.y === rowIndex
                );
              if (!isAlreadySelected) {
                newSelection.coordinates.push({
                  x: columnIndex,
                  y: rowIndex,
                });
              } else {
                const index = newSelection.coordinates.findIndex(
                  coordinates =>
                    coordinates.x === columnIndex && coordinates.y === rowIndex
                );
                if (index > -1) {
                  newSelection.coordinates.splice(index, 1);
                }
              }
            }
          }
        }
        onSelectTileMapTile(newSelection);
      } finally {
        setClickStartCoordinates(null);
      }
    },
    [
      displayedTileSize,
      columnCount,
      rowCount,
      tileMapTileSelection,
      onSelectTileMapTile,
      shouldFlipHorizontally,
      shouldFlipVertically,
      allowMultipleSelection,
      clickStartCoordinates,
    ]
  );

  React.useEffect(
    () => {
      // On dismount, remove tile map selection.
      return () => onSelectTileMapTile(null);
    },
    [onSelectTileMapTile]
  );

  React.useEffect(
    () => {
      if (tileMapTileSelection && tileMapTileSelection.kind === 'single') {
        setLastSelectedTile({
          x: tileMapTileSelection.coordinates.x,
          y: tileMapTileSelection.coordinates.y,
        });
      }
    },
    [tileMapTileSelection]
  );

  const onHoverAtlas = React.useCallback(
    (event: MouseEvent) => {
      if (
        !(event.currentTarget instanceof HTMLDivElement) ||
        !displayedTileSize
      ) {
        return;
      }
      const bounds = event.currentTarget.getBoundingClientRect();

      const mouseX = event.clientX - bounds.left + 1;
      const mouseY = event.clientY - bounds.top + 1;
      const x = Math.min(
        Math.floor(mouseX / displayedTileSize),
        columnCount - 1
      );
      const y = Math.min(Math.floor(mouseY / displayedTileSize), rowCount - 1);
      setHoveredTile({ x, y });
    },
    [displayedTileSize, columnCount, rowCount]
  );

  return (
    <Column noMargin>
      {showPaintingToolbar && (
        <LineStackLayout alignItems="center">
          <IconButton
            size="small"
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
          <IconButton
            size="small"
            selected={
              !!tileMapTileSelection && tileMapTileSelection.kind === 'single'
            }
            onClick={e => {
              if (
                !!tileMapTileSelection &&
                tileMapTileSelection.kind === 'single'
              )
                onSelectTileMapTile(null);
              else
                onSelectTileMapTile({
                  kind: 'single',
                  coordinates: lastSelectedTile || { x: 0, y: 0 },
                  flipHorizontally: shouldFlipHorizontally,
                  flipVertically: shouldFlipVertically,
                });
            }}
          >
            <Brush style={styles.icon} />
          </IconButton>
          <IconButton
            size="small"
            selected={shouldFlipHorizontally}
            onClick={e => {
              const newShouldFlipHorizontally = !shouldFlipHorizontally;
              setShouldFlipHorizontally(newShouldFlipHorizontally);
              if (
                !!tileMapTileSelection &&
                tileMapTileSelection.kind === 'single'
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
            size="small"
            selected={shouldFlipVertically}
            onClick={e => {
              const newShouldFlipVertically = !shouldFlipVertically;
              setShouldFlipVertically(newShouldFlipVertically);
              if (
                !!tileMapTileSelection &&
                tileMapTileSelection.kind === 'single'
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
      )}
      <Line justifyContent="stretch">
        {atlasResourceName && (
          <div
            style={styles.tileContainer}
            ref={tileContainerRef}
            onMouseMove={onHoverAtlas}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <CorsAwareImage
              style={styles.atlasImage}
              alt={atlasResourceName}
              src={ResourcesLoader.getResourceFullUrl(
                project,
                atlasResourceName,
                {}
              )}
              onLoad={e => {
                if (onAtlasImageLoaded)
                  onAtlasImageLoaded(e, atlasResourceName);
              }}
            />

            {hoveredTile && displayedTileSize && (
              <Tile
                key={`hovered-tile`}
                size={displayedTileSize}
                x={hoveredTile.x}
                y={hoveredTile.y}
                title={getTileIdFromGridCoordinates({
                  x: hoveredTile.x,
                  y: hoveredTile.y,
                  rowCount,
                }).toString()}
              />
            )}
            {tileMapTileSelection &&
              tileMapTileSelection.kind === 'single' &&
              displayedTileSize && (
                <Tile
                  key={`selected-tile`}
                  highlighted
                  size={displayedTileSize}
                  x={tileMapTileSelection.coordinates.x}
                  y={tileMapTileSelection.coordinates.y}
                  title={getTileIdFromGridCoordinates({
                    x: tileMapTileSelection.coordinates.x,
                    y: tileMapTileSelection.coordinates.y,
                    rowCount,
                  }).toString()}
                />
              )}
            {tileMapTileSelection &&
              tileMapTileSelection.kind === 'multiple' &&
              displayedTileSize &&
              tileMapTileSelection.coordinates.map(coordinates => {
                const id = getTileIdFromGridCoordinates({
                  x: coordinates.x,
                  y: coordinates.y,
                  rowCount,
                });
                return (
                  <Tile
                    key={`selected-tile-${id}`}
                    highlighted
                    size={displayedTileSize}
                    x={coordinates.x}
                    y={coordinates.y}
                    title={id.toString()}
                  />
                );
              })}
          </div>
        )}
      </Line>
    </Column>
  );
};

export default TileSetVisualizer;
