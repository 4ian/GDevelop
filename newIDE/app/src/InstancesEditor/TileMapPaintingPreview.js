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
import {
  getTileSet,
  getTilesGridCoordinatesFromPointerSceneCoordinates,
  isTileSetBadlyConfigured,
  type TileSet,
} from '../Utils/TileMap';

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

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer | null,
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
  globalObjectsContainer: gdObjectsContainer | null;
  objectsContainer: gdObjectsContainer | null;
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
    globalObjectsContainer,
    objectsContainer,
    getTileMapTileSelection,
    getRendererOfInstance,
    viewPosition,
  }: Props) {
    this.project = project;
    this.globalObjectsContainer = globalObjectsContainer;
    this.objectsContainer = objectsContainer;
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
      this.globalObjectsContainer,
      this.objectsContainer,
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
