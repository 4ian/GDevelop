// @flow

import * as React from 'react';
import * as PIXI from 'pixi.js-legacy';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';

const identify = (data: Object) => {
  if (data.tiledversion) {
    console.info('Detected the json file was created in Tiled');
    return {
      kind: 'tiled',
      data,
    };
  }

  if (data.__header__ && data.__header__.app === 'LDtk') {
    console.info('Detected the json/ldtk file was created in LDtk');
    return {
      kind: 'ldtk',
      data,
    };
  }

  console.warn(
    "The loaded Tile Map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"
  );

  return null;
};

const getAtlasPathForLdtkTilemap = ({ data, levelIndex, layerIndex }) => {
  const tilesetId =
    data.levels[levelIndex].layerInstances[layerIndex].__tilesetDefUid;
  const tileset = data.defs.tilesets.find(tileset => tileset.uid === tilesetId);
  return {
    atlasPath: tileset.relPath,
    tileset,
  };
};

const getAtlasResource = async ({
  project,
  object,
  layerIndex,
}: {|
  project: gdProject,
  object: gdObject,
  layerIndex: number,
|}): Promise<?{ atlasResourceName: string, tileset: any }> => {
  if (object.getType() !== 'TileMap::TileMap') {
    return null;
  }
  const resourcesManager = project.getResourcesManager();
  const atlasResourceName = object
    .getConfiguration()
    .getProperties()
    .get('tilemapAtlasImage')
    .getValue();
  const tilesetResourceName = object
    .getConfiguration()
    .getProperties()
    .get('tilesetJsonFile')
    .getValue();

  if (atlasResourceName && tilesetResourceName) {
    const tilesetResource = resourcesManager.getResource(tilesetResourceName);

    const tilesetJsonData = await PixiResourcesLoader.getResourceJsonData(
      project,
      tilesetResource.getFile()
    );

    return {
      atlasResourceName: atlasResourceName,
      tileset: tilesetJsonData,
    };
  }

  const tileMapResourceName = object
    .getConfiguration()
    .getProperties()
    .get('tilemapJsonFile')
    .getValue();
  const levelIndex = parseInt(
    object
      .getConfiguration()
      .getProperties()
      .get('levelIndex')
      .getValue(),
    10
  );

  if (!tileMapResourceName) return null;
  const tileMapResource = resourcesManager.getResource(tileMapResourceName);
  const embeddedResourcesMapping = JSON.parse(tileMapResource.getMetadata())
    .embeddedResourcesMapping;
  const tileMapJsonData = await PixiResourcesLoader.getResourceJsonData(
    project,
    tileMapResource.getFile()
  );

  const tileMap = identify(tileMapJsonData);
  const { atlasPath, tileset } = getAtlasPathForLdtkTilemap({
    data: tileMap.data,
    levelIndex,
    layerIndex,
  });
  const resourceName = embeddedResourcesMapping[atlasPath];
  if (resourceName) {
    return {
      atlasResourceName: resourceName,
      tileset,
    };
  }
  return null;
};

type Props = {|
  project: gdProject,
  object: gdObject,
|};

const TileMapPainter = ({ project, object }: Props) => {
  const [width, setWidth] = React.useState<?number>(null);
  const [layerIndex, setLayerIndex] = React.useState<number>(0);
  const pixiCanvasContainerRef = React.useRef<?HTMLDivElement>(null);
  const pixiRendererRef = React.useRef<?PIXI.Renderer>(null);
  const pixiContainerRef = React.useRef<?PIXI.Container>(null);

  const initializeAtlas = React.useCallback((_atlasResourceName: string) => {
    const { current: pixiCanvasContainer } = pixiCanvasContainerRef;
    if (!pixiCanvasContainer) return;
    pixiRendererRef.current = PIXI.autoDetectRenderer({
      width: 100,
      height: 200,
      // "preserveDrawingBuffer: true" is needed to avoid flickering and background issues on some mobile phones (see #585 #572 #566 #463)
      preserveDrawingBuffer: true,
      // Disable anti-aliasing (default) to avoid rendering issue (1px width line of extra pixels) when rendering pixel perfect tiled sprites.
      antialias: false,
      clearBeforeRender: false,
      backgroundAlpha: 0,
    });
    pixiCanvasContainer.appendChild(pixiRendererRef.current.view);
  }, []);

  React.useEffect(
    () => {
      (async () => {
        const resource = await getAtlasResource({
          project,
          object,
          layerIndex,
        });
        if (resource) {
          initializeAtlas(resource.atlasResourceName);
          const pixiTexture = resource.atlasResourceName
            ? PixiResourcesLoader.getPIXITexture(
                project,
                resource.atlasResourceName
              )
            : null;
          console.log('sprite');
          const sprite = new PIXI.Sprite(pixiTexture);
          if (!pixiTexture) return;
          pixiContainerRef.current = new PIXI.Container();
          sprite.width = pixiTexture.frame.width;
          sprite.height = pixiTexture.frame.height;
          pixiContainerRef.current.addChild(sprite);
        }
      })();
    },
    [project, object, layerIndex, initializeAtlas]
  );

  const requestRef = React.useRef();

  const animate = React.useCallback(time => {
    if (pixiRendererRef.current && pixiContainerRef.current) {
      pixiRendererRef.current.render(pixiContainerRef.current);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  React.useEffect(
    () => {
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    },
    [animate]
  );

  React.useEffect(
    () => {
      if (!pixiRendererRef.current) return;
      console.log(pixiRendererRef.current);
      const sprite = pixiContainerRef.current.getChildAt(0);
      sprite.width = width;
      sprite.height =
        (width * sprite.texture.frame.height) / sprite.texture.frame.width;
      pixiRendererRef.current.resize(width, 200);
    },
    [width]
  );

  React.useEffect(() => {
    return () => {
      const { current: container } = pixiCanvasContainerRef;
      if (container && container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <FullSizeMeasurer>
      {({ width }) => {
        setWidth(width);
        return <div style={{ flex: 1 }} ref={pixiCanvasContainerRef} />;
      }}
    </FullSizeMeasurer>
  );
};

export default TileMapPainter;
