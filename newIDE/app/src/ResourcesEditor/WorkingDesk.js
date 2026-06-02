// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
import Slider from '../UI/Slider';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { MarkdownText } from '../UI/MarkdownText';
import ResourcesLoader from '../ResourcesLoader';
import ResourcePreview from '../ResourcesList/ResourcePreview';
import CheckeredBackground from '../ResourcesList/CheckeredBackground';
import SoundPlayer from '../UI/SoundPlayer';
import optionalRequire from '../Utils/OptionalRequire';
import EditFileIcon from '../UI/CustomSvgIcons/EditFile';
import FloppyIcon from '../UI/CustomSvgIcons/Floppy';
import GridIcon from '../UI/CustomSvgIcons/Grid2d';
import PauseIcon from '../UI/CustomSvgIcons/Pause';
import PlayIcon from '../UI/CustomSvgIcons/Play';
import VisibilityIcon from '../UI/CustomSvgIcons/Visibility';
import {
  getFileUrl,
  isAudioFile,
  isImageFile,
  isMarkdownFile,
  isTextLikeFile,
  isVideoFile,
  type ProjectFileSelection,
} from './ProjectFilesPanel';
import './WorkingDesk.css';

const fs = optionalRequire('fs');
const path = optionalRequire('path');

type Props = {|
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  selectedItem: ?ProjectFileSelection,
  onProjectFilesChanged: () => Promise<void> | void,
|};

type SequenceFrame = {|
  absolutePath: string,
  fileUrl: string,
  name: string,
  index: number,
|};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    minHeight: 32,
  },
  content: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  previewArea: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
    minHeight: 0,
    padding: 16,
    boxSizing: 'border-box',
  },
  emptyStateMessage: {
    width: '100%',
    borderRadius: 6,
    padding: '12px 16px',
    boxSizing: 'border-box',
  },
  previewColumn: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  mediaStage: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    zIndex: 1,
  },
  audioVideo: {
    maxWidth: '100%',
    maxHeight: '100%',
    zIndex: 1,
  },
  soundPlayerStage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 0,
    padding: 24,
    boxSizing: 'border-box',
  },
  soundPlayerContainer: {
    width: '100%',
    maxWidth: 980,
  },
  markdownContainer: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  markdownPane: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: 'auto',
    padding: 8,
  },
  markdownTextarea: {
    width: '100%',
    height: '100%',
    resize: 'none',
    border: 0,
    outline: 'none',
    boxSizing: 'border-box',
    padding: 12,
    fontFamily: 'Consolas, "Lucida Console", Monaco, monospace',
    fontSize: 13,
    lineHeight: '19px',
  },
  status: {
    padding: '0 8px 6px 8px',
  },
  sequenceSlider: {
    width: 140,
    padding: '0 8px',
  },
  textPreview: {
    flex: 1,
    overflow: 'auto',
    padding: 12,
    margin: 0,
    fontFamily: 'Consolas, "Lucida Console", Monaco, monospace',
    fontSize: 12,
    lineHeight: '18px',
    whiteSpace: 'pre-wrap',
  },
};

const readTextFile = async (absolutePath: string): Promise<string> => {
  if (!fs) return '';
  const stat = await fs.promises.stat(absolutePath);
  if (stat.size > 512 * 1024) {
    return 'File is larger than 512 KB. Open it in an external editor.';
  }
  return fs.promises.readFile(absolutePath, 'utf8');
};

const detectSequenceFrames = async (
  selectedItem: ProjectFileSelection
): Promise<Array<SequenceFrame>> => {
  if (!fs || !path || !isImageFile(selectedItem.node)) return [];

  const directory = path.dirname(selectedItem.node.absolutePath);
  const selectedName = path.basename(selectedItem.node.absolutePath);
  const match = selectedName.match(/^(.*?)(\d+)(\.[^.]+)$/);
  if (!match) return [];

  const [, prefix, , extension] = match;
  const dirents = await fs.promises.readdir(directory, { withFileTypes: true });
  const frames = dirents
    .filter(dirent => dirent.isFile())
    .map(dirent => {
      const frameMatch = dirent.name.match(/^(.*?)(\d+)(\.[^.]+)$/);
      if (!frameMatch) return null;
      if (frameMatch[1] !== prefix || frameMatch[3] !== extension) return null;
      const absolutePath = path.join(directory, dirent.name);
      return {
        absolutePath,
        fileUrl: getFileUrl(absolutePath),
        name: dirent.name,
        index: parseInt(frameMatch[2], 10),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  return frames.length > 1 ? frames : [];
};

const WorkingDesk = ({
  project,
  resourcesLoader,
  selectedItem,
  onProjectFilesChanged,
}: Props): React.Node => {
  const theme = React.useContext(GDevelopThemeContext);
  const [markdownContent, setMarkdownContent] = React.useState('');
  const [markdownMode, setMarkdownMode] = React.useState<
    'split' | 'edit' | 'preview'
  >('split');
  const [isMarkdownDirty, setIsMarkdownDirty] = React.useState(false);
  const [markdownStatus, setMarkdownStatus] = React.useState<?string>(null);
  const [textPreview, setTextPreview] = React.useState<?string>(null);
  const [textPreviewError, setTextPreviewError] = React.useState<?string>(null);
  const [sequenceFrames, setSequenceFrames] = React.useState<
    Array<SequenceFrame>
  >([]);
  const [currentFrameIndex, setCurrentFrameIndex] = React.useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = React.useState(false);
  const [sequenceFps, setSequenceFps] = React.useState(12);
  const [imageSize, setImageSize] = React.useState<?[number, number]>(null);
  const [audioPreviewError, setAudioPreviewError] = React.useState<?string>(
    null
  );

  const selectedNode = selectedItem ? selectedItem.node : null;
  const selectedResource = selectedItem ? selectedItem.resource : null;

  const renderDeskMessage = (children: React.Node) => (
    <div style={styles.emptyState}>
      <div
        style={{
          ...styles.emptyStateMessage,
          backgroundColor: theme.paper.backgroundColor.dark,
        }}
      >
        {children}
      </div>
    </div>
  );

  React.useEffect(
    () => {
      let isMounted = true;
      setMarkdownContent('');
      setMarkdownStatus(null);
      setIsMarkdownDirty(false);
      setTextPreview(null);
      setTextPreviewError(null);
      setSequenceFrames([]);
      setCurrentFrameIndex(0);
      setIsPlayingSequence(false);
      setImageSize(null);
      setAudioPreviewError(null);

      if (!selectedItem || selectedItem.node.type !== 'file') return;

      if (isMarkdownFile(selectedItem.node)) {
        readTextFile(selectedItem.node.absolutePath)
          .then(content => {
            if (!isMounted) return;
            setMarkdownContent(content);
          })
          .catch(error => {
            if (!isMounted) return;
            setMarkdownStatus(error.message);
          });
      } else if (isTextLikeFile(selectedItem.node)) {
        readTextFile(selectedItem.node.absolutePath)
          .then(content => {
            if (!isMounted) return;
            setTextPreview(content);
          })
          .catch(error => {
            if (!isMounted) return;
            setTextPreviewError(error.message);
          });
      }

      if (isImageFile(selectedItem.node)) {
        detectSequenceFrames(selectedItem)
          .then(frames => {
            if (!isMounted) return;
            setSequenceFrames(frames);
          })
          .catch(() => {
            if (!isMounted) return;
            setSequenceFrames([]);
          });
      }

      return () => {
        isMounted = false;
      };
    },
    [selectedItem]
  );

  React.useEffect(
    () => {
      if (!isPlayingSequence || sequenceFrames.length < 2) return;
      const intervalId = setInterval(() => {
        setCurrentFrameIndex(index => (index + 1) % sequenceFrames.length);
      }, Math.max(16, 1000 / sequenceFps));
      return () => clearInterval(intervalId);
    },
    [isPlayingSequence, sequenceFps, sequenceFrames.length]
  );

  const saveMarkdown = React.useCallback(
    async () => {
      if (!fs || !selectedNode || !isMarkdownFile(selectedNode)) return;
      setMarkdownStatus(null);
      await fs.promises.writeFile(
        selectedNode.absolutePath,
        markdownContent,
        'utf8'
      );
      setIsMarkdownDirty(false);
      setMarkdownStatus('Saved');
      await onProjectFilesChanged();
    },
    [markdownContent, onProjectFilesChanged, selectedNode]
  );

  const renderHeaderDetails = () => {
    if (!selectedNode) return null;
    if (selectedNode.type === 'folder') {
      return (
        <Text noMargin>
          <Trans>Folder</Trans>
        </Text>
      );
    }
    if (imageSize) {
      return (
        <Text noMargin>
          {imageSize[0]} x {imageSize[1]}
        </Text>
      );
    }
    if (sequenceFrames.length > 1) {
      return (
        <Text noMargin>
          {sequenceFrames.length} <Trans>frames</Trans>
        </Text>
      );
    }
    return null;
  };

  const renderSequenceToolbar = () => {
    if (sequenceFrames.length < 2) return null;
    return (
      <MiniToolbar>
        <IconButton
          size="small"
          onClick={() => setIsPlayingSequence(!isPlayingSequence)}
          tooltip={isPlayingSequence ? t`Pause animation` : t`Play animation`}
        >
          {isPlayingSequence ? <PauseIcon /> : <PlayIcon />}
        </IconButton>
        <MiniToolbarText>
          {currentFrameIndex + 1}/{sequenceFrames.length}
        </MiniToolbarText>
        <div style={styles.sequenceSlider}>
          <Slider
            min={0}
            max={sequenceFrames.length - 1}
            step={1}
            value={currentFrameIndex}
            onChange={value => setCurrentFrameIndex(value)}
          />
        </div>
        <MiniToolbarText>
          <Trans>FPS</Trans>
        </MiniToolbarText>
        <div style={styles.sequenceSlider}>
          <Slider
            min={1}
            max={30}
            step={1}
            value={sequenceFps}
            onChange={value => setSequenceFps(value)}
          />
        </div>
      </MiniToolbar>
    );
  };

  const renderImagePreview = () => {
    if (!selectedNode) return null;
    const imageSource =
      sequenceFrames.length > 1
        ? sequenceFrames[currentFrameIndex].fileUrl
        : getFileUrl(selectedNode.absolutePath);
    return (
      <div style={styles.previewColumn}>
        {renderSequenceToolbar()}
        <div style={styles.mediaStage}>
          <CheckeredBackground />
          <img
            src={imageSource}
            alt={selectedNode.name}
            style={styles.image}
            onLoad={event => {
              const image = event.currentTarget;
              setImageSize([image.naturalWidth, image.naturalHeight]);
            }}
          />
        </div>
      </div>
    );
  };

  const renderMarkdownEditor = () => {
    if (!selectedNode) return null;
    const showEditor = markdownMode === 'split' || markdownMode === 'edit';
    const showPreview = markdownMode === 'split' || markdownMode === 'preview';
    const textareaStyle = {
      ...styles.markdownTextarea,
      backgroundColor: theme.paper.backgroundColor.dark,
      color: theme.text.color.primary,
    };
    return (
      <div style={styles.previewColumn}>
        <MiniToolbar>
          <IconButton
            size="small"
            onClick={() => setMarkdownMode('split')}
            selected={markdownMode === 'split'}
            tooltip={t`Split editor and preview`}
          >
            <GridIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setMarkdownMode('edit')}
            selected={markdownMode === 'edit'}
            tooltip={t`Edit Markdown`}
          >
            <EditFileIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setMarkdownMode('preview')}
            selected={markdownMode === 'preview'}
            tooltip={t`Preview Markdown`}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={saveMarkdown}
            disabled={!isMarkdownDirty}
            tooltip={t`Save Markdown`}
          >
            <FloppyIcon />
          </IconButton>
          {!!markdownStatus && (
            <MiniToolbarText>{markdownStatus}</MiniToolbarText>
          )}
        </MiniToolbar>
        <div style={styles.markdownContainer}>
          {showEditor && (
            <div style={styles.markdownPane}>
              <textarea
                value={markdownContent}
                onChange={event => {
                  setMarkdownContent(event.currentTarget.value);
                  setIsMarkdownDirty(true);
                  setMarkdownStatus(null);
                }}
                onKeyDown={event => {
                  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                    event.preventDefault();
                    saveMarkdown();
                  }
                }}
                style={textareaStyle}
                spellCheck="false"
              />
            </div>
          )}
          {showPreview && (
            <div
              className="resources-markdown-preview"
              style={{
                ...styles.markdownPane,
                borderLeft: showEditor
                  ? '1px solid rgba(128, 128, 128, 0.28)'
                  : undefined,
              }}
            >
              <MarkdownText
                source={markdownContent}
                isStandaloneText
                allowParagraphs
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTextPreview = () => {
    if (textPreviewError) {
      return renderDeskMessage(<Text noMargin>{textPreviewError}</Text>);
    }
    return (
      <pre
        style={{
          ...styles.textPreview,
          backgroundColor: theme.paper.backgroundColor.dark,
          color: theme.text.color.primary,
        }}
      >
        {textPreview || ''}
      </pre>
    );
  };

  const renderMediaPreview = () => {
    if (!selectedNode) return null;
    const fileUrl = getFileUrl(selectedNode.absolutePath);
    if (isImageFile(selectedNode)) return renderImagePreview();
    if (isAudioFile(selectedNode)) {
      return (
        <div style={styles.soundPlayerStage}>
          <div style={styles.soundPlayerContainer}>
            {audioPreviewError ? (
              renderDeskMessage(<Text noMargin>{audioPreviewError}</Text>)
            ) : (
              <SoundPlayer
                soundSrc={fileUrl}
                title={selectedNode.name}
                subtitle={selectedNode.relativePath}
                onSoundLoaded={() => setAudioPreviewError(null)}
                onSoundError={() =>
                  setAudioPreviewError('Unable to load this audio file.')
                }
              />
            )}
          </div>
        </div>
      );
    }
    if (isVideoFile(selectedNode)) {
      return (
        <div style={styles.mediaStage}>
          <video controls src={fileUrl} style={styles.audioVideo} />
        </div>
      );
    }
    if (isMarkdownFile(selectedNode)) return renderMarkdownEditor();
    if (isTextLikeFile(selectedNode)) return renderTextPreview();
    if (selectedResource) {
      return (
        <ResourcePreview
          project={project}
          resourceName={selectedResource.getName()}
          resourcesLoader={resourcesLoader}
        />
      );
    }
    return renderDeskMessage(
      <Text noMargin>
        <Trans>
          Select an image, audio, video, or Markdown file to preview.
        </Trans>
      </Text>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Text noMargin>
          <Trans>Working desk</Trans>
          {selectedNode ? `: ${selectedNode.name}` : ''}
        </Text>
        {renderHeaderDetails()}
      </div>
      <div style={styles.content}>
        <div style={styles.previewArea}>
          {!selectedItem
            ? renderDeskMessage(
                <Text noMargin>
                  <Trans>Select a project file to preview or edit it.</Trans>
                </Text>
              )
            : renderMediaPreview()}
        </div>
      </div>
      {isMarkdownDirty && (
        <div style={styles.status}>
          <Text noMargin>
            <Trans>Markdown changes are not saved.</Trans>
          </Text>
        </div>
      )}
    </div>
  );
};

export default WorkingDesk;
