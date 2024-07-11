// @flow

import * as PIXI from 'pixi.js-legacy';
import getObjectByName from '../Utils/GetObjectByName';
import InstancesSelection from './InstancesSelection';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import ViewPosition from './ViewPosition';
import RenderedInstance from '../ObjectsRendering/Renderers/RenderedInstance';
import Rendered3DInstance from '../ObjectsRendering/Renderers/Rendered3DInstance';
import { type TileMapTileSelection } from './TileMapPainter';
import { AffineTransformation } from '../Utils/AffineTransformation';

export const updateSceneToTileMapTransformation = (
  instance: gdInitialInstance,
  renderedInstance: RenderedInstance,
  sceneToTileMapTransformation: AffineTransformation,
  tileMapToSceneTransformation: AffineTransformation
): ?{ scaleX: number, scaleY: number } => {
  // TODO: Do not re-calculate if instance angle, position, dimensions and ptr are the same?
  let scaleX = 1,
    scaleY = 1;
  if (instance.hasCustomSize()) {
    const editableTileMap = renderedInstance.getEditableTileMap();
    if (!editableTileMap) {
      console.error(
        `Could not find the editable tile map for instance of object ${instance.getObjectName()}`
      );
      return;
    }
    scaleX = instance.getCustomWidth() / editableTileMap.getWidth();
    scaleY = instance.getCustomHeight() / editableTileMap.getHeight();
  }
  const absScaleX = Math.abs(scaleX);
  const absScaleY = Math.abs(scaleY);

  tileMapToSceneTransformation.setToIdentity();

  // Translation
  tileMapToSceneTransformation.translate(instance.getX(), instance.getY());

  // Rotation
  const angleInRadians = (instance.getAngle() * Math.PI) / 180;
  tileMapToSceneTransformation.rotateAround(
    angleInRadians,
    renderedInstance.getCenterX(),
    renderedInstance.getCenterY()
  );

  // Scale
  tileMapToSceneTransformation.scale(absScaleX, absScaleY);

  sceneToTileMapTransformation.copyFrom(tileMapToSceneTransformation);
  sceneToTileMapTransformation.invert();
  return { scaleX, scaleY };
};

export const getTileSet = (object: gdObject) => {
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
  const tileSize = parseFloat(
    object
      .getConfiguration()
      .getProperties()
      .get('tileSize')
      .getValue()
  );
  return { rowCount, columnCount, tileSize };
};

type Props = {|
  project: gdProject,
  layout: gdLayout,
  instancesSelection: InstancesSelection,
  getCoordinatesToRender: () => {| x: number, y: number |}[],
  getTileMapTileSelection: () => ?TileMapTileSelection,
  getRendererOfInstance: gdInitialInstance =>
    | RenderedInstance
    | Rendered3DInstance
    | null,
  viewPosition: ViewPosition,
|};

class TileMapTilePreview {
  project: gdProject;
  layout: gdLayout;
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
      this.project,
      this.layout,
      associatedObjectName
    );
    if (!object || object.getType() !== 'TileMap::SimpleTileMap') return;
    const { tileSize } = getTileSet(object);
    let texture;
    if (tileMapTileSelection.single) {
      const atlasResourceName = object
        .getConfiguration()
        .getProperties()
        .get('atlasImage')
        .getValue();
      if (!atlasResourceName) return;
      // TODO: Burst cache when atlas resource is changed
      const cacheKey = `${atlasResourceName}-${tileSize}-${
        tileMapTileSelection.single.x
      }-${tileMapTileSelection.single.y}`;
      texture = this.cache.get(cacheKey);
      if (!texture) {
        const atlasTexture = PixiResourcesLoader.getPIXITexture(
          this.project,
          atlasResourceName
        );

        const rect = new PIXI.Rectangle(
          tileMapTileSelection.single.x * tileSize,
          tileMapTileSelection.single.y * tileSize,
          tileSize,
          tileSize
        );

        texture = new PIXI.Texture(atlasTexture, rect);
        this.cache.set(cacheKey, texture);
      }
    } else if (tileMapTileSelection.erase) {
      texture = PIXI.Texture.from(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAARSURBVHgBY7h58+Z/BhgAcQA/VAcVLiw46wAAAABJRU5ErkJggg=='
      );
      texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }

    const renderedInstance = this.getRendererOfInstance(instance);
    if (
      !renderedInstance ||
      renderedInstance.constructor.name !== 'RenderedSimpleTileMapInstance'
    ) {
      return;
    }

    const scales = updateSceneToTileMapTransformation(
      instance,
      renderedInstance,
      this.sceneToTileMapTransformation,
      this.tileMapToSceneTransformation
    );
    if (!scales) return;
    const { scaleX, scaleY } = scales;
    const coordinates = this.getCoordinatesToRender();
    const alreadyConsideredCoordinates = new Set();
    const tileSizeInCanvas = this.viewPosition.toCanvasScale(tileSize);
    const spriteWidth = tileSizeInCanvas * scaleX;
    const spriteHeight = tileSizeInCanvas * scaleY;

    let coordinatesInTileMap = [0, 0];
    let coordinatesInScene = [0, 0];

    coordinates.forEach(({ x, y }) => {
      this.sceneToTileMapTransformation.transform([x, y], coordinatesInTileMap);
      const gridX = Math.floor(coordinatesInTileMap[0] / tileSize);
      const gridY = Math.floor(coordinatesInTileMap[1] / tileSize);
      const key = `${gridX};${gridY}`;
      if (alreadyConsideredCoordinates.has(key)) return;
      let sprite;
      if (tileMapTileSelection.single) {
        // TODO: Find a way not to regenerate the sprites on each render.
        sprite = new PIXI.Sprite(texture);
        if (tileMapTileSelection.flipHorizontally) {
          sprite.scale.x *= -1;
        }
        if (tileMapTileSelection.flipVertically) {
          sprite.scale.y *= -1;
        }
      } else {
        sprite = new PIXI.TilingSprite(texture, 2, 2);
        sprite.tileScale.x = this.viewPosition.toCanvasScale(scaleX);
        sprite.tileScale.y = this.viewPosition.toCanvasScale(scaleY);
      }
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;
      sprite.width = spriteWidth;
      sprite.height = spriteHeight;
      this.tileMapToSceneTransformation.transform(
        [gridX * tileSize + tileSize / 2, gridY * tileSize + tileSize / 2],
        coordinatesInScene
      );
      sprite.x = this.viewPosition.toCanvasScale(coordinatesInScene[0]);
      sprite.y = this.viewPosition.toCanvasScale(coordinatesInScene[1]);
      sprite.angle = instance.getAngle();

      this.preview.addChild(sprite);
      alreadyConsideredCoordinates.add(key);
    });

    const canvasCoordinates = this.viewPosition.toCanvasCoordinates(0, 0);
    this.preview.position.x = canvasCoordinates[0];
    this.preview.position.y = canvasCoordinates[1];
  }
}
export default TileMapTilePreview;
