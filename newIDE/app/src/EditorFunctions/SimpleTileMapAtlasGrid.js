// @flow

export type AtlasGrid = {| columnCount: number, rowCount: number |};

/**
 * The grid of tiles of the atlas image of a simple tile map, like the object
 * editor computes it when the image loads. The grid stored in the object is
 * only updated by the object editor, so it can be out of date.
 */
export const loadSimpleTileMapAtlasGrid = async ({
  project,
  atlasImage,
  tileSize,
  PixiResourcesLoader,
}: {|
  project: gdProject,
  atlasImage: string,
  tileSize: number,
  PixiResourcesLoader: any,
|}): Promise<
  {| success: true, grid: AtlasGrid |} | {| success: false, error: string |}
> => {
  try {
    await PixiResourcesLoader.loadTextures(project, [atlasImage]);
  } catch (error) {
    return {
      success: false,
      error: `The atlas image "${atlasImage}" could not be loaded.`,
    };
  }
  const texture = PixiResourcesLoader.getPIXITexture(project, atlasImage);
  // An image that fails to load is replaced by the "invalid texture" image.
  if (
    !texture ||
    !texture.valid ||
    texture === PixiResourcesLoader.getInvalidPIXITexture()
  ) {
    return {
      success: false,
      error: `The atlas image "${atlasImage}" could not be loaded.`,
    };
  }
  const columnCount = Math.floor(texture.width / tileSize);
  const rowCount = Math.floor(texture.height / tileSize);
  if (columnCount === 0 || rowCount === 0) {
    return {
      success: false,
      error: `The tile size ${tileSize} is larger than the atlas image (${
        texture.width
      }x${texture.height}).`,
    };
  }
  return { success: true, grid: { columnCount, rowCount } };
};
