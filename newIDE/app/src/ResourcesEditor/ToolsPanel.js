// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import Background from '../UI/Background';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
import { Tabs } from '../UI/Tabs';
import SparkleIcon from '../UI/CustomSvgIcons/Sparkle';
import MusicIcon from '../UI/CustomSvgIcons/Music';
import PictureIcon from '../UI/CustomSvgIcons/Picture';
import CrossIcon from '../UI/CustomSvgIcons/Cross';
import {
  getFileUrl,
  getProjectRootPath,
  isAudioFile,
  normalizeSlashes,
  type ProjectFileSelection,
} from './ProjectFilesPanel';
import optionalRequire from '../Utils/OptionalRequire';
import { applyResourceDefaults } from '../ResourcesList/ResourceUtils';
import newNameGenerator from '../Utils/NewNameGenerator';
import { openFilePicker } from '../Utils/FileSystem';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const buffer = optionalRequire('buffer');
const projectFileDragDataMimeType = 'application/x-gdevelop-project-file';

type Props = {|
  project: gdProject,
  selectedItem: ?ProjectFileSelection,
  onProjectFilesChanged: () => Promise<void> | void,
|};

type ToolCategory = 'image' | 'sound';
type ImageTool = 'nano-banana';
type SoundTool = 'elevenlabs';
export type ImageAttachment = {|
  absolutePath: string,
  name: string,
  extension: string,
|};

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

export const shouldDisableNanoBananaButton = ({
  isGeneratingImage,
}: {|
  isGeneratingImage: boolean,
|}): boolean => isGeneratingImage;

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

const isPathInsideFolder = (folderPath: string, filePath: string): boolean => {
  if (!path) return false;
  const relativePath = path.relative(folderPath, filePath);
  return (
    relativePath === '' ||
    (!!relativePath &&
      relativePath.indexOf('..') !== 0 &&
      !path.isAbsolute(relativePath))
  );
};

const getImageGenerationOutputFolderPath = async ({
  project,
  imageAttachment,
}: {|
  project: gdProject,
  imageAttachment: ?ImageAttachment,
|}): Promise<string> => {
  if (!path) {
    throw new Error('Filesystem paths are not supported.');
  }
  const projectRootPath = getProjectRootPath(project);
  if (imageAttachment && (!fs || !projectRootPath)) {
    return path.dirname(imageAttachment.absolutePath);
  }

  if (
    imageAttachment &&
    projectRootPath &&
    isPathInsideFolder(projectRootPath, imageAttachment.absolutePath)
  ) {
    return path.dirname(imageAttachment.absolutePath);
  }

  if (!fs || !projectRootPath) {
    throw new Error(
      'Save the project before generating an image without an attached image.'
    );
  }

  const assetsFolderPath = path.join(projectRootPath, 'assets');
  await fs.promises.mkdir(assetsFolderPath, { recursive: true });
  return assetsFolderPath;
};

const addResourceForFile = ({
  project,
  absolutePath,
  kind,
}: {|
  project: gdProject,
  absolutePath: string,
  kind: 'audio' | 'image',
|}) => {
  const relativeFilePath = getRelativeProjectFilePath(project, absolutePath);
  if (!relativeFilePath) return;

  const resourcesManager = project.getResourcesManager();
  const resourceName = newNameGenerator(relativeFilePath, tentativeName =>
    resourcesManager.hasResource(tentativeName)
  );
  const resource =
    kind === 'image' ? new gd.ImageResource() : new gd.AudioResource();
  resource.setFile(relativeFilePath);
  resource.setName(resourceName);
  applyResourceDefaults(project, resource);
  resourcesManager.addResource(resource);
  resource.delete();
};

const ToolsPanel = ({
  project,
  selectedItem,
  onProjectFilesChanged,
}: Props): React.Node => {
  const selectedNode = selectedItem ? selectedItem.node : null;
  const [
    activeToolCategory,
    setActiveToolCategory,
  ] = React.useState<ToolCategory>('image');
  const [selectedImageTool, setSelectedImageTool] = React.useState<ImageTool>(
    'nano-banana'
  );
  const [selectedSoundTool, setSelectedSoundTool] = React.useState<SoundTool>(
    'elevenlabs'
  );
  const [geminiApiKey, setGeminiApiKey] = React.useState('');
  const [nanoBananaModel, setNanoBananaModel] = React.useState(
    'gemini-3.1-flash-image'
  );
  const [nanoBananaPrompt, setNanoBananaPrompt] = React.useState('');
  const [
    imageAttachment,
    setImageAttachment,
  ] = React.useState<?ImageAttachment>(null);
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

  const [elevenLabsApiKey, setElevenLabsApiKey] = React.useState('');
  const [elevenLabsMode, setElevenLabsMode] = React.useState<
    'sound-effect' | 'text-to-speech'
  >('sound-effect');
  const [elevenLabsText, setElevenLabsText] = React.useState('');
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = React.useState(
    'JBFqnCBsd6RMkjVDRZzb'
  );
  const [elevenLabsModel, setElevenLabsModel] = React.useState(
    'eleven_multilingual_v2'
  );
  const [elevenLabsSoundModel, setElevenLabsSoundModel] = React.useState(
    'eleven_text_to_sound_v2'
  );
  const [elevenLabsOutputFormat, setElevenLabsOutputFormat] = React.useState(
    'mp3_44100_128'
  );
  const [elevenLabsDuration, setElevenLabsDuration] = React.useState('');
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
      setImageGenerationStatus(null);
      setImageGenerationError(null);
      setAudioGenerationStatus(null);
      setAudioGenerationError(null);
    },
    [selectedNode]
  );

  const attachImage = React.useCallback((imageAttachment: ?ImageAttachment) => {
    const errorMessage = getImageAttachmentErrorMessage({
      imageAttachment,
      action: 'select',
    });
    if (errorMessage) {
      setImageGenerationError(errorMessage);
      return;
    }

    setImageAttachment(imageAttachment);
    setImageGenerationError(null);
    setImageGenerationStatus(null);
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
  }, []);

  const selectImageAttachment = React.useCallback(
    async () => {
      try {
        const filePath = await openFilePicker({
          title: 'Choose an attached image',
          properties: ['openFile'],
          message: 'Choose an image to use as the AI input.',
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
        setImageGenerationError(
          error && error.message
            ? error.message
            : 'Unable to choose an attached image.'
        );
      }
    },
    [attachImage]
  );

  const getImageAttachmentFromDragEvent = React.useCallback(
    (event: any): ?ImageAttachment => {
      return createImageAttachmentFromProjectFileDragData(
        event.dataTransfer.getData(projectFileDragDataMimeType)
      );
    },
    []
  );

  const handleImageAttachmentDragOver = React.useCallback(
    (event: any) => {
      if (!hasProjectFileDragData(event.dataTransfer.types)) return;

      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
      setIsImageAttachmentDragOver(true);
    },
    []
  );

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
      if (!fs || !path) return;
      if (!geminiApiKey.trim()) {
        setImageGenerationError('Enter a Gemini API key.');
        return;
      }
      if (!nanoBananaPrompt.trim()) {
        setImageGenerationError('Enter a prompt.');
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
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': geminiApiKey.trim(),
            },
            body: JSON.stringify({
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
            }),
          }
        );
        const responseBody = await response.json();
        if (!response.ok) {
          throw new Error(
            responseBody && responseBody.error && responseBody.error.message
              ? responseBody.error.message
              : `Request failed with HTTP ${response.status}`
          );
        }

        const candidate =
          responseBody.candidates &&
          responseBody.candidates[0] &&
          responseBody.candidates[0].content;
        const responseParts =
          candidate && candidate.parts ? candidate.parts : [];
        const imagePart = responseParts.find(
          part => part.inlineData || part.inline_data
        );
        if (!imagePart) {
          const textPart = responseParts.find(part => part.text);
          setImageGenerationStatus(
            textPart ? textPart.text : 'The response did not include an image.'
          );
          return;
        }

        const inlineData = imagePart.inlineData || imagePart.inline_data;
        const mimeType =
          inlineData.mimeType || inlineData.mime_type || 'image/png';
        const outputExtension = mimeType === 'image/jpeg' ? '.jpg' : '.png';
        const outputFolderPath = await getImageGenerationOutputFolderPath({
          project,
          imageAttachment,
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
        addResourceForFile({
          project,
          absolutePath: outputPath,
          kind: 'image',
        });
        setImageGenerationStatus(`Generated ${normalizeSlashes(outputPath)}`);
        await onProjectFilesChanged();
      } catch (error) {
        setImageGenerationError(error.message);
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [
      geminiApiKey,
      imageAttachment,
      nanoBananaModel,
      nanoBananaPrompt,
      onProjectFilesChanged,
      project,
    ]
  );

  const runElevenLabs = React.useCallback(
    async () => {
      if (!fs || !path || !selectedNode || !isAudioFile(selectedNode)) return;
      if (!elevenLabsApiKey.trim()) {
        setAudioGenerationError('Enter an ElevenLabs API key.');
        return;
      }
      if (!elevenLabsText.trim()) {
        setAudioGenerationError('Enter a prompt or text.');
        return;
      }

      setIsGeneratingAudio(true);
      setAudioGenerationError(null);
      setAudioGenerationStatus(null);

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
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey.trim(),
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          let errorMessage = `Request failed with HTTP ${response.status}`;
          try {
            const responseBody = await response.json();
            errorMessage =
              responseBody && responseBody.detail && responseBody.detail.message
                ? responseBody.detail.message
                : errorMessage;
          } catch (error) {
            // Ignore JSON parsing errors and keep the HTTP status message.
          }
          throw new Error(errorMessage);
        }

        if (!buffer || !buffer.Buffer) {
          throw new Error('Unable to save the generated audio file.');
        }
        const audioBytes = buffer.Buffer.from(await response.arrayBuffer());
        const outputPath = await getUniqueOutputPath({
          folderPath: path.dirname(selectedNode.absolutePath),
          baseName: `${path.basename(
            selectedNode.name,
            selectedNode.extension
          )}-elevenlabs`,
          extension: getAudioExtensionFromOutputFormat(outputFormat),
        });
        await fs.promises.writeFile(outputPath, audioBytes);
        addResourceForFile({
          project,
          absolutePath: outputPath,
          kind: 'audio',
        });
        setAudioGenerationStatus(`Generated ${normalizeSlashes(outputPath)}`);
        await onProjectFilesChanged();
      } catch (error) {
        setAudioGenerationError(error.message);
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
      onProjectFilesChanged,
      project,
      selectedNode,
    ]
  );

  const renderNanoBanana = () => (
    <div style={styles.section}>
      <div style={styles.toolSelector}>
        <SelectField
          floatingLabelText={<Trans>Image tool</Trans>}
          value={selectedImageTool}
          onChange={(event, index, value: string) => {
            if (value === 'nano-banana') setSelectedImageTool(value);
          }}
          fullWidth
        >
          <SelectOption value="nano-banana" label={t`Nano Banana`} />
        </SelectField>
      </div>
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
          disabled={
            isGeneratingAudio || !selectedNode || !isAudioFile(selectedNode)
          }
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
