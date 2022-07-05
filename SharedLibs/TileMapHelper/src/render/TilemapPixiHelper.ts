import { integer, float } from "../model/CommonTypes";
import { TiledMap } from "../tiled/Tiled";
import {
  EditableObjectLayer,
  EditableTileMap,
  EditableTileMapLayer,
} from "../model/TileMapModel";
import { TileTextureCache } from "./TileTextureCache";

import PIXI = GlobalPIXIModule.PIXI;

export class PixiTileMapHelper {
  /**
   * Parse a Tiled map JSON file,
   * exported from Tiled (https://www.mapeditor.org/)
   * into a generic tile map data (`GenericPixiTileMapData`).
   *
   * @param tiledData A JS object representing a map exported from Tiled.
   * @param atlasTexture
   * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @returns A textures cache.
   */
  static parseAtlas(
    tiledData: TiledMap,
    atlasTexture: PIXI.BaseTexture<PIXI.Resource> | null,
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>
  ): TileTextureCache | null {
    if (!tiledData.tiledversion) {
      console.warn(
        "The loaded Tiled map does not contain a 'tiledversion' key. Are you sure this file has been exported from Tiled (mapeditor.org)?"
      );

      return null;
    }

    // We only handle tileset embedded in the tilemap. Warn if it's not the case.
    if (!tiledData.tilesets.length || "source" in tiledData.tilesets[0]) {
      console.warn(
        "The loaded Tiled map seems not to contain any tileset data (nothing in 'tilesets' key)."
      );
      return null;
    }

    const {
      tilewidth,
      tileheight,
      tilecount,
      tiles,
      image,
      columns,
      spacing,
      margin,
    } = tiledData.tilesets[0];
    if (!atlasTexture) atlasTexture = getTexture(image);

    // We try to detect what size Tiled is expecting.
    const rows = tilecount / columns;
    const expectedAtlasWidth =
      tilewidth * columns + spacing * (columns - 1) + margin * 2;
    const expectedAtlasHeight =
      tileheight * rows + spacing * (rows - 1) + margin * 2;
    if (
      (atlasTexture.width !== 1 && expectedAtlasWidth !== atlasTexture.width) ||
      (atlasTexture.height !== 1 && expectedAtlasHeight !== atlasTexture.height)
    ) {
      const expectedSize = expectedAtlasWidth + "x" + expectedAtlasHeight;
      const actualSize = atlasTexture.width + "x" + atlasTexture.height;
      console.warn(
        "It seems the atlas file was resized, which is not supported. It should be " +
          expectedSize +
          "px, but it's " +
          actualSize +
          " px."
      );
      return null;
    }

    // Prepare the textures pointing to the base "Atlas" Texture for each tile.
    // Note that this cache can be augmented later with rotated/flipped
    // versions of the tile textures.
    const textureCache = new TileTextureCache();
    for (let frame = 0; frame < tilecount; frame++) {
      const columnMultiplier = Math.floor(frame % columns);
      const rowMultiplier = Math.floor(frame / columns);
      const x = margin + columnMultiplier * (tilewidth + spacing);
      const y = margin + rowMultiplier * (tileheight + spacing);

      try {
        const rect = new PIXI.Rectangle(x, y, tilewidth, tileheight);
        const texture = new PIXI.Texture(atlasTexture!, rect);

        textureCache.setTexture(frame, false, false, false, texture);
      } catch (error) {
        console.error(
          "An error occurred while creating a PIXI.Texture to be used in a TileMap:",
          error
        );
      }
    }

    return textureCache;
  }

  /**
   * Re-renders the tilemap whenever its rendering settings have been changed
   *
   * @param pixiTileMap
   * @param tileMap
   * @param textureCache
   * @param displayMode What to display: only a single layer (`index`), only visible layers (`visible`) or everyhing (`all`).
   * @param layerIndex If `displayMode` is set to `index`, the layer index to be displayed.
   */
  static updatePixiTileMap(
    pixiTileMap: any,
    tileMap: EditableTileMap,
    textureCache: TileTextureCache,
    displayMode: "index" | "visible" | "all",
    layerIndex: number
  ) {
    if (!pixiTileMap) return;
    pixiTileMap.clear();

    for (const layer of tileMap.getLayers()) {
      if (
        (displayMode === "index" && layerIndex !== layer.id) ||
        (displayMode === "visible" && !layer.isVisible())
      ) {
        return;
      }

      if (layer instanceof EditableObjectLayer) {
        const objectLayer = layer as EditableObjectLayer;
        for (const object of objectLayer.objects) {
          const texture = textureCache.findTileTexture(
            object.getTileId(),
            object.isFlippedHorizontally(),
            object.isFlippedVertically(),
            object.isFlippedDiagonally()
          );
          if (texture) {
            pixiTileMap.addFrame(
              texture,
              object.x,
              object.y - objectLayer.tileMap.getTileHeight()
            );
          }
        }
      } else if (layer instanceof EditableTileMapLayer) {
        const tileLayer = layer as EditableTileMapLayer;

        for (let y = 0; y < tileLayer.tileMap.getDimensionY(); y++) {
          for (let x = 0; x < tileLayer.tileMap.getDimensionX(); x++) {
            const tileWidth = tileLayer.tileMap.getTileWidth();
            const xPos = tileWidth * x;
            const yPos = tileLayer.tileMap.getTileHeight() * y;

            const tileId = tileLayer.get(x, y)!;

            const tileTexture = textureCache.findTileTexture(
              tileId,
              tileLayer.isFlippedHorizontally(x, y),
              tileLayer.isFlippedVertically(x, y),
              tileLayer.isFlippedDiagonally(x, y)
            );
            if (tileTexture) {
              const pixiTilemapFrame = pixiTileMap.addFrame(
                tileTexture,
                xPos,
                yPos
              );

              const tileDefinition = tileLayer.tileMap.getTileDefinition(
                tileId
              );

              // Animated tiles have a limitation:
              // they are only able to use frames arranged horizontally one next
              // to each other on the atlas.
              if (tileDefinition && tileDefinition.getAnimationLength() > 0) {
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
   *
   * @param pixiTileMap
   * @param tileMap
   * @param textureCache
   * @param displayMode What to display: only a single layer (`index`), only visible layers (`visible`) or everyhing (`all`).
   * @param layerIndex If `displayMode` is set to `index`, the layer index to be displayed.
   */
  static updatePixiCollisionMask(
    pixiGraphics: PIXI.Graphics,
    tileMap: EditableTileMap,
    displayMode: "index" | "visible" | "all",
    layerIndex: integer,
    typeFilter: string,
    outlineSize: integer,
    outlineColor: integer,
    outlineOpacity: float,
    fillColor: integer,
    fillOpacity: float
  ) {
    if (!pixiGraphics) return;
    pixiGraphics.clear();

    for (const layer of tileMap.getLayers()) {
      if (displayMode === "index" && layerIndex !== layer.id) return;
      // invisible doesn't mean no collision.
      // TODO add a "Enable" flag next to "Visible" or rename "Visible" to "Enable"?
      const tileWidth = tileMap.getTileWidth();
      const tileHeight = tileMap.getTileHeight();

      if (layer instanceof EditableTileMapLayer) {
        const tileLayer = layer as EditableTileMapLayer;

        for (let y = 0; y < tileLayer.tileMap.getDimensionY(); y++) {
          for (let x = 0; x < tileLayer.tileMap.getDimensionX(); x++) {
            const xPos = tileWidth * x;
            const yPos = tileHeight * y;

            const tileId = tileLayer.get(x, y)!;
            const isFlippedHorizontally = tileLayer.isFlippedHorizontally(x, y);
            const isFlippedVertically = tileLayer.isFlippedVertically(x, y);
            const isFlippedDiagonally = tileLayer.isFlippedDiagonally(x, y);
            const tileDefinition = tileLayer.tileMap.getTileDefinition(tileId);
            if (!tileDefinition) {
              continue;
            }
            const hitboxes = tileDefinition.getHiBoxes(typeFilter);
            if (!hitboxes) {
              continue;
            }
            pixiGraphics.lineStyle(outlineSize, outlineColor, outlineOpacity);
            for (const vertices of hitboxes) {
              if (vertices.length === 0) continue;

              pixiGraphics.beginFill(fillColor, fillOpacity);
              for (let index = 0; index < vertices.length; index++) {
                let vertexX = vertices[index][0];
                let vertexY = vertices[index][1];
                if (isFlippedHorizontally) {
                  vertexX = tileWidth - vertexX;
                }
                if (isFlippedVertically) {
                  vertexY = tileHeight - vertexY;
                }
                if (isFlippedDiagonally) {
                  const swap = vertexX;
                  vertexX = vertexY;
                  vertexY = swap;
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
