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
export const BitmapFontManager = CocosBitmapFontManager;
export type BitmapFontManager = CocosBitmapFontManager;
