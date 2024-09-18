// @flow

import * as PIXI from 'pixi.js-legacy';
import getObjectByName from '../Utils/GetObjectByName';
import InstancesSelection from './InstancesSelection';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import ViewPosition from './ViewPosition';
import RenderedInstance from '../ObjectsRendering/Renderers/RenderedInstance';
import Rendered3DInstance from '../ObjectsRendering/Renderers/Rendered3DInstance';
import { type TileMapTileSelection } from './TileSetVisualizer';
import { AffineTransformation } from '../Utils/AffineTransformation';

type TileSet = {|
  rowCount: number,
  columnCount: number,
  tileSize: number,
  atlasImage: string,
|};

export const updateSceneToTileMapTransformation = (
  instance: gdInitialInstance,
  renderedInstance: {
    +getEditableTileMap: () => any,
    +getCenterX: () => number,
    +getCenterY: () => number,
  },
  sceneToTileMapTransformation: AffineTransformation,
  tileMapToSceneTransformation: AffineTransformation
): ?{ scaleX: number, scaleY: number } => {
  // TODO: Do not re-calculate if instance angle, position, dimensions and ptr are the same?
  let scaleX = 1,
    scaleY = 1;
  if (instance.hasCustomSize()) {
    const editableTileMap = renderedInstance.getEditableTileMap();
    if (editableTileMap) {
      scaleX = instance.getCustomWidth() / editableTileMap.getWidth();
      scaleY = instance.getCustomHeight() / editableTileMap.getHeight();
    } else {
      console.error(
        `Could not find the editable tile map for instance of object ${instance.getObjectName()}. Make sure the tile map object is correctly configured.`
      );
      // Do not early return on error to make the preview still working to not give
      // a sense of something broken.
    }
  }
  const absScaleX = Math.abs(scaleX);
  const absScaleY = Math.abs(scaleY);

  tileMapToSceneTransformation.setToIdentity();

  // Translation
  tileMapToSceneTransformation.translate(instance.getX(), instance.getY());

  // Rotation
  const angleInRadians = (instance.getAngle() * Math.PI) / 180;
  if (angleInRadians) {
    tileMapToSceneTransformation.rotateAround(
      angleInRadians,
      renderedInstance.getCenterX(),
      renderedInstance.getCenterY()
    );
  }

  // Scale
  tileMapToSceneTransformation.scale(absScaleX, absScaleY);

  sceneToTileMapTransformation.copyFrom(tileMapToSceneTransformation);
  sceneToTileMapTransformation.invert();
  return { scaleX, scaleY };
};

export const getTileSet = (object: gdObject): TileSet => {
  const objectConfigurationProperties = object
    .getConfiguration()
    .getProperties();
  const columnCount = parseFloat(
    objectConfigurationProperties.get('columnCount').getValue()
  );
  const rowCount = parseFloat(
    objectConfigurationProperties.get('rowCount').getValue()
  );
  const tileSize = parseFloat(
    objectConfigurationProperties.get('tileSize').getValue()
  );
  const atlasImage = objectConfigurationProperties.get('atlasImage').getValue();
  return { rowCount, columnCount, tileSize, atlasImage };
};

export const isTileSetBadlyConfigured = ({
  rowCount,
  columnCount,
  tileSize,
  atlasImage,
}: TileSet) => {
  return (
    !Number.isInteger(columnCount) ||
    columnCount <= 0 ||
    !Number.isInteger(rowCount) ||
    rowCount <= 0
  );
};

export const isSelectionASingleTileRectangle = (
  tileMapTileSelection: TileMapTileSelection
): boolean => {
  return (
    tileMapTileSelection.kind === 'rectangle' &&
    tileMapTileSelection.coordinates.length === 2 &&
    tileMapTileSelection.coordinates[0].x ===
      tileMapTileSelection.coordinates[1].x &&
    tileMapTileSelection.coordinates[0].y ===
      tileMapTileSelection.coordinates[1].y
  );
};

type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

const getTileCoordinatesOfCorner = ({
  corner,
  topLeftCorner,
  bottomRightCorner,
}: {|
  corner: Corner,
  topLeftCorner: {| x: number, y: number |},
  bottomRightCorner: {| x: number, y: number |},
|}) => {
  return {
    x: corner.toLowerCase().includes('left')
      ? topLeftCorner.x
      : bottomRightCorner.x,
    y: corner.toLowerCase().includes('top')
      ? topLeftCorner.y
      : bottomRightCorner.y,
  };
};

const getCornerFromFlippingInstructions = ({
  flipHorizontally,
  flipVertically,
}: {|
  flipHorizontally: boolean,
  flipVertically: boolean,
|}): Corner => {
  if (flipHorizontally) {
    return flipVertically ? 'bottomRight' : 'topRight';
  } else {
    return flipVertically ? 'bottomLeft' : 'topLeft';
  }
};

/**
 * Returns the list of tiles corresponding to the user selection.
 * If only one coordinate is present, only one tile is placed at the slot the
 * pointer points to.
 * If two coordinates are present, tiles are displayed to form a rectangle with the
 * two coordinates being the top left and bottom right corner of the rectangle.
 */
export const getTilesGridCoordinatesFromPointerSceneCoordinates = ({
  tileMapTileSelection,
  coordinates,
  tileSize,
  sceneToTileMapTransformation,
}: {|
  tileMapTileSelection: TileMapTileSelection,
  coordinates: Array<{| x: number, y: number |}>,
  tileSize: number,
  sceneToTileMapTransformation: AffineTransformation,
|}): {|
  tileCoordinates?: {| x: number, y: number |},
  erase?: boolean,
  topLeftCorner: {| x: number, y: number |},
  bottomRightCorner: {| x: number, y: number |},
|}[] => {
  if (coordinates.length === 0) return [];

  const tilesCoordinatesInTileMapGrid = [];
  if (coordinates.length === 1) {
    // One coordinate corresponds to the pointer over the canvas.
    const coordinatesInTileMapGrid = [0, 0];
    sceneToTileMapTransformation.transform(
      [coordinates[0].x, coordinates[0].y],
      coordinatesInTileMapGrid
    );
    const x = Math.floor(coordinatesInTileMapGrid[0] / tileSize);
    const y = Math.floor(coordinatesInTileMapGrid[1] / tileSize);
    let tileCoordinates;
    if (tileMapTileSelection.kind === 'rectangle') {
      const topLeftCorner = tileMapTileSelection.coordinates[0];
      const bottomRightCorner = tileMapTileSelection.coordinates[1];
      tileCoordinates = getTileCoordinatesOfCorner({
        topLeftCorner,
        bottomRightCorner,
        corner: getCornerFromFlippingInstructions({
          flipHorizontally: tileMapTileSelection.flipHorizontally,
          flipVertically: tileMapTileSelection.flipVertically,
        }),
      });
    }
    return [
      {
        erase: tileMapTileSelection.kind === 'erase',
        tileCoordinates,
        topLeftCorner: { x, y },
        bottomRightCorner: { x, y },
      },
    ];
  }

  if (coordinates.length === 2) {
    const firstPointCoordinatesInTileMap = [0, 0];
    sceneToTileMapTransformation.transform(
      [coordinates[0].x, coordinates[0].y],
      firstPointCoordinatesInTileMap
    );
    const secondPointCoordinatesInTileMap = [0, 0];
    sceneToTileMapTransformation.transform(
      [coordinates[1].x, coordinates[1].y],
      secondPointCoordinatesInTileMap
    );
    const topLeftCornerCoordinatesInTileMap = [
      Math.min(
        firstPointCoordinatesInTileMap[0],
        secondPointCoordinatesInTileMap[0]
      ),
      Math.min(
        firstPointCoordinatesInTileMap[1],
        secondPointCoordinatesInTileMap[1]
      ),
    ];
    const bottomRightCornerCoordinatesInTileMap = [
      Math.max(
        firstPointCoordinatesInTileMap[0],
        secondPointCoordinatesInTileMap[0]
      ),
      Math.max(
        firstPointCoordinatesInTileMap[1],
        secondPointCoordinatesInTileMap[1]
      ),
    ];
    const topLeftCornerCoordinatesInTileMapGrid = [
      Math.floor(topLeftCornerCoordinatesInTileMap[0] / tileSize),
      Math.floor(topLeftCornerCoordinatesInTileMap[1] / tileSize),
    ];
    const bottomRightCornerCoordinatesInTileMapGrid = [
      Math.floor(bottomRightCornerCoordinatesInTileMap[0] / tileSize),
      Math.floor(bottomRightCornerCoordinatesInTileMap[1] / tileSize),
    ];
    if (tileMapTileSelection.kind === 'erase') {
      tilesCoordinatesInTileMapGrid.push({
        erase: true,
        topLeftCorner: {
          x: topLeftCornerCoordinatesInTileMapGrid[0],
          y: topLeftCornerCoordinatesInTileMapGrid[1],
        },
        bottomRightCorner: {
          x: bottomRightCornerCoordinatesInTileMapGrid[0],
          y: bottomRightCornerCoordinatesInTileMapGrid[1],
        },
      });
    } else if (tileMapTileSelection.kind === 'rectangle') {
      const selectionTopLeftCorner = tileMapTileSelection.coordinates[0];
      const selectionBottomRightCorner = tileMapTileSelection.coordinates[1];

      if (isSelectionASingleTileRectangle(tileMapTileSelection)) {
        const tileCoordinates = getTileCoordinatesOfCorner({
          topLeftCorner: selectionTopLeftCorner,
          bottomRightCorner: selectionBottomRightCorner,
          corner: getCornerFromFlippingInstructions({
            flipHorizontally: tileMapTileSelection.flipHorizontally,
            flipVertically: tileMapTileSelection.flipVertically,
          }),
        });
        tilesCoordinatesInTileMapGrid.push({
          tileCoordinates,
          topLeftCorner: {
            x: topLeftCornerCoordinatesInTileMapGrid[0],
            y: topLeftCornerCoordinatesInTileMapGrid[1],
          },
          bottomRightCorner: {
            x: bottomRightCornerCoordinatesInTileMapGrid[0],
            y: bottomRightCornerCoordinatesInTileMapGrid[1],
          },
        });
        return tilesCoordinatesInTileMapGrid;
      }

      for (
        let x = topLeftCornerCoordinatesInTileMapGrid[0];
        x <= bottomRightCornerCoordinatesInTileMapGrid[0];
        x++
      ) {
        for (
          let y = topLeftCornerCoordinatesInTileMapGrid[1];
          y <= bottomRightCornerCoordinatesInTileMapGrid[1];
          y++
        ) {
          const deltaX = x - topLeftCornerCoordinatesInTileMapGrid[0];
          const deltaY = y - topLeftCornerCoordinatesInTileMapGrid[1];
          const invertedDeltaX =
            bottomRightCornerCoordinatesInTileMapGrid[0] - x;
          const invertedDeltaY =
            bottomRightCornerCoordinatesInTileMapGrid[1] - y;
          if (deltaX === 0 && deltaY === 0) {
            tilesCoordinatesInTileMapGrid.push({
              tileCoordinates: selectionTopLeftCorner,
              topLeftCorner: { x, y },
              bottomRightCorner: { x, y },
            });
            continue;
          }
          if (invertedDeltaX === 0 && invertedDeltaY === 0) {
            tilesCoordinatesInTileMapGrid.push({
              tileCoordinates: selectionBottomRightCorner,
              topLeftCorner: { x, y },
              bottomRightCorner: { x, y },
            });
            continue;
          }

          let tileX, tileY;
          const selectionWidth =
            selectionBottomRightCorner.x - selectionTopLeftCorner.x + 1;
          const selectionHeight =
            selectionBottomRightCorner.y - selectionTopLeftCorner.y + 1;
          if (deltaX === 0) {
            tileX = selectionTopLeftCorner.x;
          } else if (invertedDeltaX === 0) {
            tileX = selectionBottomRightCorner.x;
          } else {
            tileX =
              ((deltaX - 1) % (selectionWidth - 2)) +
              1 +
              selectionTopLeftCorner.x;
          }
          if (deltaY === 0) {
            tileY = selectionTopLeftCorner.y;
          } else if (invertedDeltaY === 0) {
            tileY = selectionBottomRightCorner.y;
          } else {
            tileY =
              ((deltaY - 1) % (selectionHeight - 2)) +
              1 +
              selectionTopLeftCorner.y;
          }

          tilesCoordinatesInTileMapGrid.push({
            tileCoordinates: { x: tileX, y: tileY },
            topLeftCorner: { x, y },
            bottomRightCorner: { x, y },
          });
        }
      }
    }
  }
  return tilesCoordinatesInTileMapGrid;
};

type Props = {|
  project: gdProject,
  layout: gdLayout | null,
  instancesSelection: InstancesSelection,
  getCoordinatesToRender: () => {| x: number, y: number |}[],
  getTileMapTileSelection: () => ?TileMapTileSelection,
  getRendererOfInstance: gdInitialInstance =>
    | RenderedInstance
    | Rendered3DInstance
    | null,
  viewPosition: ViewPosition,
|};

class TileMapPaintingPreview {
  project: gdProject;
  layout: gdLayout | null;
  instancesSelection: InstancesSelection;
  getCoordinatesToRender: () => {| x: number, y: number |}[];
  getTileMapTileSelection: () => ?TileMapTileSelection;
  getRendererOfInstance: gdInitialInstance =>
    | RenderedInstance
    | Rendered3DInstance
    | null;
  toCanvasCoordinates: (x: number, y: number) => [number, number];
  viewPosition: ViewPosition;
  cache: Map<string, PIXI.Texture>;
  sceneToTileMapTransformation: AffineTransformation;
  tileMapToSceneTransformation: AffineTransformation;

  preview: PIXI.Container;

  constructor({
    instancesSelection,
    getCoordinatesToRender,
    project,
    layout,
    getTileMapTileSelection,
    getRendererOfInstance,
    viewPosition,
  }: Props) {
    this.project = project;
    this.layout = layout;
    this.instancesSelection = instancesSelection;
    this.getCoordinatesToRender = getCoordinatesToRender;
    this.getTileMapTileSelection = getTileMapTileSelection;
    this.getRendererOfInstance = getRendererOfInstance;
    this.viewPosition = viewPosition;
    this.preview = new PIXI.Container();
    this.cache = new Map();
    this.sceneToTileMapTransformation = new AffineTransformation();
    this.tileMapToSceneTransformation = new AffineTransformation();
  }

  getPixiObject(): PIXI.Container {
    return this.preview;
  }

  _getTextureInAtlas({
    tileSet,
    x,
    y,
  }: {
    tileSet: TileSet,
    x: number,
    y: number,
  }): ?PIXI.Texture {
    const { atlasImage, tileSize } = tileSet;
    if (!atlasImage) return;
    const cacheKey = `${atlasImage}-${tileSize}-${x}-${y}`;
    const cachedTexture = this.cache.get(cacheKey);
    if (cachedTexture) return cachedTexture;

    const atlasTexture = PixiResourcesLoader.getPIXITexture(
      this.project,
      atlasImage
    );

    const rect = new PIXI.Rectangle(
      x * tileSize,
      y * tileSize,
      tileSize,
      tileSize
    );

    try {
      const texture = new PIXI.Texture(atlasTexture, rect);
      this.cache.set(cacheKey, texture);
    } catch (error) {
      console.error(`Tile could not be extracted from atlas texture:`, error);
      return PixiResourcesLoader.getInvalidPIXITexture();
    }
  }

  _getTilingSpriteForRectangle({
    bottomRightCorner,
    topLeftCorner,
    texture,
    scaleX,
    scaleY,
    flipHorizontally,
    flipVertically,
    tileSize,
    angle,
  }: {|
    bottomRightCorner: {| x: number, y: number |},
    topLeftCorner: {| x: number, y: number |},
    scaleX: number,
    scaleY: number,
    tileSize: number,
    flipHorizontally: boolean,
    flipVertically: boolean,
    angle: number,
    texture: PIXI.Texture,
  |}) {
    const sprite = new PIXI.TilingSprite(texture);
    const workingPoint = [0, 0];

    sprite.tileScale.x =
      (flipHorizontally ? -1 : +1) * this.viewPosition.toCanvasScale(scaleX);
    sprite.tileScale.y =
      (flipVertically ? -1 : +1) * this.viewPosition.toCanvasScale(scaleY);

    this.tileMapToSceneTransformation.transform(
      [topLeftCorner.x * tileSize, topLeftCorner.y * tileSize],
      workingPoint
    );
    const tileSizeInCanvas = this.viewPosition.toCanvasScale(tileSize);

    sprite.x = this.viewPosition.toCanvasScale(workingPoint[0]);
    sprite.y = this.viewPosition.toCanvasScale(workingPoint[1]);
    sprite.width =
      (bottomRightCorner.x - topLeftCorner.x + 1) * tileSizeInCanvas * scaleX;
    sprite.height =
      (bottomRightCorner.y - topLeftCorner.y + 1) * tileSizeInCanvas * scaleY;

    sprite.angle = angle;

    return sprite;
  }

  _getPreviewSprites({
    instance,
    tileSet,
    isBadlyConfigured,
    tileMapTileSelection,
  }: {
    instance: gdInitialInstance,
    tileSet: TileSet,
    isBadlyConfigured: boolean,
    tileMapTileSelection: TileMapTileSelection,
  }): ?PIXI.Container {
    const renderedInstance = this.getRendererOfInstance(instance);
    if (
      !renderedInstance ||
      // $FlowFixMe - TODO: Replace this check with a `instanceof RenderedSimpleTileMapInstance`
      !renderedInstance.getEditableTileMap
    ) {
      console.error(
        `Instance of ${instance.getObjectName()} seems to not be a RenderedSimpleTileMapInstance (method getEditableTileMap does not exist).`
      );
      return null;
    }

    const scales = updateSceneToTileMapTransformation(
      instance,
      // $FlowFixMe
      renderedInstance,
      this.sceneToTileMapTransformation,
      this.tileMapToSceneTransformation
    );
    if (!scales) return null;
    const { scaleX, scaleY } = scales;
    const coordinates = this.getCoordinatesToRender();
    if (coordinates.length === 0) return null;
    const { tileSize } = tileSet;

    const tilesCoordinatesInTileMapGrid = getTilesGridCoordinatesFromPointerSceneCoordinates(
      {
        tileMapTileSelection,
        coordinates,
        tileSize,
        sceneToTileMapTransformation: this.sceneToTileMapTransformation,
      }
    );
    if (tilesCoordinatesInTileMapGrid.length === 0) {
      console.warn("Could't get coordinates to render in tile map grid.");
      return null;
    }
    const container = new PIXI.Container();
    tilesCoordinatesInTileMapGrid.forEach(tilesCoordinates => {
      const {
        bottomRightCorner,
        topLeftCorner,
        tileCoordinates,
      } = tilesCoordinates;
      let texture;
      if (isBadlyConfigured) {
        texture = PixiResourcesLoader.getInvalidPIXITexture();
      } else {
        if (tileMapTileSelection.kind === 'rectangle' && tileCoordinates) {
          texture = this._getTextureInAtlas({
            tileSet,
            ...tileCoordinates,
          });
          if (!texture) return null;
        } else if (tileMapTileSelection.kind === 'erase') {
          texture = PIXI.Texture.from(
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAARSURBVHgBY7h58+Z/BhgAcQA/VAcVLiw46wAAAABJRU5ErkJggg=='
          );
          texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }
      }
      const sprite = this._getTilingSpriteForRectangle({
        bottomRightCorner,
        topLeftCorner,
        texture,
        scaleX,
        scaleY,
        flipHorizontally: tileMapTileSelection.flipHorizontally || false,
        flipVertically: tileMapTileSelection.flipVertically || false,
        tileSize,
        angle: instance.getAngle(),
      });
      container.addChild(sprite);
    });

    return container;
  }

  render() {
    this.preview.removeChildren(0);
    const tileMapTileSelection = this.getTileMapTileSelection();
    if (!tileMapTileSelection) {
      return;
    }
    const selection = this.instancesSelection.getSelectedInstances();
    if (selection.length !== 1) return;
    const instance = selection[0];
    const associatedObjectName = instance.getObjectName();
    const object = getObjectByName(
      this.project.getObjects(),
      this.layout ? this.layout.getObjects() : null,
      associatedObjectName
    );
    if (!object || object.getType() !== 'TileMap::SimpleTileMap') return;
    const tileSet = getTileSet(object);
    const isBadlyConfigured = isTileSetBadlyConfigured(tileSet);

    if (
      isBadlyConfigured ||
      tileMapTileSelection.kind === 'rectangle' ||
      tileMapTileSelection.kind === 'erase'
    ) {
      const container = this._getPreviewSprites({
        instance,
        tileSet,
        tileMapTileSelection,
        isBadlyConfigured,
      });
      if (container) this.preview.addChild(container);
    }

    const canvasCoordinates = this.viewPosition.toCanvasCoordinates(0, 0);
    this.preview.position.x = canvasCoordinates[0];
    this.preview.position.y = canvasCoordinates[1];
  }
}

export default TileMapPaintingPreview;
