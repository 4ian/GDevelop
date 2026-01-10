// @flow
import * as React from 'react';
import * as PIXI from 'pixi.js-legacy';
import PixiResourcesLoader, {
  readEmbeddedResourcesMapping,
} from './PixiResourcesLoader';

export type ObjectThumbnail = {|
  thumbnailSrc: string,
  project?: gdProject,
  spritesheetResourceName?: string,
  spritesheetFrameName?: string,
|};

export type FrameRect = {|
  x: number,
  y: number,
  width: number,
  height: number,
|};

export type SpritesheetFrameData = {|
  imageSrc: string,
  frame: FrameRect,
  originalSize: {|
    width: number,
    height: number,
  |},
  isSmooth: boolean,
|};

export const useSpritesheetFrameData = (
  project: ?gdProject,
  spritesheetResourceName: ?string,
  frameName: ?string
): ?SpritesheetFrameData => {
  const [frameData, setFrameData] = React.useState<?SpritesheetFrameData>(
    null
  );

  React.useEffect(
    () => {
      let isMounted = true;

      if (!project || !spritesheetResourceName || !frameName) {
        setFrameData(null);
        return () => {};
      }

      (async () => {
        const texture = await PixiResourcesLoader.getSpritesheetFramePIXITexture(
          project,
          spritesheetResourceName,
          frameName
        );
        if (!isMounted) return;

        if (!texture || !texture.baseTexture || !texture.frame || !texture.orig) {
          setFrameData(null);
          return;
        }

        const source = texture.baseTexture.resource
          ? texture.baseTexture.resource.source
          : null;
        const imageSrc =
          source instanceof HTMLImageElement ? source.src : '';

        if (!imageSrc) {
          setFrameData(null);
          return;
        }

        setFrameData({
          imageSrc,
          frame: {
            x: texture.frame.x,
            y: texture.frame.y,
            width: texture.frame.width,
            height: texture.frame.height,
          },
          originalSize: {
            width: texture.orig.width,
            height: texture.orig.height,
          },
          isSmooth: texture.baseTexture.scaleMode !== PIXI.SCALE_MODES.NEAREST,
        });
      })();

      return () => {
        isMounted = false;
      };
    },
    [project, spritesheetResourceName, frameName]
  );

  return frameData;
};

export const getSpritesheetImageResourceName = (
  project: gdProject,
  spritesheetResourceName: string
): ?string => {
  const resourcesManager = project.getResourcesManager();
  if (!resourcesManager.hasResource(spritesheetResourceName)) return null;

  const resource = resourcesManager.getResource(spritesheetResourceName);
  const embeddedResourcesMapping = readEmbeddedResourcesMapping(resource);
  if (!embeddedResourcesMapping) return null;

  const resourceNames = Object.values(embeddedResourcesMapping).filter(
    resourceName => typeof resourceName === 'string'
  );
  return resourceNames.length ? resourceNames[0] : null;
};

export const getSpritesheetFrameImageStyle = (
  frameData: SpritesheetFrameData,
  maxWidth: ?number,
  maxHeight: ?number
) => {
  const { frame, originalSize } = frameData;
  const scale =
    maxWidth && maxHeight
      ? Math.min(
          maxWidth / originalSize.width,
          maxHeight / originalSize.height,
          1
        )
      : 1;

  return {
    objectFit: 'none',
    objectPosition: `-${frame.x}px -${frame.y}px`,
    width: originalSize.width,
    height: originalSize.height,
    maxWidth: 'none',
    maxHeight: 'none',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  };
};
