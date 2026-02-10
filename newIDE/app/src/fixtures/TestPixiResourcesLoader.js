// @flow

// TODO: PixiResourcesLoader is typed with "any" in the codebase. It should be typed
// and then this mock and any function needing it can use this type.
export const PixiResourcesLoaderMock = {
  getPIXITexture: (project: gdProject, resourceName: string) => {
    switch (resourceName) {
      case 'Frame100x240':
        return { valid: true, width: 100, height: 240 };
      case 'Frame50x120':
        return { valid: true, width: 50, height: 120 };
      default:
        return { valid: false, width: 0, height: 0 };
    }
  },
};
