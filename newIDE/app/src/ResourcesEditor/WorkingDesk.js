// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
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
import VisibilityIcon from '../UI/CustomSvgIcons/Visibility';
import ZoomIn from '../UI/CustomSvgIcons/ZoomIn';
import ZoomOut from '../UI/CustomSvgIcons/ZoomOut';
import {
  getFileUrl,
  isAudioFile,
  isImageFile,
  isMarkdownFile,
  isTextLikeFile,
  isVideoFile,
  type ProjectFileSelection,
} from './ProjectFilesPanel';
import {
  formatImageZoomFactor,
  getNextImageZoomFactor,
  imageZoomMaxFactor,
  imageZoomMinFactor,
  shouldShowWorkingDeskImageZoomToolbar,
} from './WorkingDeskZoomUtils';
import './WorkingDesk.css';

const fs = optionalRequire('fs');

type Props = {|
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  selectedItem: ?ProjectFileSelection,
  onProjectFilesChanged: () => Promise<void> | void,
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
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
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
  imageScrollArea: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'auto',
    zIndex: 1,
  },
  imageZoomCanvas: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
    minHeight: '100%',
    boxSizing: 'border-box',
    padding: 16,
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
    minWidth: 0,
    overflow: 'hidden',
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
  const [imageSize, setImageSize] = React.useState<?[number, number]>(null);
  const [imageZoomFactor, setImageZoomFactor] = React.useState(1);
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
      setImageSize(null);
      setImageZoomFactor(1);
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

      return () => {
        isMounted = false;
      };
    },
    [selectedItem]
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
    return null;
  };

  const renderImageZoomToolbar = () => {
    if (!shouldShowWorkingDeskImageZoomToolbar(selectedNode)) return null;
    return (
      <MiniToolbar noPadding>
        <IconButton
          size="small"
          onClick={() =>
            setImageZoomFactor(zoomFactor =>
              getNextImageZoomFactor(zoomFactor, 'out')
            )
          }
          disabled={imageZoomFactor <= imageZoomMinFactor}
          tooltip={t`Zoom out`}
        >
          <ZoomOut />
        </IconButton>
        <MiniToolbarText>
          {formatImageZoomFactor(imageZoomFactor)}
        </MiniToolbarText>
        <IconButton
          size="small"
          onClick={() =>
            setImageZoomFactor(zoomFactor =>
              getNextImageZoomFactor(zoomFactor, 'in')
            )
          }
          disabled={imageZoomFactor >= imageZoomMaxFactor}
          tooltip={t`Zoom in`}
        >
          <ZoomIn />
        </IconButton>
      </MiniToolbar>
    );
  };

  const renderImagePreview = () => {
    if (!selectedNode) return null;
    const imageSource = getFileUrl(selectedNode.absolutePath);
    return (
      <div style={styles.previewColumn}>
        <div style={styles.mediaStage}>
          <CheckeredBackground />
          <div style={styles.imageScrollArea}>
            <div
              style={{
                ...styles.imageZoomCanvas,
                width:
                  imageZoomFactor >= 1
                    ? `${imageZoomFactor * 100}%`
                    : '100%',
                height:
                  imageZoomFactor >= 1
                    ? `${imageZoomFactor * 100}%`
                    : '100%',
              }}
            >
              <img
                src={imageSource}
                alt={selectedNode.name}
                style={{
                  ...styles.image,
                  maxWidth:
                    imageZoomFactor < 1
                      ? `${imageZoomFactor * 100}%`
                      : '100%',
                  maxHeight:
                    imageZoomFactor < 1
                      ? `${imageZoomFactor * 100}%`
                      : '100%',
                }}
                onLoad={event => {
                  const image = event.currentTarget;
                  setImageSize([image.naturalWidth, image.naturalHeight]);
                }}
              />
            </div>
          </div>
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
        <div style={styles.headerActions}>
          {renderHeaderDetails()}
          {renderImageZoomToolbar()}
        </div>
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
