import { integer, float } from "../model/CommonTypes";
import {
  EditableObjectLayer,
  EditableTileMap,
  EditableTileMapLayer,
} from "../model/TileMapModel";
import { TiledPixiHelper } from "./tiled/TiledPixiHelper";
import { LDtkPixiHelper } from "./ldtk/LDtkPixiHelper";
import { TileMapFileContent } from "../load/TileMapFileContent";
import { TileTextureCache } from "./TileTextureCache";
import { FlippingHelper, getPixiRotate } from "../model/GID";

export namespace PixiTileMapHelper {
  /**
   * Split an atlas image into Pixi textures.
   *
   * @param tiledMap A tile map exported from Tiled.
   * @param levelIndex The level of the tile map to load from.
   * @param atlasTexture The texture containing the whole tile set.
   * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @returns A textures cache.
   */
  export function parseAtlas(
    tileMap: TileMapFileContent,
    levelIndex: number,
    atlasTexture: PIXI.BaseTexture<PIXI.Resource> | null,
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>
  ): TileTextureCache | null {
    if (tileMap.kind === "ldtk") {
      return LDtkPixiHelper.parseAtlas(
        tileMap.data,
        levelIndex,
        atlasTexture,
        getTexture
      );
    }
    if (tileMap.kind === "tiled") {
      return TiledPixiHelper.parseAtlas(
        tileMap.data,
        levelIndex,
        atlasTexture,
        getTexture
      );
    }

    console.warn(
      "The loaded Tiled map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"
    );

    return null;
  }

  /**
   * Re-renders the tile map whenever its rendering settings have been changed
   *
   * @param untypedPixiTileMap the tile map renderer
   * @param tileMap the tile map model
   * @param textureCache the tile set textures
   * @param displayMode What to display:
   * - only a single layer (`index`)
   * - only visible layers (`visible`)
   * - everything (`all`).
   * @param layerIndex If `displayMode` is set to `index`, the layer index to be
   * displayed.
   */
  export function updatePixiTileMap(
    untypedPixiTileMap: any,
    tileMap: EditableTileMap,
    textureCache: TileTextureCache,
    displayMode: "index" | "visible" | "all",
    layerIndex: number
  ): void {
    // The extension doesn't handle the Pixi sub-namespace very well.
    const pixiTileMap = untypedPixiTileMap as PIXI.tilemap.CompositeTilemap;
    if (!pixiTileMap) return;
    pixiTileMap.clear();

    const bgResourceName = tileMap.getBackgroundResourceName();
    if (bgResourceName) {
      const texture = textureCache.getLevelBackgroundTexture(bgResourceName);
      pixiTileMap.tile(texture, 0, 0);
    }

    for (const layer of tileMap.getLayers()) {
      if (
        (displayMode === "index" && layerIndex !== layer.id) ||
        (displayMode === "visible" && !layer.isVisible())
      ) {
        continue;
      }

      if (layer instanceof EditableObjectLayer) {
        const objectLayer = layer as EditableObjectLayer;

        for (const object of objectLayer.objects) {
          const tileGID = object.getTileId();
          const texture = textureCache.getTexture(tileGID);

          if (texture) {
            const rotate = getPixiRotate(tileGID);

            pixiTileMap.tile(
              texture,
              object.x,
              object.y - objectLayer.tileMap.getTileHeight(),
              { rotate }
            );
          }
        }
      } else if (layer instanceof EditableTileMapLayer) {
        const tileLayer = layer as EditableTileMapLayer;

        const tileWidth = tileLayer.tileMap.getTileWidth();
        const tileHeight = tileLayer.tileMap.getTileHeight();
        const dimensionX = tileLayer.tileMap.getDimensionX();
        const dimensionY = tileLayer.tileMap.getDimensionY();
        const alpha = tileLayer.getAlpha();

        for (let y = 0; y < dimensionY; y++) {
          for (let x = 0; x < dimensionX; x++) {
            const xPos = tileWidth * x;
            const yPos = tileHeight * y;

            const tileGID = tileLayer.getTileGID(x, y);
            if (tileGID === undefined) {
              continue;
            }
            const tileId = FlippingHelper.getTileId(tileGID);

            const tileDefinition = tileLayer.tileMap.getTileDefinition(tileId);

            if (tileDefinition.hasStackedTiles()) {
              for (const tileGID of tileDefinition.getStackedTiles()) {
                const tileId = FlippingHelper.getTileId(tileGID);
                const tileTexture = textureCache.getTexture(tileId);
                if (!tileTexture) {
                  continue;
                }

                const rotate = getPixiRotate(tileGID);

                void pixiTileMap.tile(tileTexture, xPos, yPos, {
                  alpha,
                  rotate,
                });
              }
            } else {
              const tileTexture = textureCache.getTexture(tileId);
              if (!tileTexture) {
                console.warn(`Unknown tile id: ${tileId} at (${x}, ${y})`);
                continue;
              }
              const rotate = getPixiRotate(tileGID);
              const pixiTilemapFrame = pixiTileMap.tile(
                tileTexture,
                xPos,
                yPos,
                {
                  alpha,
                  rotate,
                }
              );

              // Animated tiles have a limitation:
              // they are only able to use frames arranged horizontally one next
              // to each other on the atlas.
              if (tileDefinition.getAnimationLength() > 0) {
                pixiTilemapFrame.tileAnimX(
                  tileWidth,
                  tileDefinition.getAnimationLength()
                );
              }
            }
          }
        }
      }
    }
  }

  /**
   * Re-renders the collision mask
   */
  export function updatePixiCollisionMask(
    pixiGraphics: PIXI.Graphics,
    tileMap: EditableTileMap,
    typeFilter: string,
    outlineSize: integer,
    outlineColor: integer,
    outlineOpacity: float,
    fillColor: integer,
    fillOpacity: float
  ): void {
    if (!pixiGraphics) return;
    pixiGraphics.clear();

    pixiGraphics.lineStyle(outlineSize, outlineColor, outlineOpacity);
    pixiGraphics.drawRect(0, 0, tileMap.getWidth(), tileMap.getHeight());

    for (const layer of tileMap.getLayers()) {
      const tileWidth = tileMap.getTileWidth();
      const tileHeight = tileMap.getTileHeight();

      if (layer instanceof EditableTileMapLayer) {
        const tileLayer = layer as EditableTileMapLayer;

        for (let y = 0; y < tileLayer.tileMap.getDimensionY(); y++) {
          for (let x = 0; x < tileLayer.tileMap.getDimensionX(); x++) {
            const xPos = tileWidth * x;
            const yPos = tileHeight * y;

            const tileId = tileLayer.getTileId(x, y)!;
            const isFlippedHorizontally = tileLayer.isFlippedHorizontally(x, y);
            const isFlippedVertically = tileLayer.isFlippedVertically(x, y);
            const isFlippedDiagonally = tileLayer.isFlippedDiagonally(x, y);
            const tileDefinition = tileLayer.tileMap.getTileDefinition(tileId);
            if (!tileDefinition) {
              continue;
            }
            const hitboxes = tileDefinition.getHitBoxes(typeFilter);
            if (!hitboxes) {
              continue;
            }
            for (const vertices of hitboxes) {
              if (vertices.length === 0) continue;

              pixiGraphics.beginFill(fillColor, fillOpacity);
              for (let index = 0; index < vertices.length; index++) {
                let vertexX = vertices[index][0];
                let vertexY = vertices[index][1];
                // It's important to do the diagonal flipping first,
                // because the other flipping "move" the origin.
                if (isFlippedDiagonally) {
                  const swap = vertexX;
                  vertexX = vertexY;
                  vertexY = swap;
                }
                if (isFlippedHorizontally) {
                  vertexX = tileWidth - vertexX;
                }
                if (isFlippedVertically) {
                  vertexY = tileHeight - vertexY;
                }
                if (index === 0) {
                  pixiGraphics.moveTo(xPos + vertexX, yPos + vertexY);
                } else {
                  pixiGraphics.lineTo(xPos + vertexX, yPos + vertexY);
                }
              }
              pixiGraphics.closePath();
              pixiGraphics.endFill();
            }
          }
        }
      }
    }
  }
}
