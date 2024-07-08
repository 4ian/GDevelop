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
  getLastCursorSceneCoordinates: () => [number, number],
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
  getLastCursorSceneCoordinates: () => [number, number];
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
    getLastCursorSceneCoordinates,
    project,
    layout,
    getTileMapTileSelection,
    getRendererOfInstance,
    viewPosition,
  }: Props) {
    this.project = project;
    this.layout = layout;
    this.instancesSelection = instancesSelection;
    this.getLastCursorSceneCoordinates = getLastCursorSceneCoordinates;
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
    if (!tileMapTileSelection || !tileMapTileSelection.single) return;
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
    let texture = this.cache.get(cacheKey);
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
    const sprite = new PIXI.Sprite(texture);
    sprite.width = this.viewPosition.toCanvasScale(tileSize) * scaleX;
    sprite.height = this.viewPosition.toCanvasScale(tileSize) * scaleY;

    this.preview.addChild(sprite);

    const [cursorX, cursorY] = this.getLastCursorSceneCoordinates();
    const canvasCoordinates = this.viewPosition.toCanvasCoordinates(
      Math.floor((cursorX - instance.getX()) / (tileSize * scaleX)) *
        (tileSize * scaleX) +
        instance.getX(),
      Math.floor((cursorY - instance.getY()) / (tileSize * scaleY)) *
        (tileSize * scaleY) +
        instance.getY()
    );
    this.preview.position.x = canvasCoordinates[0];
    this.preview.position.y = canvasCoordinates[1];
  }
}
export default TileMapTilePreview;
