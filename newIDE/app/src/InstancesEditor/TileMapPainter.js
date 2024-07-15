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

const getAtlasResource = ({
  project,
  objectConfiguration,
}: {|
  project: gdProject,
  objectConfiguration: gdObjectConfiguration,
|}): ?{| atlasResourceName: string |} => {
  const atlasResourceName = objectConfiguration
    .getProperties()
    .get('atlasImage')
    .getValue();
  return {
    atlasResourceName,
  };
};

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
|};

const TileMapPainter = ({
  project,
  objectConfiguration,
  tileMapTileSelection,
  onSelectTileMapTile,
  allowMultipleSelection,
  showPaintingToolbar,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const atlasResource = getAtlasResource({ project, objectConfiguration });
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
  const { columnCount, rowCount } = React.useMemo(
    () => getTileset(objectConfiguration),
    [objectConfiguration]
  );
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

  const onClickAtlas = React.useCallback(
    (event: MouseEvent) => {
      if (
        !(event.currentTarget instanceof HTMLDivElement) ||
        // TODO: not working at first render on swipeable editor display (mobile), might be
        // because tileContainerRef is not defined.
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
      if (allowMultipleSelection) {
        const isAlreadySelected =
          tileMapTileSelection &&
          tileMapTileSelection.kind === 'multiple' &&
          tileMapTileSelection.coordinates.some(
            coordinates => coordinates.x === x && coordinates.y === y
          );
        const newSelection =
          tileMapTileSelection && tileMapTileSelection.kind === 'multiple'
            ? { ...tileMapTileSelection }
            : { kind: 'multiple', coordinates: [] };
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
        onSelectTileMapTile(newSelection);
      } else {
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
    ]
  );

  React.useEffect(
    () => {
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
        {atlasResource && (
          <div
            style={styles.tileContainer}
            ref={tileContainerRef}
            onMouseMove={onHoverAtlas}
            onClick={onClickAtlas}
          >
            <CorsAwareImage
              style={styles.atlasImage}
              alt={atlasResource.atlasResourceName}
              src={ResourcesLoader.getResourceFullUrl(
                project,
                atlasResource.atlasResourceName,
                {}
              )}
            />

            {hoveredTile && displayedTileSize && (
              <Tile
                key={`hovered-tile`}
                size={displayedTileSize}
                x={hoveredTile.x}
                y={hoveredTile.y}
                title={(hoveredTile.x * rowCount + hoveredTile.y).toString()}
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
                  title={(
                    tileMapTileSelection.coordinates.x * rowCount +
                    tileMapTileSelection.coordinates.y
                  ).toString()}
                />
              )}
            {tileMapTileSelection &&
              tileMapTileSelection.kind === 'multiple' &&
              displayedTileSize &&
              tileMapTileSelection.coordinates.map(coordinates => {
                const id = coordinates.x * rowCount + coordinates.y;
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

export default TileMapPainter;
