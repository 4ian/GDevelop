// @flow

import * as PIXI from 'pixi.js-legacy';
import getObjectByName from '../Utils/GetObjectByName';
import InstancesSelection from './InstancesSelection';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import ViewPosition from './ViewPosition';
import RenderedInstance from '../ObjectsRendering/Renderers/RenderedInstance';
import Rendered3DInstance from '../ObjectsRendering/Renderers/Rendered3DInstance';
import { type TileMapTileSelection } from './TileMapPainter';

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

    let scaleX = 1,
      scaleY = 1;
    if (instance.hasCustomSize()) {
      const renderedInstance = this.getRendererOfInstance(instance);
      if (
        renderedInstance &&
        renderedInstance.constructor.name === 'RenderedSimpleTileMapInstance'
      ) {
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
    }

    const coordinates = this.getCoordinatesToRender();
    const alreadyConsideredCoordinates = new Set();
    const tileSizeInCanvas = this.viewPosition.toCanvasScale(tileSize);
    const spriteWidth = tileSizeInCanvas * scaleX;
    const spriteHeight = tileSizeInCanvas * scaleY;

    coordinates.forEach(({ x, y }) => {
      const steppedX = Math.floor((x - instance.getX()) / (tileSize * scaleX));
      const steppedY = Math.floor((y - instance.getY()) / (tileSize * scaleY));
      const key = `${steppedX};${steppedY}`;
      if (alreadyConsideredCoordinates.has(key)) return;
      let sprite;
      if (tileMapTileSelection.single) {
        // TODO: Find a way not to regenerate the sprites on each render.
        sprite = new PIXI.Sprite(texture);
      } else {
        sprite = new PIXI.TilingSprite(texture, 2, 2);
        sprite.tileScale.x = this.viewPosition.toCanvasScale(scaleX);
        sprite.tileScale.y = this.viewPosition.toCanvasScale(scaleY);
      }
      sprite.width = spriteWidth;
      sprite.height = spriteHeight;

      sprite.x = this.viewPosition.toCanvasScale(
        steppedX * (tileSize * scaleX)
      );
      sprite.y = this.viewPosition.toCanvasScale(
        steppedY * (tileSize * scaleY)
      );

      this.preview.addChild(sprite);
      alreadyConsideredCoordinates.add(key);
    });

    const canvasCoordinates = this.viewPosition.toCanvasCoordinates(
      instance.getX(),
      instance.getY()
    );
    this.preview.position.x = canvasCoordinates[0];
    this.preview.position.y = canvasCoordinates[1];
  }
}
export default TileMapTilePreview;
