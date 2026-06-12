// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import Background from '../UI/Background';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import ColorField from '../UI/ColorField';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
import Link from '../UI/Link';
import { Tabs } from '../UI/Tabs';
import PreferencesContext, {
  defaultResourcesToolsSettings,
  type ResourcesToolsSettings,
} from '../MainFrame/Preferences/PreferencesContext';
import SparkleIcon from '../UI/CustomSvgIcons/Sparkle';
import MusicIcon from '../UI/CustomSvgIcons/Music';
import PictureIcon from '../UI/CustomSvgIcons/Picture';
import CrossIcon from '../UI/CustomSvgIcons/Cross';
import RectangleIcon from '../UI/CustomSvgIcons/Rectangle';
import HorizontalSizeIcon from '../UI/CustomSvgIcons/HorizontalSize';
import {
  getFileUrl,
  getProjectRootPath,
  normalizeSlashes,
  type ProjectFileSelection,
} from './ProjectFilesPanel';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
import { openFilePicker } from '../Utils/FileSystem';
import { type WorkingDeskToolTabUpdate } from './WorkingDeskTabTypes';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import {
  drawLocalImageOperationToCanvas,
  getLocalImageOutputBaseName,
  shouldDisableLocalImageApplyButton,
  type LocalImageCrop,
  type LocalImageExpandDirection,
  type LocalImageOperation,
  type LocalImageSize,
} from './LocalImageTools';

const fs = optionalRequire('fs');
const path = optionalRequire('path');
const buffer = optionalRequire('buffer');
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const projectFileDragDataMimeType = 'application/x-gdevelop-project-file';
const imageExtenderGitHubUrl = 'https://github.com/zhouzhipeng/image-extender';
const aiGameWorkbenchGitHubUrl =
  'https://github.com/zhouzhipeng/ai_game_workbench';

type Props = {|
  project: gdProject,
  selectedItem: ?ProjectFileSelection,
  onOpenWorkingDeskTask: WorkingDeskToolTabUpdate => void,
  onProjectFilesChanged: () => Promise<void> | void,
|};

type ToolCategory = 'image' | 'sound';
type ImageTool =
  | 'nano-banana'
  | 'local-tools'
  | 'image-extender'
  | 'ai-game-workbench';
type SoundTool = 'elevenlabs';
export type ImageAttachment = {|
  absolutePath: string,
  name: string,
  extension: string,
|};
export type NanoBananaDebugDetails = {|
  statusText: ?string,
  requestText: string,
  responseText: string,
  generatedImagePath: ?string,
  generatedImageUrl: ?string,
|};
type NanoBananaRequestDebugInfo = {|
  method: string,
  url: string,
  headers: { [string]: string },
  body: any,
|};
type NanoBananaResponseDebugPayload = {|
  ok?: boolean,
  status?: number,
  statusText?: string,
  body?: any,
  errorMessage?: string,
|};
type NanoBananaResponseDebugInfo = ?NanoBananaResponseDebugPayload;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  header: {
    padding: '10px 10px 8px',
  },
  tabs: {
    flex: '0 0 auto',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    gap: 8,
    overflow: 'auto',
    minHeight: 0,
  },
  segmentedRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  toolSelector: {
    marginBottom: 4,
  },
  attachmentField: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    gap: 12,
    padding: 10,
    borderRadius: 4,
    border: '1px solid rgba(128, 128, 128, 0.35)',
    backgroundColor: 'rgba(128, 128, 128, 0.08)',
  },
  attachmentFieldDropTarget: {
    border: '1px solid var(--theme-primary-color)',
    backgroundColor: 'rgba(128, 128, 128, 0.16)',
  },
  attachmentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: '1 1 260px',
    minWidth: 0,
  },
  attachmentSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  attachmentPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 220px',
    minHeight: 150,
    maxHeight: 220,
    minWidth: 160,
    padding: 8,
    borderRadius: 4,
    border: '1px solid rgba(128, 128, 128, 0.28)',
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  attachmentPreviewImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 8,
  },
  resultPreview: {
    maxWidth: '100%',
    maxHeight: 260,
    objectFit: 'contain',
  },
};

const getMimeType = (extension: string): string => {
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.bmp':
      return 'image/bmp';
    default:
      return 'image/png';
  }
};

const imageAttachmentFileExtensions = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'bmp',
  'svg',
];

export const createImageAttachmentFromFilePath = (
  filePath: string
): ?ImageAttachment => {
  if (!path) return null;
  const extension = path.extname(filePath).toLowerCase();
  if (!imageAttachmentFileExtensions.includes(extension.replace('.', ''))) {
    return null;
  }

  return {
    absolutePath: filePath,
    name: path.basename(filePath),
    extension,
  };
};

export const createImageAttachmentFromProjectFileDragData = (
  dragData: string
): ?ImageAttachment => {
  try {
    const parsedDragData = JSON.parse(dragData);
    if (
      !parsedDragData ||
      parsedDragData.type !== 'file' ||
      typeof parsedDragData.absolutePath !== 'string'
    ) {
      return null;
    }

    return createImageAttachmentFromFilePath(parsedDragData.absolutePath);
  } catch (error) {
    return null;
  }
};

export const hasProjectFileDragData = (dataTransferTypes: any): boolean => {
  if (!dataTransferTypes) return false;

  if (typeof dataTransferTypes.includes === 'function') {
    return dataTransferTypes.includes(projectFileDragDataMimeType);
  }

  if (typeof dataTransferTypes.contains === 'function') {
    return dataTransferTypes.contains(projectFileDragDataMimeType);
  }

  for (let index = 0; index < dataTransferTypes.length; index++) {
    if (dataTransferTypes[index] === projectFileDragDataMimeType) {
      return true;
    }
  }

  return false;
};

export const getImageAttachmentPreviewUrl = (
  imageAttachment: ?ImageAttachment
): ?string =>
  imageAttachment ? getFileUrl(imageAttachment.absolutePath) : null;

export const shouldShowClearImageAttachmentButton = (
  imageAttachment: ?ImageAttachment
): boolean => !!imageAttachment;

export const getImageAttachmentErrorMessage = ({
  imageAttachment,
  action,
}: {|
  imageAttachment: ?ImageAttachment,
  action: 'select' | 'clear',
|}): ?string => {
  if (action === 'clear' || imageAttachment) return null;
  return 'Choose a supported image file.';
};

export const buildNanoBananaRequestParts = ({
  prompt,
  imageMimeType,
  imageData,
}: {|
  prompt: string,
  imageMimeType?: string,
  imageData?: string,
|}): Array<Object> => {
  const parts: Array<Object> = [{ text: prompt }];
  if (imageMimeType && imageData) {
    parts.push({
      inline_data: {
        mime_type: imageMimeType,
        data: imageData,
      },
    });
  }
  return parts;
};

const stringifyDebugPayload = (payload: any): string => {
  if (typeof payload === 'string') return payload;
  try {
    return JSON.stringify(payload, null, 2);
  } catch (error) {
    return String(payload);
  }
};

const buildNanoBananaRequestText = (
  request: NanoBananaRequestDebugInfo
): string =>
  [
    `${request.method} ${request.url}`,
    '',
    'Headers:',
    stringifyDebugPayload(request.headers),
    '',
    'Body:',
    stringifyDebugPayload(request.body),
  ].join('\n');

const buildNanoBananaResponseText = (
  response: NanoBananaResponseDebugInfo
): string =>
  response
    ? [
        typeof response.status === 'number'
          ? `HTTP ${response.status} ${response.statusText || ''}`.trim()
          : 'HTTP response',
        typeof response.ok === 'boolean' ? `ok: ${String(response.ok)}` : null,
        response.errorMessage ? `error: ${response.errorMessage}` : null,
        '',
        'Body:',
        stringifyDebugPayload(response.body),
      ]
        .filter(Boolean)
        .join('\n')
    : 'No HTTP response was received.';

export const buildNanoBananaProgressDebugDetails = ({
  statusText,
  request,
  responseText,
}: {|
  statusText: string,
  request?: ?NanoBananaRequestDebugInfo,
  responseText?: string,
|}): NanoBananaDebugDetails => ({
  statusText,
  requestText: request
    ? buildNanoBananaRequestText(request)
    : 'Preparing HTTP request...',
  responseText: responseText || 'Waiting for HTTP response...',
  generatedImagePath: null,
  generatedImageUrl: null,
});

export const buildNanoBananaDebugDetails = ({
  request,
  response,
  generatedImagePath,
  generatedImageUrl,
  statusText,
}: {|
  request: NanoBananaRequestDebugInfo,
  response: NanoBananaResponseDebugInfo,
  generatedImagePath?: ?string,
  generatedImageUrl?: ?string,
  statusText?: ?string,
|}): NanoBananaDebugDetails => {
  return {
    statusText: statusText || null,
    requestText: buildNanoBananaRequestText(request),
    responseText: buildNanoBananaResponseText(response),
    generatedImagePath: generatedImagePath || null,
    generatedImageUrl: generatedImageUrl || null,
  };
};

export const shouldDisableNanoBananaButton = ({
  isGeneratingImage,
}: {|
  isGeneratingImage: boolean,
|}): boolean => isGeneratingImage;

export const shouldDisableElevenLabsButton = ({
  isGeneratingAudio,
  elevenLabsApiKey,
  elevenLabsText,
}: {|
  isGeneratingAudio: boolean,
  elevenLabsApiKey: string,
  elevenLabsText: string,
|}): boolean =>
  isGeneratingAudio || !elevenLabsApiKey.trim() || !elevenLabsText.trim();

const getAudioExtensionFromOutputFormat = (outputFormat: string): string => {
  if (outputFormat.indexOf('wav') === 0) return '.wav';
  if (outputFormat.indexOf('ogg') === 0) return '.ogg';
  if (outputFormat.indexOf('pcm') === 0) return '.wav';
  return '.mp3';
};

const getUniqueOutputPath = async ({
  folderPath,
  baseName,
  extension,
}: {|
  folderPath: string,
  baseName: string,
  extension: string,
|}): Promise<string> => {
  for (let index = 0; index < 10000; index++) {
    const fileName =
      index === 0
        ? `${baseName}${extension}`
        : `${baseName}-${index + 1}${extension}`;
    const candidatePath = path.join(folderPath, fileName);
    try {
      await fs.promises.access(candidatePath);
    } catch (error) {
      return candidatePath;
    }
  }
  throw new Error('Unable to create an output file path.');
};

const getRelativeProjectFilePath = (
  project: gdProject,
  absolutePath: string
): ?string => {
  if (!path) return null;
  const projectRoot = getProjectRootPath(project);
  if (!projectRoot) return null;

  const relativeFilePath = normalizeSlashes(
    path.relative(projectRoot, absolutePath)
  );
  if (relativeFilePath.indexOf('..') === 0) return null;
  return relativeFilePath;
};

export const getGeneratedImagesFolderPath = (projectRootPath: string): string =>
  path
    ? path.join(projectRootPath, 'generated')
    : `${projectRootPath}/generated`;

const getImageGenerationOutputFolderPath = async ({
  project,
}: {|
  project: gdProject,
|}): Promise<string> => {
  if (!fs || !path) {
    throw new Error('Filesystem paths are not supported.');
  }
  const projectRootPath = getProjectRootPath(project);
  if (!projectRootPath) {
    throw new Error('Save the project before generating media.');
  }

  const generatedFolderPath = getGeneratedImagesFolderPath(projectRootPath);
  await fs.promises.mkdir(generatedFolderPath, { recursive: true });
  return generatedFolderPath;
};

const loadImageFromUrl = (imageUrl: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load the image.'));
    image.src = imageUrl;
  });

const canvasToPngBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Unable to encode the image as PNG.'));
    }, 'image/png');
  });

const blobToBuffer = (blob: Blob): Promise<any> =>
  new Promise((resolve, reject) => {
    if (!buffer || !buffer.Buffer) {
      reject(new Error('Binary buffers are not supported.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (!(result instanceof ArrayBuffer)) {
        reject(new Error('Unable to read the generated image.'));
        return;
      }
      resolve(buffer.Buffer.from(result));
    };
    reader.onerror = () =>
      reject(reader.error || new Error('Unable to read the generated image.'));
    reader.onabort = () => reject(new Error('Read aborted'));
    reader.readAsArrayBuffer(blob);
  });

const parsePixelField = (value: string): number => {
  const parsedValue = parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const getResourcesToolsSettingsWithDefaults = (
  settings: any
): ResourcesToolsSettings => ({
  activeToolCategory:
    settings && settings.activeToolCategory === 'sound'
      ? 'sound'
      : defaultResourcesToolsSettings.activeToolCategory,
  selectedImageTool:
    settings &&
    (settings.selectedImageTool === 'local-tools' ||
      settings.selectedImageTool === 'image-extender' ||
      settings.selectedImageTool === 'ai-game-workbench')
      ? settings.selectedImageTool
      : defaultResourcesToolsSettings.selectedImageTool,
  selectedSoundTool: defaultResourcesToolsSettings.selectedSoundTool,
  geminiApiKey:
    settings && typeof settings.geminiApiKey === 'string'
      ? settings.geminiApiKey
      : defaultResourcesToolsSettings.geminiApiKey,
  nanoBananaModel:
    settings && typeof settings.nanoBananaModel === 'string'
      ? settings.nanoBananaModel
      : defaultResourcesToolsSettings.nanoBananaModel,
  nanoBananaPrompt:
    settings && typeof settings.nanoBananaPrompt === 'string'
      ? settings.nanoBananaPrompt
      : defaultResourcesToolsSettings.nanoBananaPrompt,
  imageAttachmentPath:
    settings && typeof settings.imageAttachmentPath === 'string'
      ? settings.imageAttachmentPath
      : defaultResourcesToolsSettings.imageAttachmentPath,
  elevenLabsApiKey:
    settings && typeof settings.elevenLabsApiKey === 'string'
      ? settings.elevenLabsApiKey
      : defaultResourcesToolsSettings.elevenLabsApiKey,
  elevenLabsMode:
    settings && settings.elevenLabsMode === 'text-to-speech'
      ? 'text-to-speech'
      : defaultResourcesToolsSettings.elevenLabsMode,
  elevenLabsText:
    settings && typeof settings.elevenLabsText === 'string'
      ? settings.elevenLabsText
      : defaultResourcesToolsSettings.elevenLabsText,
  elevenLabsVoiceId:
    settings && typeof settings.elevenLabsVoiceId === 'string'
      ? settings.elevenLabsVoiceId
      : defaultResourcesToolsSettings.elevenLabsVoiceId,
  elevenLabsModel:
    settings && typeof settings.elevenLabsModel === 'string'
      ? settings.elevenLabsModel
      : defaultResourcesToolsSettings.elevenLabsModel,
  elevenLabsSoundModel:
    settings && typeof settings.elevenLabsSoundModel === 'string'
      ? settings.elevenLabsSoundModel
      : defaultResourcesToolsSettings.elevenLabsSoundModel,
  elevenLabsOutputFormat:
    settings && typeof settings.elevenLabsOutputFormat === 'string'
      ? settings.elevenLabsOutputFormat
      : defaultResourcesToolsSettings.elevenLabsOutputFormat,
  elevenLabsDuration:
    settings && typeof settings.elevenLabsDuration === 'string'
      ? settings.elevenLabsDuration
      : defaultResourcesToolsSettings.elevenLabsDuration,
});

export const buildResourcesToolsSettings = ({
  activeToolCategory,
  selectedImageTool,
  selectedSoundTool,
  geminiApiKey,
  nanoBananaModel,
  nanoBananaPrompt,
  imageAttachment,
  elevenLabsApiKey,
  elevenLabsMode,
  elevenLabsText,
  elevenLabsVoiceId,
  elevenLabsModel,
  elevenLabsSoundModel,
  elevenLabsOutputFormat,
  elevenLabsDuration,
}: {|
  activeToolCategory: ToolCategory,
  selectedImageTool: ImageTool,
  selectedSoundTool: SoundTool,
  geminiApiKey: string,
  nanoBananaModel: string,
  nanoBananaPrompt: string,
  imageAttachment: ?ImageAttachment,
  elevenLabsApiKey: string,
  elevenLabsMode: 'sound-effect' | 'text-to-speech',
  elevenLabsText: string,
  elevenLabsVoiceId: string,
  elevenLabsModel: string,
  elevenLabsSoundModel: string,
  elevenLabsOutputFormat: string,
  elevenLabsDuration: string,
|}): ResourcesToolsSettings =>
  getResourcesToolsSettingsWithDefaults({
    activeToolCategory,
    selectedImageTool,
    selectedSoundTool,
    geminiApiKey,
    nanoBananaModel,
    nanoBananaPrompt,
    imageAttachmentPath: imageAttachment ? imageAttachment.absolutePath : '',
    elevenLabsApiKey,
    elevenLabsMode,
    elevenLabsText,
    elevenLabsVoiceId,
    elevenLabsModel,
    elevenLabsSoundModel,
    elevenLabsOutputFormat,
    elevenLabsDuration,
  });

const ToolsPanel = ({
  project,
  selectedItem,
  onOpenWorkingDeskTask,
  onProjectFilesChanged,
}: Props): React.Node => {
  const preferences = React.useContext(PreferencesContext);
  const savedToolsSettings = React.useMemo(
    () =>
      getResourcesToolsSettingsWithDefaults(
        preferences.values.resourcesToolsSettings
      ),
    [preferences.values.resourcesToolsSettings]
  );
  const setMultiplePreferenceValues = preferences.setMultipleValues;
  const selectedNode = selectedItem ? selectedItem.node : null;
  const [
    activeToolCategory,
    setActiveToolCategory,
  ] = React.useState<ToolCategory>(savedToolsSettings.activeToolCategory);
  const [selectedImageTool, setSelectedImageTool] = React.useState<ImageTool>(
    savedToolsSettings.selectedImageTool
  );
  const [selectedSoundTool, setSelectedSoundTool] = React.useState<SoundTool>(
    savedToolsSettings.selectedSoundTool
  );
  const [geminiApiKey, setGeminiApiKey] = React.useState(
    savedToolsSettings.geminiApiKey
  );
  const [nanoBananaModel, setNanoBananaModel] = React.useState(
    savedToolsSettings.nanoBananaModel
  );
  const [nanoBananaPrompt, setNanoBananaPrompt] = React.useState(
    savedToolsSettings.nanoBananaPrompt
  );
  const [
    imageAttachment,
    setImageAttachment,
  ] = React.useState<?ImageAttachment>(
    createImageAttachmentFromFilePath(savedToolsSettings.imageAttachmentPath)
  );
  const [
    isImageAttachmentDragOver,
    setIsImageAttachmentDragOver,
  ] = React.useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [
    imageGenerationStatus,
    setImageGenerationStatus,
  ] = React.useState<?string>(null);
  const [
    imageGenerationError,
    setImageGenerationError,
  ] = React.useState<?string>(null);
  const [imageExtenderStatus, setImageExtenderStatus] = React.useState<?string>(
    null
  );
  const [imageExtenderError, setImageExtenderError] = React.useState<?string>(
    null
  );
  const [
    aiGameWorkbenchStatus,
    setAiGameWorkbenchStatus,
  ] = React.useState<?string>(null);
  const [
    aiGameWorkbenchError,
    setAiGameWorkbenchError,
  ] = React.useState<?string>(null);
  const [
    localImageOperation,
    setLocalImageOperation,
  ] = React.useState<LocalImageOperation>('crop');
  const [localCropX, setLocalCropX] = React.useState('0');
  const [localCropY, setLocalCropY] = React.useState('0');
  const [localCropWidth, setLocalCropWidth] = React.useState('0');
  const [localCropHeight, setLocalCropHeight] = React.useState('0');
  const [
    localExpandDirection,
    setLocalExpandDirection,
  ] = React.useState<LocalImageExpandDirection>('right');
  const [localExpandAmount, setLocalExpandAmount] = React.useState('32');
  const [localExpandFillColor, setLocalExpandFillColor] = React.useState(
    '0;0;0'
  );
  const [
    localExpandFillAlpha,
    setLocalExpandFillAlpha,
  ] = React.useState<number>(0);
  const [localImageSize, setLocalImageSize] = React.useState<?LocalImageSize>(
    null
  );
  const [isProcessingLocalImage, setIsProcessingLocalImage] = React.useState(
    false
  );
  const [localImageStatus, setLocalImageStatus] = React.useState<?string>(null);
  const [localImageError, setLocalImageError] = React.useState<?string>(null);
  const [localImageResultUrl, setLocalImageResultUrl] = React.useState<?string>(
    null
  );
  const [
    localImageResultPath,
    setLocalImageResultPath,
  ] = React.useState<?string>(null);
  const [elevenLabsApiKey, setElevenLabsApiKey] = React.useState(
    savedToolsSettings.elevenLabsApiKey
  );
  const [elevenLabsMode, setElevenLabsMode] = React.useState<
    'sound-effect' | 'text-to-speech'
  >(savedToolsSettings.elevenLabsMode);
  const [elevenLabsText, setElevenLabsText] = React.useState(
    savedToolsSettings.elevenLabsText
  );
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = React.useState(
    savedToolsSettings.elevenLabsVoiceId
  );
  const [elevenLabsModel, setElevenLabsModel] = React.useState(
    savedToolsSettings.elevenLabsModel
  );
  const [elevenLabsSoundModel, setElevenLabsSoundModel] = React.useState(
    savedToolsSettings.elevenLabsSoundModel
  );
  const [elevenLabsOutputFormat, setElevenLabsOutputFormat] = React.useState(
    savedToolsSettings.elevenLabsOutputFormat
  );
  const [elevenLabsDuration, setElevenLabsDuration] = React.useState(
    savedToolsSettings.elevenLabsDuration
  );
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false);
  const [
    audioGenerationStatus,
    setAudioGenerationStatus,
  ] = React.useState<?string>(null);
  const [
    audioGenerationError,
    setAudioGenerationError,
  ] = React.useState<?string>(null);

  React.useEffect(
    () => {
      setMultiplePreferenceValues({
        resourcesToolsSettings: buildResourcesToolsSettings({
          activeToolCategory,
          selectedImageTool,
          selectedSoundTool,
          geminiApiKey,
          nanoBananaModel,
          nanoBananaPrompt,
          imageAttachment,
          elevenLabsApiKey,
          elevenLabsMode,
          elevenLabsText,
          elevenLabsVoiceId,
          elevenLabsModel,
          elevenLabsSoundModel,
          elevenLabsOutputFormat,
          elevenLabsDuration,
        }),
      });
    },
    [
      activeToolCategory,
      selectedImageTool,
      selectedSoundTool,
      geminiApiKey,
      nanoBananaModel,
      nanoBananaPrompt,
      imageAttachment,
      elevenLabsApiKey,
      elevenLabsMode,
      elevenLabsText,
      elevenLabsVoiceId,
      elevenLabsModel,
      elevenLabsSoundModel,
      elevenLabsOutputFormat,
      elevenLabsDuration,
      setMultiplePreferenceValues,
    ]
  );

  React.useEffect(
    () => {
      setImageGenerationStatus(null);
      setImageGenerationError(null);
      setImageExtenderStatus(null);
      setImageExtenderError(null);
      setAiGameWorkbenchStatus(null);
      setAiGameWorkbenchError(null);
      setAudioGenerationStatus(null);
      setAudioGenerationError(null);
      setLocalImageStatus(null);
      setLocalImageError(null);
    },
    [selectedNode]
  );

  React.useEffect(
    () => {
      if (selectedImageTool !== 'local-tools' || !selectedNode) return;
      if (selectedNode.type !== 'file') return;

      const selectedImageAttachment = createImageAttachmentFromFilePath(
        selectedNode.absolutePath
      );
      if (!selectedImageAttachment) return;
      if (
        imageAttachment &&
        imageAttachment.absolutePath === selectedImageAttachment.absolutePath
      ) {
        return;
      }

      setImageAttachment(selectedImageAttachment);
    },
    [imageAttachment, selectedImageTool, selectedNode]
  );

  React.useEffect(
    () => {
      let isMounted = true;
      setLocalImageSize(null);
      setLocalImageResultUrl(null);
      setLocalImageResultPath(null);
      setLocalImageStatus(null);
      setLocalImageError(null);

      const imageUrl = getImageAttachmentPreviewUrl(imageAttachment);
      if (!imageUrl) return;

      loadImageFromUrl(imageUrl)
        .then(image => {
          if (!isMounted) return;
          const sourceSize = {
            width: image.naturalWidth || image.width,
            height: image.naturalHeight || image.height,
          };
          setLocalImageSize(sourceSize);
          setLocalCropX('0');
          setLocalCropY('0');
          setLocalCropWidth(String(sourceSize.width));
          setLocalCropHeight(String(sourceSize.height));
        })
        .catch(error => {
          if (!isMounted) return;
          setLocalImageError(
            error && error.message ? error.message : String(error)
          );
        });

      return () => {
        isMounted = false;
      };
    },
    [imageAttachment]
  );

  const attachImage = React.useCallback((imageAttachment: ?ImageAttachment) => {
    const errorMessage = getImageAttachmentErrorMessage({
      imageAttachment,
      action: 'select',
    });
    if (errorMessage) {
      setImageGenerationError(errorMessage);
      setLocalImageError(errorMessage);
      return;
    }

    setImageAttachment(imageAttachment);
    setImageGenerationError(null);
    setImageGenerationStatus(null);
    setLocalImageError(null);
    setLocalImageStatus(null);
  }, []);

  const clearImageAttachment = React.useCallback(() => {
    setImageAttachment(null);
    setImageGenerationError(
      getImageAttachmentErrorMessage({
        imageAttachment: null,
        action: 'clear',
      })
    );
    setImageGenerationStatus(null);
    setLocalImageError(null);
    setLocalImageStatus(null);
    setLocalImageResultUrl(null);
    setLocalImageResultPath(null);
  }, []);

  const selectImageAttachment = React.useCallback(
    async () => {
      try {
        const filePath = await openFilePicker({
          title: 'Choose an attached image',
          properties: ['openFile'],
          message:
            selectedImageTool === 'local-tools'
              ? 'Choose an image to edit locally.'
              : 'Choose an image to use as the AI input.',
          filters: [
            {
              name: 'Images',
              extensions: imageAttachmentFileExtensions,
            },
          ],
        });
        if (!filePath || typeof filePath !== 'string') return;

        attachImage(createImageAttachmentFromFilePath(filePath));
      } catch (error) {
        const errorMessage =
          error && error.message
            ? error.message
            : 'Unable to choose an attached image.';
        setImageGenerationError(errorMessage);
        setLocalImageError(errorMessage);
      }
    },
    [attachImage, selectedImageTool]
  );

  const getImageAttachmentFromDragEvent = React.useCallback(
    (event: any): ?ImageAttachment => {
      return createImageAttachmentFromProjectFileDragData(
        event.dataTransfer.getData(projectFileDragDataMimeType)
      );
    },
    []
  );

  const handleImageAttachmentDragOver = React.useCallback((event: any) => {
    if (!hasProjectFileDragData(event.dataTransfer.types)) return;

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setIsImageAttachmentDragOver(true);
  }, []);

  const handleImageAttachmentDragLeave = React.useCallback((event: any) => {
    const relatedTarget = event.relatedTarget;
    if (
      relatedTarget &&
      event.currentTarget &&
      event.currentTarget.contains(relatedTarget)
    ) {
      return;
    }
    setIsImageAttachmentDragOver(false);
  }, []);

  const handleImageAttachmentDrop = React.useCallback(
    (event: any) => {
      if (!hasProjectFileDragData(event.dataTransfer.types)) return;

      event.preventDefault();
      event.stopPropagation();
      setIsImageAttachmentDragOver(false);

      const imageAttachment = getImageAttachmentFromDragEvent(event);
      if (!imageAttachment) return;

      attachImage(imageAttachment);
    },
    [attachImage, getImageAttachmentFromDragEvent]
  );

  const runNanoBanana = React.useCallback(
    async () => {
      const taskTabId = `nano-banana:${Date.now()}`;
      const updateWorkingDeskTask = ({
        details,
        status,
        errorText,
      }: {|
        details: NanoBananaDebugDetails,
        status: 'running' | 'success' | 'error',
        errorText?: ?string,
      |}) => {
        onOpenWorkingDeskTask({
          id: taskTabId,
          kind: 'nano-banana',
          title: 'Nano Banana',
          status,
          statusText: details.statusText,
          requestText: details.requestText,
          responseText: details.responseText,
          generatedImagePath: details.generatedImagePath
            ? normalizeSlashes(details.generatedImagePath)
            : null,
          generatedImageUrl: details.generatedImageUrl,
          errorText: errorText || null,
        });
      };
      const updateProgressDetails = (statusText: string) => {
        updateWorkingDeskTask({
          status: 'running',
          details: buildNanoBananaProgressDebugDetails({
            statusText,
            request: requestDebugInfo,
          }),
        });
      };
      const failBeforeRequest = (errorMessage: string) => {
        updateWorkingDeskTask({
          status: 'error',
          errorText: errorMessage,
          details: buildNanoBananaProgressDebugDetails({
            statusText: 'Nano Banana request failed.',
            responseText: `error: ${errorMessage}`,
          }),
        });
        setImageGenerationError(errorMessage);
      };

      let requestDebugInfo: ?NanoBananaRequestDebugInfo = null;
      let latestResponseDebugInfo: ?NanoBananaResponseDebugPayload = null;
      const openDebugDetails = ({
        response,
        generatedImagePath,
        generatedImageUrl,
        statusText,
        status,
        errorText,
      }: {|
        response: NanoBananaResponseDebugInfo,
        generatedImagePath?: ?string,
        generatedImageUrl?: ?string,
        statusText?: ?string,
        status: 'running' | 'success' | 'error',
        errorText?: ?string,
      |}) => {
        if (!requestDebugInfo) return;
        updateWorkingDeskTask({
          status,
          errorText,
          details: buildNanoBananaDebugDetails({
            request: requestDebugInfo,
            response,
            generatedImagePath,
            generatedImageUrl,
            statusText,
          }),
        });
      };

      updateProgressDetails('Preparing Nano Banana request...');

      if (!fs || !path) {
        failBeforeRequest('Filesystem paths are not supported.');
        return;
      }
      if (!geminiApiKey.trim()) {
        failBeforeRequest('Enter a Gemini API key.');
        return;
      }
      if (!nanoBananaPrompt.trim()) {
        failBeforeRequest('Enter a prompt.');
        return;
      }

      setIsGeneratingImage(true);
      setImageGenerationError(null);
      setImageGenerationStatus(null);

      try {
        const imageData = imageAttachment
          ? await fs.promises.readFile(imageAttachment.absolutePath, 'base64')
          : null;
        const model = nanoBananaModel.trim().replace(/^models\//, '');
        const endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;
        const requestBody = {
          contents: [
            {
              parts: buildNanoBananaRequestParts({
                prompt: nanoBananaPrompt,
                imageMimeType: imageAttachment
                  ? getMimeType(imageAttachment.extension)
                  : undefined,
                imageData: imageData || undefined,
              }),
            },
          ],
        };
        const requestHeaders = {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey.trim(),
        };
        requestDebugInfo = {
          method: 'POST',
          url: endpoint,
          headers: requestHeaders,
          body: requestBody,
        };
        updateProgressDetails('Sending Nano Banana HTTP request...');
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
        });
        openDebugDetails({
          response: {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            body: 'Reading response body...',
          },
          status: 'running',
          statusText: 'Reading Nano Banana HTTP response...',
        });
        const responseText = await response.text();
        let responseBody: any;
        try {
          responseBody = responseText ? JSON.parse(responseText) : null;
        } catch (error) {
          responseBody = responseText;
        }
        const responseDebugInfo: NanoBananaResponseDebugPayload = {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          body: responseBody,
        };
        latestResponseDebugInfo = responseDebugInfo;
        if (!response.ok) {
          const responseErrorMessage =
            responseBody &&
            typeof responseBody === 'object' &&
            responseBody.error &&
            typeof responseBody.error === 'object' &&
            typeof responseBody.error.message === 'string'
              ? responseBody.error.message
              : null;
          const errorMessage: string =
            responseErrorMessage ||
            `Request failed with HTTP ${response.status}`;
          openDebugDetails({
            response: {
              ...responseDebugInfo,
              errorMessage,
            },
            status: 'error',
            statusText: 'Nano Banana request failed.',
            errorText: errorMessage,
          });
          throw new Error(errorMessage);
        }

        const responseObject =
          responseBody && typeof responseBody === 'object' ? responseBody : {};
        const candidate =
          responseObject.candidates &&
          responseObject.candidates[0] &&
          responseObject.candidates[0].content;
        const responseParts =
          candidate && candidate.parts ? candidate.parts : [];
        const imagePart = responseParts.find(
          part => part.inlineData || part.inline_data
        );
        if (!imagePart) {
          const textPart = responseParts.find(part => part.text);
          const errorMessage = textPart
            ? textPart.text
            : 'The response did not include an image.';
          openDebugDetails({
            response: responseDebugInfo,
            status: 'error',
            statusText: 'HTTP response received, but no image was returned.',
            errorText: errorMessage,
          });
          setImageGenerationStatus(errorMessage);
          return;
        }

        const inlineData = imagePart.inlineData || imagePart.inline_data;
        const mimeType =
          inlineData.mimeType || inlineData.mime_type || 'image/png';
        const outputExtension = mimeType === 'image/jpeg' ? '.jpg' : '.png';
        openDebugDetails({
          response: responseDebugInfo,
          status: 'running',
          statusText: 'Saving generated image...',
        });
        const outputFolderPath = await getImageGenerationOutputFolderPath({
          project,
        });
        const outputBaseName = imageAttachment
          ? `${path.basename(
              imageAttachment.name,
              imageAttachment.extension
            )}-nano-banana`
          : 'nano-banana';
        const outputPath = await getUniqueOutputPath({
          folderPath: outputFolderPath,
          baseName: outputBaseName,
          extension: outputExtension,
        });
        await fs.promises.writeFile(outputPath, inlineData.data, 'base64');
        openDebugDetails({
          response: responseDebugInfo,
          generatedImagePath: outputPath,
          generatedImageUrl: getFileUrl(outputPath),
          status: 'success',
          statusText: 'Nano Banana request completed.',
        });
        setImageGenerationStatus(`Generated ${normalizeSlashes(outputPath)}`);
        await onProjectFilesChanged();
      } catch (error) {
        const errorMessage =
          error && error.message ? error.message : String(error);
        if (requestDebugInfo) {
          openDebugDetails({
            response: latestResponseDebugInfo
              ? {
                  ...latestResponseDebugInfo,
                  errorMessage,
                }
              : {
                  errorMessage,
                },
            status: 'error',
            statusText: 'Nano Banana request failed.',
            errorText: errorMessage,
          });
        } else {
          failBeforeRequest(errorMessage);
        }
        setImageGenerationError(errorMessage);
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [
      geminiApiKey,
      imageAttachment,
      nanoBananaModel,
      nanoBananaPrompt,
      onOpenWorkingDeskTask,
      onProjectFilesChanged,
      project,
    ]
  );

  const runElevenLabs = React.useCallback(
    async () => {
      const taskTabId = `elevenlabs-audio:${Date.now()}`;
      const updateWorkingDeskTask = ({
        status,
        statusText,
        requestText,
        responseText,
        generatedAudioPath,
        generatedAudioUrl,
        errorText,
      }: {|
        status: 'running' | 'success' | 'error',
        statusText: string,
        requestText?: ?string,
        responseText?: ?string,
        generatedAudioPath?: ?string,
        generatedAudioUrl?: ?string,
        errorText?: ?string,
      |}) => {
        onOpenWorkingDeskTask({
          id: taskTabId,
          kind: 'elevenlabs-audio',
          title: 'ElevenLabs audio',
          status,
          statusText,
          requestText: requestText || 'Preparing HTTP request...',
          responseText: responseText || 'Waiting for HTTP response...',
          generatedAudioPath: generatedAudioPath
            ? normalizeSlashes(generatedAudioPath)
            : null,
          generatedAudioUrl: generatedAudioUrl || null,
          errorText: errorText || null,
        });
      };
      const failBeforeRequest = (errorMessage: string) => {
        updateWorkingDeskTask({
          status: 'error',
          statusText: 'ElevenLabs request failed.',
          responseText: `error: ${errorMessage}`,
          errorText: errorMessage,
        });
        setAudioGenerationError(errorMessage);
      };

      updateWorkingDeskTask({
        status: 'running',
        statusText: 'Preparing ElevenLabs request...',
      });

      if (!fs || !path) {
        failBeforeRequest('Filesystem paths are not supported.');
        return;
      }
      if (!elevenLabsApiKey.trim()) {
        failBeforeRequest('Enter an ElevenLabs API key.');
        return;
      }
      if (!elevenLabsText.trim()) {
        failBeforeRequest('Enter a prompt or text.');
        return;
      }

      setIsGeneratingAudio(true);
      setAudioGenerationError(null);
      setAudioGenerationStatus(null);

      let requestText = 'Preparing HTTP request...';
      let responseSummaryText = 'Waiting for HTTP response...';
      try {
        const outputFormat = elevenLabsOutputFormat.trim() || 'mp3_44100_128';
        const query = `output_format=${encodeURIComponent(outputFormat)}`;
        const isTextToSpeech = elevenLabsMode === 'text-to-speech';
        const endpoint = isTextToSpeech
          ? `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
              elevenLabsVoiceId.trim()
            )}?${query}`
          : `https://api.elevenlabs.io/v1/sound-generation?${query}`;
        const duration = parseFloat(elevenLabsDuration);
        const body = isTextToSpeech
          ? {
              text: elevenLabsText,
              model_id: elevenLabsModel.trim() || 'eleven_multilingual_v2',
            }
          : {
              text: elevenLabsText,
              model_id:
                elevenLabsSoundModel.trim() || 'eleven_text_to_sound_v2',
              duration_seconds: Number.isFinite(duration) ? duration : null,
            };
        const headers = {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey.trim(),
        };
        requestText = [
          `POST ${endpoint}`,
          '',
          'Headers:',
          stringifyDebugPayload(headers),
          '',
          'Body:',
          stringifyDebugPayload(body),
        ].join('\n');
        updateWorkingDeskTask({
          status: 'running',
          statusText: 'Sending ElevenLabs HTTP request...',
          requestText,
        });
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        responseSummaryText = [
          `HTTP ${response.status} ${response.statusText || ''}`.trim(),
          `ok: ${String(response.ok)}`,
          '',
          'Body:',
          'Reading response body...',
        ].join('\n');
        updateWorkingDeskTask({
          status: 'running',
          statusText: 'Reading ElevenLabs HTTP response...',
          requestText,
          responseText: responseSummaryText,
        });
        if (!response.ok) {
          const errorResponseText = await response.text();
          let responseBody: any;
          try {
            responseBody = errorResponseText
              ? JSON.parse(errorResponseText)
              : null;
          } catch (error) {
            responseBody = errorResponseText;
          }
          const detailErrorMessage =
            responseBody &&
            typeof responseBody === 'object' &&
            responseBody.detail &&
            typeof responseBody.detail === 'object' &&
            typeof responseBody.detail.message === 'string'
              ? responseBody.detail.message
              : null;
          const errorMessage: string =
            detailErrorMessage || `Request failed with HTTP ${response.status}`;
          responseSummaryText = [
            `HTTP ${response.status} ${response.statusText || ''}`.trim(),
            `ok: ${String(response.ok)}`,
            `error: ${errorMessage}`,
            '',
            'Body:',
            stringifyDebugPayload(responseBody),
          ].join('\n');
          updateWorkingDeskTask({
            status: 'error',
            statusText: 'ElevenLabs request failed.',
            requestText,
            responseText: responseSummaryText,
            errorText: errorMessage,
          });
          throw new Error(errorMessage);
        }

        if (!buffer || !buffer.Buffer) {
          throw new Error('Unable to save the generated audio file.');
        }
        const audioBytes = buffer.Buffer.from(await response.arrayBuffer());
        responseSummaryText = [
          `HTTP ${response.status} ${response.statusText || ''}`.trim(),
          `ok: ${String(response.ok)}`,
          '',
          'Body:',
          `Audio payload (${audioBytes.length} bytes)`,
        ].join('\n');
        updateWorkingDeskTask({
          status: 'running',
          statusText: 'Saving generated audio...',
          requestText,
          responseText: responseSummaryText,
        });
        const outputFolderPath = await getImageGenerationOutputFolderPath({
          project,
        });
        const outputBaseName =
          elevenLabsMode === 'text-to-speech'
            ? 'elevenlabs-speech'
            : 'elevenlabs-sound';
        const outputPath = await getUniqueOutputPath({
          folderPath: outputFolderPath,
          baseName: outputBaseName,
          extension: getAudioExtensionFromOutputFormat(outputFormat),
        });
        await fs.promises.writeFile(outputPath, audioBytes);
        updateWorkingDeskTask({
          status: 'success',
          statusText: 'ElevenLabs request completed.',
          requestText,
          responseText: responseSummaryText,
          generatedAudioPath: outputPath,
          generatedAudioUrl: getFileUrl(outputPath),
        });
        setAudioGenerationStatus(`Generated ${normalizeSlashes(outputPath)}`);
        await onProjectFilesChanged();
      } catch (error) {
        const errorMessage =
          error && error.message ? error.message : String(error);
        updateWorkingDeskTask({
          status: 'error',
          statusText: 'ElevenLabs request failed.',
          requestText,
          responseText:
            responseSummaryText === 'Waiting for HTTP response...'
              ? `error: ${errorMessage}`
              : responseSummaryText,
          errorText: errorMessage,
        });
        setAudioGenerationError(errorMessage);
      } finally {
        setIsGeneratingAudio(false);
      }
    },
    [
      elevenLabsApiKey,
      elevenLabsDuration,
      elevenLabsMode,
      elevenLabsModel,
      elevenLabsOutputFormat,
      elevenLabsSoundModel,
      elevenLabsText,
      elevenLabsVoiceId,
      onOpenWorkingDeskTask,
      onProjectFilesChanged,
      project,
    ]
  );

  const runLocalImageTool = React.useCallback(
    async () => {
      if (!fs || !path) {
        setLocalImageError('Filesystem paths are not supported.');
        return;
      }
      if (!imageAttachment) {
        setLocalImageError('Choose a supported image file.');
        return;
      }

      const imageUrl = getImageAttachmentPreviewUrl(imageAttachment);
      if (!imageUrl) {
        setLocalImageError('Unable to read the selected image.');
        return;
      }

      const crop: LocalImageCrop = {
        x: parsePixelField(localCropX),
        y: parsePixelField(localCropY),
        width: parsePixelField(localCropWidth),
        height: parsePixelField(localCropHeight),
      };
      const expandAmount = parsePixelField(localExpandAmount);

      setIsProcessingLocalImage(true);
      setLocalImageError(null);
      setLocalImageStatus('Processing image...');
      setLocalImageResultUrl(null);
      setLocalImageResultPath(null);

      try {
        const sourceImage = await loadImageFromUrl(imageUrl);
        const sourceSize = {
          width: sourceImage.naturalWidth || sourceImage.width,
          height: sourceImage.naturalHeight || sourceImage.height,
        };
        const canvas = document.createElement('canvas');
        drawLocalImageOperationToCanvas({
          canvas,
          image: sourceImage,
          sourceSize,
          operation: localImageOperation,
          crop,
          expandDirection: localExpandDirection,
          expandAmount,
          expandFill: {
            color: localExpandFillColor,
            alpha: localExpandFillAlpha,
          },
        });
        const outputBlob = await canvasToPngBlob(canvas);
        const outputFolderPath = await getImageGenerationOutputFolderPath({
          project,
        });
        const outputPath = await getUniqueOutputPath({
          folderPath: outputFolderPath,
          baseName: getLocalImageOutputBaseName({
            sourceName: imageAttachment.name,
            operation: localImageOperation,
            expandDirection: localExpandDirection,
          }),
          extension: '.png',
        });

        await fs.promises.writeFile(outputPath, await blobToBuffer(outputBlob));
        const normalizedOutputPath = normalizeSlashes(outputPath);
        const outputUrl = getFileUrl(outputPath);
        setLocalImageStatus(`Saved ${normalizedOutputPath}`);
        setLocalImageResultPath(normalizedOutputPath);
        setLocalImageResultUrl(outputUrl);
        onOpenWorkingDeskTask({
          id: `local-image:${outputPath}`,
          kind: 'local-image',
          title: path.basename(outputPath),
          status: 'success',
          statusText: 'Image saved.',
          generatedImagePath: normalizedOutputPath,
          generatedImageUrl: outputUrl,
        });
        await onProjectFilesChanged();
      } catch (error) {
        setLocalImageError(
          error && error.message ? error.message : String(error)
        );
        setLocalImageStatus(null);
      } finally {
        setIsProcessingLocalImage(false);
      }
    },
    [
      imageAttachment,
      localCropHeight,
      localCropWidth,
      localCropX,
      localCropY,
      localExpandAmount,
      localExpandDirection,
      localExpandFillAlpha,
      localExpandFillColor,
      localImageOperation,
      onOpenWorkingDeskTask,
      onProjectFilesChanged,
      project,
    ]
  );

  const openImageExtender = React.useCallback(async () => {
    if (!ipcRenderer) {
      setImageExtenderError(
        'Image Extender is only available in the desktop app.'
      );
      return;
    }

    setImageExtenderError(null);
    setImageExtenderStatus('Opening Image Extender...');
    try {
      await ipcRenderer.invoke('image-extender-load');
      setImageExtenderStatus('Image Extender opened.');
    } catch (error) {
      setImageExtenderError(
        error && error.message ? error.message : String(error)
      );
      setImageExtenderStatus(null);
    }
  }, []);

  const openAiGameWorkbench = React.useCallback(async () => {
    if (!ipcRenderer) {
      setAiGameWorkbenchError(
        'AI Game Workbench is only available in the desktop app.'
      );
      return;
    }

    setAiGameWorkbenchError(null);
    setAiGameWorkbenchStatus('Opening AI Game Workbench...');
    try {
      await ipcRenderer.invoke('ai-game-workbench-load');
      setAiGameWorkbenchStatus('AI Game Workbench opened.');
    } catch (error) {
      setAiGameWorkbenchError(
        error && error.message ? error.message : String(error)
      );
      setAiGameWorkbenchStatus(null);
    }
  }, []);

  const localCrop: LocalImageCrop = {
    x: parsePixelField(localCropX),
    y: parsePixelField(localCropY),
    width: parsePixelField(localCropWidth),
    height: parsePixelField(localCropHeight),
  };

  const localExpandDirectionOptions: Array<{|
    value: LocalImageExpandDirection,
    label: MessageDescriptor,
  |}> = [
    { value: 'left', label: t`Left` },
    { value: 'right', label: t`Right` },
    { value: 'top', label: t`Top` },
    { value: 'bottom', label: t`Bottom` },
  ];

  const renderImageToolSelector = () => (
    <div style={styles.toolSelector}>
      <SelectField
        floatingLabelText={<Trans>Image tool</Trans>}
        value={selectedImageTool}
        onChange={(event, index, value: string) => {
          if (
            value === 'nano-banana' ||
            value === 'local-tools' ||
            value === 'image-extender' ||
            value === 'ai-game-workbench'
          ) {
            setSelectedImageTool(value);
          }
        }}
        fullWidth
      >
        <SelectOption value="nano-banana" label={t`Nano Banana`} />
        <SelectOption value="image-extender" label={t`Image Extender`} />
        <SelectOption value="ai-game-workbench" label={t`AI Game Workbench`} />
        <SelectOption value="local-tools" label={t`Local tools`} />
      </SelectField>
    </div>
  );

  const renderNanoBanana = () => (
    <div style={styles.section}>
      {renderImageToolSelector()}
      <MiniToolbar noPadding>
        <SparkleIcon />
        <MiniToolbarText>
          <Trans>Nano Banana</Trans>
        </MiniToolbarText>
      </MiniToolbar>
      <TextField
        value={geminiApiKey}
        onChange={(event, value) => setGeminiApiKey(value)}
        floatingLabelText={<Trans>Gemini API key</Trans>}
        type="password"
        fullWidth
      />
      <TextField
        value={nanoBananaModel}
        onChange={(event, value) => setNanoBananaModel(value)}
        floatingLabelText={<Trans>Model</Trans>}
        fullWidth
      />
      <div
        style={{
          ...styles.attachmentField,
          ...(isImageAttachmentDragOver
            ? styles.attachmentFieldDropTarget
            : undefined),
        }}
        onDragOver={handleImageAttachmentDragOver}
        onDragLeave={handleImageAttachmentDragLeave}
        onDrop={handleImageAttachmentDrop}
      >
        <div style={styles.attachmentInfo}>
          <MiniToolbar noPadding>
            <PictureIcon />
            <MiniToolbarText>
              <Trans>Attached image</Trans>
            </MiniToolbarText>
          </MiniToolbar>
          {imageAttachment ? (
            <div style={styles.attachmentSummary}>
              <Text noMargin allowBrowserAutoTranslate={false}>
                {imageAttachment.name}
              </Text>
              <Text
                noMargin
                size="body-small"
                color="secondary"
                allowBrowserAutoTranslate={false}
                style={{
                  overflow: 'hidden',
                  overflowWrap: 'anywhere',
                }}
              >
                {normalizeSlashes(
                  getRelativeProjectFilePath(
                    project,
                    imageAttachment.absolutePath
                  ) || imageAttachment.absolutePath
                )}
              </Text>
            </div>
          ) : (
            <Text noMargin color="secondary">
              <Trans>No image attached.</Trans>
            </Text>
          )}
          <MiniToolbar noPadding>
            <RaisedButton
              label={
                imageAttachment ? (
                  <Trans>Change image</Trans>
                ) : (
                  <Trans>Choose image</Trans>
                )
              }
              icon={<PictureIcon />}
              onClick={selectImageAttachment}
            />
            {shouldShowClearImageAttachmentButton(imageAttachment) && (
              <FlatButton
                label={<Trans>Clear</Trans>}
                leftIcon={<CrossIcon />}
                onClick={clearImageAttachment}
              />
            )}
          </MiniToolbar>
        </div>
        {imageAttachment && (
          <div style={styles.attachmentPreview}>
            <img
              src={getImageAttachmentPreviewUrl(imageAttachment) || undefined}
              alt={imageAttachment.name}
              style={styles.attachmentPreviewImage}
              draggable="false"
            />
          </div>
        )}
      </div>
      <TextField
        value={nanoBananaPrompt}
        onChange={(event, value) => setNanoBananaPrompt(value)}
        floatingLabelText={<Trans>Edit prompt</Trans>}
        multiline
        rows={4}
        fullWidth
      />
      <MiniToolbar noPadding>
        <RaisedButton
          label={<Trans>Edit image</Trans>}
          icon={<SparkleIcon />}
          color="ai"
          onClick={runNanoBanana}
          disabled={shouldDisableNanoBananaButton({ isGeneratingImage })}
        />
      </MiniToolbar>
      {!!imageGenerationError && (
        <Text color="error">{imageGenerationError}</Text>
      )}
      {!!imageGenerationStatus && <Text>{imageGenerationStatus}</Text>}
    </div>
  );

  const renderImageExtender = () => (
    <div style={styles.section}>
      {renderImageToolSelector()}
      <MiniToolbar noPadding>
        <SparkleIcon />
        <MiniToolbarText>
          <Trans>Image Extender</Trans>
        </MiniToolbarText>
      </MiniToolbar>
      <MiniToolbar noPadding>
        <RaisedButton
          label={<Trans>Open Image Extender</Trans>}
          icon={<SparkleIcon />}
          color="ai"
          onClick={openImageExtender}
        />
      </MiniToolbar>
      {!!imageExtenderError && <Text color="error">{imageExtenderError}</Text>}
      {!!imageExtenderStatus && <Text>{imageExtenderStatus}</Text>}
      <Text>
        <Link
          href={imageExtenderGitHubUrl}
          onClick={() => Window.openExternalURL(imageExtenderGitHubUrl)}
        >
          {imageExtenderGitHubUrl}
        </Link>
      </Text>
    </div>
  );

  const renderAiGameWorkbench = () => (
    <div style={styles.section}>
      {renderImageToolSelector()}
      <MiniToolbar noPadding>
        <SparkleIcon />
        <MiniToolbarText>
          <Trans>AI Game Workbench</Trans>
        </MiniToolbarText>
      </MiniToolbar>
      <MiniToolbar noPadding>
        <RaisedButton
          label={<Trans>Open AI Game Workbench</Trans>}
          icon={<SparkleIcon />}
          color="ai"
          onClick={openAiGameWorkbench}
        />
      </MiniToolbar>
      {!!aiGameWorkbenchError && (
        <Text color="error">{aiGameWorkbenchError}</Text>
      )}
      {!!aiGameWorkbenchStatus && <Text>{aiGameWorkbenchStatus}</Text>}
      <Text>
        <Link
          href={aiGameWorkbenchGitHubUrl}
          onClick={() => Window.openExternalURL(aiGameWorkbenchGitHubUrl)}
        >
          {aiGameWorkbenchGitHubUrl}
        </Link>
      </Text>
    </div>
  );

  const renderLocalImageTools = () => (
    <div style={styles.section}>
      {renderImageToolSelector()}
      <MiniToolbar noPadding>
        <RectangleIcon />
        <MiniToolbarText>
          <Trans>Local tools</Trans>
        </MiniToolbarText>
      </MiniToolbar>
      <div
        style={{
          ...styles.attachmentField,
          ...(isImageAttachmentDragOver
            ? styles.attachmentFieldDropTarget
            : undefined),
        }}
        onDragOver={handleImageAttachmentDragOver}
        onDragLeave={handleImageAttachmentDragLeave}
        onDrop={handleImageAttachmentDrop}
      >
        <div style={styles.attachmentInfo}>
          <MiniToolbar noPadding>
            <PictureIcon />
            <MiniToolbarText>
              <Trans>Source image</Trans>
            </MiniToolbarText>
          </MiniToolbar>
          {imageAttachment ? (
            <div style={styles.attachmentSummary}>
              <Text noMargin allowBrowserAutoTranslate={false}>
                {imageAttachment.name}
              </Text>
              <Text
                noMargin
                size="body-small"
                color="secondary"
                allowBrowserAutoTranslate={false}
                style={{
                  overflow: 'hidden',
                  overflowWrap: 'anywhere',
                }}
              >
                {normalizeSlashes(
                  getRelativeProjectFilePath(
                    project,
                    imageAttachment.absolutePath
                  ) || imageAttachment.absolutePath
                )}
              </Text>
              {!!localImageSize && (
                <Text noMargin size="body-small" color="secondary">
                  {localImageSize.width} x {localImageSize.height}
                </Text>
              )}
            </div>
          ) : (
            <Text noMargin color="secondary">
              <Trans>No image selected.</Trans>
            </Text>
          )}
          <MiniToolbar noPadding>
            <RaisedButton
              label={
                imageAttachment ? (
                  <Trans>Change image</Trans>
                ) : (
                  <Trans>Choose image</Trans>
                )
              }
              icon={<PictureIcon />}
              onClick={selectImageAttachment}
            />
            {shouldShowClearImageAttachmentButton(imageAttachment) && (
              <FlatButton
                label={<Trans>Clear</Trans>}
                leftIcon={<CrossIcon />}
                onClick={clearImageAttachment}
              />
            )}
          </MiniToolbar>
        </div>
        {imageAttachment && (
          <div style={styles.attachmentPreview}>
            <img
              src={getImageAttachmentPreviewUrl(imageAttachment) || undefined}
              alt={imageAttachment.name}
              style={styles.attachmentPreviewImage}
              draggable="false"
            />
          </div>
        )}
      </div>
      <div style={styles.toolSelector}>
        <SelectField
          floatingLabelText={<Trans>Operation</Trans>}
          value={localImageOperation}
          onChange={(event, index, value: string) => {
            if (value === 'crop' || value === 'expand-canvas') {
              setLocalImageOperation(value);
            }
          }}
          fullWidth
        >
          <SelectOption value="crop" label={t`Crop`} />
          <SelectOption value="expand-canvas" label={t`Expand canvas`} />
        </SelectField>
      </div>
      {localImageOperation === 'crop' ? (
        <div style={styles.fieldGrid}>
          <TextField
            type="number"
            value={localCropX}
            onChange={(event, value) => setLocalCropX(value)}
            floatingLabelText={<Trans>X</Trans>}
            min={0}
            fullWidth
          />
          <TextField
            type="number"
            value={localCropY}
            onChange={(event, value) => setLocalCropY(value)}
            floatingLabelText={<Trans>Y</Trans>}
            min={0}
            fullWidth
          />
          <TextField
            type="number"
            value={localCropWidth}
            onChange={(event, value) => setLocalCropWidth(value)}
            floatingLabelText={<Trans>Width</Trans>}
            min={1}
            fullWidth
          />
          <TextField
            type="number"
            value={localCropHeight}
            onChange={(event, value) => setLocalCropHeight(value)}
            floatingLabelText={<Trans>Height</Trans>}
            min={1}
            fullWidth
          />
        </div>
      ) : (
        <>
          <div style={styles.toolSelector}>
            <SelectField
              floatingLabelText={<Trans>Direction</Trans>}
              value={localExpandDirection}
              onChange={(event, index, value: string) => {
                if (
                  value === 'left' ||
                  value === 'right' ||
                  value === 'top' ||
                  value === 'bottom'
                ) {
                  setLocalExpandDirection(value);
                }
              }}
              fullWidth
            >
              {localExpandDirectionOptions.map(({ value, label }) => (
                <SelectOption key={value} value={value} label={label} />
              ))}
            </SelectField>
          </div>
          <TextField
            type="number"
            value={localExpandAmount}
            onChange={(event, value) => setLocalExpandAmount(value)}
            floatingLabelText={<Trans>Pixels to add</Trans>}
            min={1}
            fullWidth
          />
          <ColorField
            floatingLabelText={<Trans>Fill color</Trans>}
            color={localExpandFillColor}
            alpha={localExpandFillAlpha}
            onChange={(color, alpha) => {
              setLocalExpandFillColor(color);
              setLocalExpandFillAlpha(
                alpha !== undefined && alpha !== null
                  ? alpha
                  : localExpandFillAlpha
              );
            }}
            fullWidth
          />
        </>
      )}
      <MiniToolbar noPadding>
        <RaisedButton
          label={<Trans>Apply</Trans>}
          icon={<HorizontalSizeIcon />}
          onClick={runLocalImageTool}
          disabled={shouldDisableLocalImageApplyButton({
            imageAttachment,
            isProcessing: isProcessingLocalImage,
            sourceSize: localImageSize,
            operation: localImageOperation,
            crop: localCrop,
            expandAmount: parsePixelField(localExpandAmount),
          })}
        />
      </MiniToolbar>
      {!!localImageError && <Text color="error">{localImageError}</Text>}
      {!!localImageStatus && <Text>{localImageStatus}</Text>}
      {!!localImageResultPath && (
        <Text noMargin color="secondary" allowBrowserAutoTranslate={false}>
          {localImageResultPath}
        </Text>
      )}
      {!!localImageResultUrl && (
        <img
          src={localImageResultUrl}
          alt="Local tool result"
          style={styles.resultPreview}
          draggable="false"
        />
      )}
    </div>
  );

  const renderElevenLabs = () => (
    <div style={styles.section}>
      <div style={styles.toolSelector}>
        <SelectField
          floatingLabelText={<Trans>Sound tool</Trans>}
          value={selectedSoundTool}
          onChange={(event, index, value: string) => {
            if (value === 'elevenlabs') setSelectedSoundTool(value);
          }}
          fullWidth
        >
          <SelectOption value="elevenlabs" label={t`ElevenLabs`} />
        </SelectField>
      </div>
      <MiniToolbar noPadding>
        <MusicIcon />
        <MiniToolbarText>
          <Trans>ElevenLabs</Trans>
        </MiniToolbarText>
      </MiniToolbar>
      <div style={styles.segmentedRow}>
        <FlatButton
          label={<Trans>Sound effect</Trans>}
          onClick={() => setElevenLabsMode('sound-effect')}
          primary={elevenLabsMode === 'sound-effect'}
        />
        <FlatButton
          label={<Trans>Text to speech</Trans>}
          onClick={() => setElevenLabsMode('text-to-speech')}
          primary={elevenLabsMode === 'text-to-speech'}
        />
      </div>
      <TextField
        value={elevenLabsApiKey}
        onChange={(event, value) => setElevenLabsApiKey(value)}
        floatingLabelText={<Trans>ElevenLabs API key</Trans>}
        type="password"
        fullWidth
      />
      {elevenLabsMode === 'text-to-speech' ? (
        <>
          <TextField
            value={elevenLabsVoiceId}
            onChange={(event, value) => setElevenLabsVoiceId(value)}
            floatingLabelText={<Trans>Voice ID</Trans>}
            fullWidth
          />
          <TextField
            value={elevenLabsModel}
            onChange={(event, value) => setElevenLabsModel(value)}
            floatingLabelText={<Trans>Model</Trans>}
            fullWidth
          />
        </>
      ) : (
        <>
          <TextField
            value={elevenLabsSoundModel}
            onChange={(event, value) => setElevenLabsSoundModel(value)}
            floatingLabelText={<Trans>Model</Trans>}
            fullWidth
          />
          <TextField
            value={elevenLabsDuration}
            onChange={(event, value) => setElevenLabsDuration(value)}
            floatingLabelText={<Trans>Duration seconds</Trans>}
            fullWidth
          />
        </>
      )}
      <TextField
        value={elevenLabsOutputFormat}
        onChange={(event, value) => setElevenLabsOutputFormat(value)}
        floatingLabelText={<Trans>Output format</Trans>}
        fullWidth
      />
      <TextField
        value={elevenLabsText}
        onChange={(event, value) => setElevenLabsText(value)}
        floatingLabelText={
          elevenLabsMode === 'text-to-speech' ? (
            <Trans>Speech text</Trans>
          ) : (
            <Trans>Sound effect prompt</Trans>
          )
        }
        multiline
        rows={5}
        fullWidth
      />
      <MiniToolbar noPadding>
        <RaisedButton
          label={<Trans>Generate audio</Trans>}
          icon={<SparkleIcon />}
          color="ai"
          onClick={runElevenLabs}
          disabled={shouldDisableElevenLabsButton({
            isGeneratingAudio,
            elevenLabsApiKey,
            elevenLabsText,
          })}
        />
      </MiniToolbar>
      {!!audioGenerationError && (
        <Text color="error">{audioGenerationError}</Text>
      )}
      {!!audioGenerationStatus && <Text>{audioGenerationStatus}</Text>}
    </div>
  );

  return (
    <Background>
      <div style={styles.container}>
        <div style={styles.header}>
          <Text noMargin size="block-title">
            <Trans>Tools</Trans>
          </Text>
        </div>
        <div style={styles.tabs}>
          <Tabs
            value={activeToolCategory}
            onChange={setActiveToolCategory}
            options={[
              {
                label: <Trans>Image</Trans>,
                value: 'image',
              },
              {
                label: <Trans>Sound</Trans>,
                value: 'sound',
              },
            ]}
            variant="scrollable"
          />
        </div>
        <div style={styles.body}>
          {activeToolCategory === 'image'
            ? selectedImageTool === 'nano-banana'
              ? renderNanoBanana()
              : selectedImageTool === 'image-extender'
              ? renderImageExtender()
              : selectedImageTool === 'ai-game-workbench'
              ? renderAiGameWorkbench()
              : selectedImageTool === 'local-tools'
              ? renderLocalImageTools()
              : null
            : selectedSoundTool === 'elevenlabs'
            ? renderElevenLabs()
            : null}
        </div>
      </div>
    </Background>
  );
};

export default ToolsPanel;
