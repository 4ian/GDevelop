/*
 * GDevelop JS Platform
 * Copyright 2021-present Florian Rival (florian.rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Unimplemented Bitmap font manager.
   */
  export class CocosBitmapFontManager {
    loadBitmapFontData(
      onProgress: (count: integer, total: integer) => void
    ): Promise<void[]> {
      return Promise.resolve([]);
    }
  }

  // Register the class to let the engine use it.
  gdjs.BitmapFontManager = gdjs.CocosBitmapFontManager;
}
