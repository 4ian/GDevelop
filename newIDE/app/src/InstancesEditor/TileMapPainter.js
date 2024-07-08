// @flow

import * as React from 'react';
import { Line } from '../UI/Grid';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import ResourcesLoader from '../ResourcesLoader';
import { createStyles, makeStyles } from '@material-ui/core';

const styles = {
  tileContainer: { flex: 1, position: 'relative', display: 'flex' },
  atlasImage: { flex: 1, imageRendering: 'pixelated' },
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
  object,
}: {|
  project: gdProject,
  object: gdObject,
|}): ?{| atlasResourceName: string |} => {
  if (object.getType() !== 'TileMap::SimpleTileMap') {
    return null;
  }
  const atlasResourceName = object
    .getConfiguration()
    .getProperties()
    .get('atlasImage')
    .getValue();
  return {
    atlasResourceName,
  };
};

const getTileset = (object: gdObject) => {
  const columnCount = parseFloat(
    object
      .getConfiguration()
      .getProperties()
      .get('columnCount')
      .getValue()
  );
  const rowCount = parseFloat(
    object
      .getConfiguration()
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
|};

const Tile = ({ x, y, size, highlighted }: TileProps) => {
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
    />
  );
};

type TileMapCoordinates = {| x: number, y: number |};

export type TileMapTileSelection =
  | {|
      single: TileMapCoordinates,
    |}
  | {|
      from: TileMapCoordinates,
      to: TileMapCoordinates,
    |};

type Props = {|
  project: gdProject,
  object: gdObject,
  tileMapTileSelection: ?TileMapTileSelection,
  onSelectTileMapTile: (?TileMapTileSelection) => void,
|};

const TileMapPainter = ({
  project,
  object,
  tileMapTileSelection,
  onSelectTileMapTile,
}: Props) => {
  const atlasResource = getAtlasResource({ project, object });
  const tileContainerRef = React.useRef<?HTMLDivElement>(null);
  const { columnCount, rowCount } = React.useMemo(() => getTileset(object), [
    object,
  ]);
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
      if (
        tileMapTileSelection &&
        tileMapTileSelection.single &&
        tileMapTileSelection.single.x === x &&
        tileMapTileSelection.single.y === y
      ) {
        onSelectTileMapTile(null);
      } else {
        onSelectTileMapTile({ single: { x, y } });
      }
    },
    [
      displayedTileSize,
      columnCount,
      rowCount,
      tileMapTileSelection,
      onSelectTileMapTile,
    ]
  );

  React.useEffect(
    () => {
      return () => onSelectTileMapTile(null);
    },
    [onSelectTileMapTile]
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
            />
          )}
          {tileMapTileSelection &&
            tileMapTileSelection.single &&
            displayedTileSize && (
              <Tile
                key={`selected-tile`}
                highlighted
                size={displayedTileSize}
                x={tileMapTileSelection.single.x}
                y={tileMapTileSelection.single.y}
              />
            )}
        </div>
      )}
    </Line>
  );
};

export default TileMapPainter;
