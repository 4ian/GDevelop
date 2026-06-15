// @flow
import { parseGIF, decompressFrames, type ParsedFrame } from 'gifuct-js';
import optionalRequire from './OptionalRequire';

const fs = optionalRequire('fs');
const fsPromises = fs ? fs.promises : null;
const path = optionalRequire('path');
const url = optionalRequire('url');
const fileURLToPath = url ? url.fileURLToPath : null;

const localFileProtocol = 'file://';

export const isGifPath = (pathOrUrl: string): boolean =>
  pathOrUrl
    .split('?')[0]
    .split('#')[0]
    .toLowerCase()
    .endsWith('.gif');

export const isGifResource = (
  project: gdProject,
  resourceName: string
): boolean => {
  if (
    !resourceName ||
    !project.getResourcesManager().hasResource(resourceName)
  ) {
    return isGifPath(resourceName);
  }

  const resource = project.getResourcesManager().getResource(resourceName);
  if (resource.getKind() !== 'image') return false;

  return isGifPath(resource.getFile()) || isGifPath(resource.getName());
};

const isRemoteOrDataUrl = (file: string): boolean =>
  file.startsWith('http://') ||
  file.startsWith('https://') ||
  file.startsWith('ftp://') ||
  file.startsWith('blob:') ||
  file.startsWith('data:');

const readLocalFileToArrayBuffer = async (
  filePath: string
): Promise<ArrayBuffer> => {
  if (!fsPromises) {
    throw new Error('File system is not available.');
  }

  const buffer: any = await fsPromises.readFile(filePath);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
};

const getResourceLocalFilePath = (
  project: ?gdProject,
  resourceName: string
): ?string => {
  if (!project || !path) return null;
  if (!project.getResourcesManager().hasResource(resourceName)) return null;

  const resourceFile = project
    .getResourcesManager()
    .getResource(resourceName)
    .getFile();
  if (!resourceFile || isRemoteOrDataUrl(resourceFile)) return null;
  if (path.isAbsolute(resourceFile)) return resourceFile;

  const projectFile = project.getProjectFile();
  if (!projectFile) return null;

  return path.resolve(path.dirname(projectFile), resourceFile);
};

const readGifArrayBuffer = async ({
  project,
  resourceName,
  resourceUrl,
}: {|
  project?: gdProject,
  resourceName: string,
  resourceUrl?: string,
|}): Promise<ArrayBuffer> => {
  const resourceLocalFilePath = getResourceLocalFilePath(project, resourceName);
  if (resourceLocalFilePath) {
    return readLocalFileToArrayBuffer(resourceLocalFilePath);
  }

  if (resourceUrl && resourceUrl.startsWith(localFileProtocol) && fsPromises) {
    const localFileUrl = new URL(resourceUrl);
    return readLocalFileToArrayBuffer(
      fileURLToPath
        ? fileURLToPath(localFileUrl)
        : decodeURIComponent(localFileUrl.pathname)
    );
  }

  if (!resourceUrl) {
    throw new Error(`No source found for GIF resource "${resourceName}".`);
  }

  const response = await fetch(resourceUrl);
  if (!response.ok) {
    throw new Error(
      `Unable to fetch GIF resource "${resourceName}": ${response.status}.`
    );
  }
  return response.arrayBuffer();
};

const getBackgroundColor = (
  parsedGif: any
): ?{| red: number, green: number, blue: number |} => {
  const backgroundColor =
    parsedGif.gct && parsedGif.gct[parsedGif.lsd.backgroundColorIndex];
  if (!backgroundColor) return null;

  const [red, green, blue] = backgroundColor;
  return { red, green, blue };
};

const fillWithBackgroundColor = (
  context: CanvasRenderingContext2D,
  backgroundColor: {| red: number, green: number, blue: number |},
  x: number,
  y: number,
  width: number,
  height: number
) => {
  context.fillStyle = `rgb(${backgroundColor.red}, ${backgroundColor.green}, ${
    backgroundColor.blue
  })`;
  context.fillRect(x, y, width, height);
};

const renderGifFrames = (
  arrayBuffer: ArrayBuffer
): Array<HTMLCanvasElement> => {
  const parsedGif = parseGIF(arrayBuffer);
  const frames: Array<ParsedFrame> = decompressFrames(parsedGif, true);
  if (!frames.length) {
    throw new Error('No frames were found in this GIF.');
  }

  const gifWidth = parsedGif.lsd.width;
  const gifHeight = parsedGif.lsd.height;
  const hasTransparency = frames.some(
    frame => frame.transparentIndex !== undefined
  );
  const backgroundColor = hasTransparency
    ? null
    : getBackgroundColor(parsedGif);

  const composedFrameCanvas = document.createElement('canvas');
  composedFrameCanvas.width = gifWidth;
  composedFrameCanvas.height = gifHeight;
  const composedFrameContext = composedFrameCanvas.getContext('2d');
  if (!composedFrameContext) {
    throw new Error('Unable to create a canvas context for GIF rendering.');
  }

  if (backgroundColor) {
    fillWithBackgroundColor(
      composedFrameContext,
      backgroundColor,
      0,
      0,
      gifWidth,
      gifHeight
    );
  }

  const renderedFrameCanvases = [];
  for (const frame of frames) {
    const { dims, patch, disposalType } = frame;
    if (!patch) continue;

    const previousFrameImageData =
      disposalType === 3
        ? composedFrameContext.getImageData(0, 0, gifWidth, gifHeight)
        : null;

    composedFrameContext.putImageData(
      new ImageData(patch, dims.width, dims.height),
      dims.left,
      dims.top
    );

    const renderedFrameCanvas = document.createElement('canvas');
    renderedFrameCanvas.width = gifWidth;
    renderedFrameCanvas.height = gifHeight;
    const renderedFrameContext = renderedFrameCanvas.getContext('2d');
    if (!renderedFrameContext) {
      throw new Error('Unable to create a canvas context for GIF rendering.');
    }
    renderedFrameContext.drawImage(composedFrameCanvas, 0, 0);
    renderedFrameCanvases.push(renderedFrameCanvas);

    if (disposalType === 2) {
      composedFrameContext.clearRect(
        dims.left,
        dims.top,
        dims.width,
        dims.height
      );
      if (backgroundColor) {
        fillWithBackgroundColor(
          composedFrameContext,
          backgroundColor,
          dims.left,
          dims.top,
          dims.width,
          dims.height
        );
      }
    } else if (disposalType === 3 && previousFrameImageData) {
      composedFrameContext.putImageData(previousFrameImageData, 0, 0);
    }
  }

  if (!renderedFrameCanvases.length) {
    throw new Error('No renderable frames were found in this GIF.');
  }

  return renderedFrameCanvases;
};

const gifFrameCanvasPromises: {
  [string]: Promise<Array<HTMLCanvasElement>>,
} = {};
const gifFrameDataUrlPromises: { [string]: Promise<string> } = {};

const getCacheKey = ({
  project,
  resourceName,
  resourceUrl,
}: {|
  project?: gdProject,
  resourceName: string,
  resourceUrl?: string,
|}) => {
  const projectKey = project ? String(project.ptr) : 'no-project';
  return `${projectKey}:${resourceName}:${resourceUrl || ''}`;
};

export const getRenderedGifFrameCanvases = ({
  project,
  resourceName,
  resourceUrl,
}: {|
  project?: gdProject,
  resourceName: string,
  resourceUrl?: string,
|}): Promise<Array<HTMLCanvasElement>> => {
  const cacheKey = getCacheKey({ project, resourceName, resourceUrl });
  if (gifFrameCanvasPromises[cacheKey]) {
    return gifFrameCanvasPromises[cacheKey];
  }

  gifFrameCanvasPromises[cacheKey] = readGifArrayBuffer({
    project,
    resourceName,
    resourceUrl,
  }).then(renderGifFrames);
  return gifFrameCanvasPromises[cacheKey];
};

export const getRenderedGifFrameDataUrl = (
  options: {|
    project?: gdProject,
    resourceName: string,
    resourceUrl?: string,
  |},
  imageFrameIndex: number
): Promise<string> => {
  const cacheKey = `${getCacheKey(options)}:${imageFrameIndex}`;
  if (gifFrameDataUrlPromises[cacheKey]) {
    return gifFrameDataUrlPromises[cacheKey];
  }

  gifFrameDataUrlPromises[cacheKey] = getRenderedGifFrameCanvases(options).then(
    frameCanvases => {
      const wrappedFrameIndex =
        ((imageFrameIndex % frameCanvases.length) + frameCanvases.length) %
        frameCanvases.length;
      return frameCanvases[wrappedFrameIndex].toDataURL('image/png');
    }
  );
  return gifFrameDataUrlPromises[cacheKey];
};
