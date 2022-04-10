import * as TileMapHelperModule from './helper/TileMapHelper.js';

declare global {
  namespace GlobalTileMapHelperModule {
    export import TileMapHelper = TileMapHelperModule;
  }
}
