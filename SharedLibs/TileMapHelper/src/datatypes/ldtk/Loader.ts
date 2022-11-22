import { integer } from "../../model/CommonTypes";
import { EditableTileMap, TileDefinition } from "../../model/Model";
import { LDtkTileMap } from "./Format";
import { getUniqueId } from "./LoaderHelper";

export namespace LDtkTileMapLoader {
  export function load(pako: any, tileMap: LDtkTileMap): EditableTileMap | null {
    const levelIndex = 0;
    const level = tileMap.levels[levelIndex > -1 ? levelIndex : 0];
    if (!level || !level.layerInstances) {
      return null;
    }
    
    const tileSet = new Map<integer, TileDefinition>();
    
    for(let iLayer = level.layerInstances.length - 1; iLayer >= 0; --iLayer) {
      const layer = level.layerInstances[iLayer];
      const tilesetId = layer.__tilesetDefUid;
      const tileCache: Record<number, boolean> = {};
      
      for(const tile of [...layer.autoLayerTiles, ...layer.gridTiles]) {
        if(tileCache[tile.t]) {
          continue;
        }
        
        const tileId = getUniqueId(tilesetId, tile.t);
        if(tileSet.has(tileId)) {
          tileCache[tile.t] = true;
          continue;
        }
        
        const tileDef = new TileDefinition(0);
        
        tileCache[tile.t] = true;
        tileSet.set(tileId, tileDef);
      }
    }
    
    const editableTileMap = new EditableTileMap(
      8,
      8,
      37,
      22,
      tileSet,
    );
    
    for(let iLayer = level.layerInstances.length - 1; iLayer >= 0; --iLayer) {
      const layer = level.layerInstances[iLayer];
      const gridSize = layer.__gridSize;
      const tilesetId = layer.__tilesetDefUid;
      
      const editableTileLayer = editableTileMap.addTileLayer(iLayer);
      editableTileLayer.setVisible(layer.visible);
      
      for(const tile of [...layer.autoLayerTiles, ...layer.gridTiles]) {
        const x = tile.px[0] / gridSize;
        const y = tile.px[1] / gridSize;
        const tileId = getUniqueId(tilesetId, tile.t);
        
        editableTileLayer.setTile(x, y, tileId);
        
        if(tile.f === 0) {
          // do nothing
        }
        else if(tile.f === 1) {
          editableTileLayer.setFlippedHorizontally(x, y, true);
        }
        else if(tile.f === 2) {
          editableTileLayer.setFlippedVertically(x, y, true);
        }
        else if(tile.f === 3) {
          editableTileLayer.setFlippedDiagonally(x, y, true);
        }
      }
    }
    
    return editableTileMap;
  }
}
