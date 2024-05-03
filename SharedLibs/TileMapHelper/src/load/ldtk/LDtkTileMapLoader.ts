import { integer } from "../../model/CommonTypes";
import { EditableTileMap, TileDefinition } from "../../model/TileMapModel";
import { getLDtkTileId } from "./LDtkTileMapLoaderHelper";
import { LDtkTileMap } from "./LDtkFormat";
import { getTileGID } from "../../model/GID";

export namespace LDtkTileMapLoader {
  /**
   * Create a {@link EditableTileMap} from the LDtk JSON.
   *
   * @param ldtkTileMap A tile map exported from LDtk.
   * @param levelIndex The level of the tile map to load from.
   * @returns A {@link EditableTileMap}
   */
  export function load(
    ldtkTileMap: LDtkTileMap,
    levelIndex: number
  ): EditableTileMap | null {
    const ldtkLevel = ldtkTileMap.levels[levelIndex > -1 ? levelIndex : 0];
    if (!ldtkLevel || !ldtkLevel.layerInstances) {
      return null;
    }

    const tileSet = new Map<integer, TileDefinition>();
    let gridSize = 0;
    let dimX = 0;
    let dimY = 0;

    for (
      let iLayer = ldtkLevel.layerInstances.length - 1;
      iLayer >= 0;
      --iLayer
    ) {
      const layer = ldtkLevel.layerInstances[iLayer];
      const tilesetId = layer.__tilesetDefUid;
      const tileCache: Record<number, boolean> = {};

      // Cache the tile definitions.
      for (const tile of [...layer.autoLayerTiles, ...layer.gridTiles]) {
        if (tileCache[tile.t]) {
          continue;
        }

        const tileId = getLDtkTileId(tilesetId, tile.t);
        if (tileSet.has(tileId)) {
          tileCache[tile.t] = true;
          continue;
        }

        const tileDef = new TileDefinition(0);

        tileCache[tile.t] = true;
        tileSet.set(tileId, tileDef);
      }

      if (
        layer.__type === "IntGrid" ||
        layer.__type === "AutoLayer" ||
        layer.__type === "Tiles"
      ) {
        if (gridSize === 0) {
          gridSize = layer.__gridSize;
          dimX = layer.__cWid;
          dimY = layer.__cHei;
        } else if (layer.__gridSize !== gridSize) {
          console.warn(
            "Grid size is different across layers. Only the first layer grid size will be followed."
          );
        }
      }
    }

    const editableTileMap = new EditableTileMap(
      gridSize,
      gridSize,
      dimX,
      dimY,
      tileSet
    );
    const composedTileMap = new Map<string, TileDefinition>();
    let nextComposedTileId = 0xfffffff;

    for (
      let iLayer = ldtkLevel.layerInstances.length - 1;
      iLayer >= 0;
      --iLayer
    ) {
      const layer = ldtkLevel.layerInstances[iLayer];
      const gridSize = layer.__gridSize;
      const tilesetId = layer.__tilesetDefUid;

      const editableTileLayer = editableTileMap.addTileLayer(iLayer);
      editableTileLayer.setAlpha(layer.__opacity);
      editableTileLayer.setVisible(layer.visible);

      for (const tile of [...layer.autoLayerTiles, ...layer.gridTiles]) {
        const x = Math.floor(tile.px[0] / gridSize);
        const y = Math.floor(tile.px[1] / gridSize);
        const tileId = getLDtkTileId(tilesetId, tile.t);

        const oldTileId = editableTileLayer.getTileId(x, y);
        if (oldTileId === undefined) {
          editableTileLayer.setTile(x, y, tileId);
          editableTileLayer.setFlippedHorizontally(
            x,
            y,
            tile.f === 1 || tile.f === 3
          );
          editableTileLayer.setFlippedVertically(
            x,
            y,
            tile.f === 2 || tile.f === 3
          );
        } else {
          const tileGID = getTileGID(
            tileId,
            tile.f === 1 || tile.f === 3,
            tile.f === 2 || tile.f === 3,
            false
          );
          const oldTileDef = tileSet.get(oldTileId);

          if (oldTileDef?.hasStackedTiles()) {
            const hash = `${oldTileDef
              .getStackedTiles()
              .map((tileId) => `${tileId}`)
              .join(";")};${tileGID}`;
            const tileDef = composedTileMap.get(hash);
            if (tileDef) {
              editableTileLayer.setTile(x, y, tileDef.getStackTileId());
            } else {
              const tileDef = new TileDefinition(0);

              tileDef.setStackedTiles(
                nextComposedTileId,
                ...oldTileDef.getStackedTiles(),
                tileGID
              );

              tileSet.set(nextComposedTileId, tileDef);
              nextComposedTileId -= 1;

              composedTileMap.set(hash, tileDef);

              editableTileLayer.setTile(x, y, tileDef.getStackTileId());
            }
          } else {
            const oldTileGID = editableTileLayer.getTileGID(x, y)!;
            const hash = `${oldTileGID};${tileGID}`;
            const tileDef = new TileDefinition(0);

            tileDef.setStackedTiles(nextComposedTileId, oldTileGID, tileGID);

            tileSet.set(nextComposedTileId, tileDef);
            nextComposedTileId -= 1;

            composedTileMap.set(hash, tileDef);

            editableTileLayer.setTile(x, y, tileDef.getStackTileId());
          }
        }
      }
    }

    if (ldtkLevel.bgRelPath) {
      void editableTileMap.setBackgroundResourceName(ldtkLevel.bgRelPath);
    }

    return editableTileMap;
  }
}
