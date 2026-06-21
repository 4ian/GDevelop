// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import CircularProgress from '../UI/CircularProgress';
import {
  ClosableTabs,
  ClosableTab,
  TabContentContainer,
} from '../UI/ClosableTabs';
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
import SparkleIcon from '../UI/CustomSvgIcons/Sparkle';
import MusicIcon from '../UI/CustomSvgIcons/Music';
import PictureIcon from '../UI/CustomSvgIcons/Picture';
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
  getWorkingDeskImageZoomStyles,
  imageZoomMaxFactor,
  imageZoomMinFactor,
  shouldShowWorkingDeskImageZoomToolbar,
  type WorkingDeskImageSize,
} from './WorkingDeskZoomUtils';
import {
  type WorkingDeskToolTabKind,
  type WorkingDeskToolTabUpdate,
} from './WorkingDeskTabTypes';
import './WorkingDesk.css';

const fs = optionalRequire('fs');

type Props = {|
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  selectedItem: ?ProjectFileSelection,
  toolTabUpdate: ?WorkingDeskToolTabUpdate,
  onProjectFilesChanged: () => Promise<void> | void,
|};

type WorkingDeskFileTab = {|
  id: string,
  tabKind: 'file',
  title: string,
  selectedItem: ProjectFileSelection,
|};

type WorkingDeskToolTab = {|
  id: string,
  tabKind: 'tool',
  title: string,
  kind: WorkingDeskToolTabKind,
  status: 'running' | 'success' | 'error',
  statusText: ?string,
  requestText: ?string,
  responseText: ?string,
  generatedImagePath: ?string,
  generatedImageUrl: ?string,
  generatedAudioPath: ?string,
  generatedAudioUrl: ?string,
  errorText: ?string,
|};

type WorkingDeskTab = WorkingDeskFileTab | WorkingDeskToolTab;

type ImagePanStart = {|
  pointerId: number,
  didCapturePointer: boolean,
  clientX: number,
  clientY: number,
  scrollLeft: number,
  scrollTop: number,
|};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
  tabsBar: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 34,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    padding: '0 6px',
    boxSizing: 'border-box',
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
  imageOverlayToolbar: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  imageScrollArea: {
    position: 'relative',
    display: 'block',
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    overflow: 'auto',
    overscrollBehavior: 'contain',
    zIndex: 1,
  },
  imageZoomCanvas: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
    minHeight: '100%',
    boxSizing: 'border-box',
    padding: 16,
  },
  image: {
    display: 'block',
    height: 'auto',
    width: 'auto',
    maxWidth: 'none',
    maxHeight: 'none',
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
  toolTaskContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    padding: 16,
    gap: 12,
    boxSizing: 'border-box',
  },
  toolTaskStatusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 24,
  },
  debugFoldedSection: {
    borderRadius: 4,
    border: '1px solid rgba(128, 128, 128, 0.28)',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
  },
  debugSummary: {
    padding: '10px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    color: '#fff',
  },
  debugPre: {
    margin: 0,
    padding: 12,
    borderTop: '1px solid rgba(128, 128, 128, 0.18)',
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
    color: '#fff',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: 12,
    lineHeight: '18px',
  },
  generatedImage: {
    maxWidth: '100%',
    maxHeight: 420,
    objectFit: 'contain',
    borderRadius: 4,
    border: '1px solid rgba(128, 128, 128, 0.28)',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  generatedAudio: {
    width: '100%',
    maxWidth: 720,
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

const getFileTabId = (selectedItem: ProjectFileSelection): string =>
  `file:${selectedItem.node.id}`;

const getToolTabFromUpdate = (
  toolTabUpdate: WorkingDeskToolTabUpdate
): WorkingDeskToolTab => ({
  id: toolTabUpdate.id,
  tabKind: 'tool',
  title: toolTabUpdate.title,
  kind: toolTabUpdate.kind,
  status: toolTabUpdate.status,
  statusText: toolTabUpdate.statusText || null,
  requestText: toolTabUpdate.requestText || null,
  responseText: toolTabUpdate.responseText || null,
  generatedImagePath: toolTabUpdate.generatedImagePath || null,
  generatedImageUrl: toolTabUpdate.generatedImageUrl || null,
  generatedAudioPath: toolTabUpdate.generatedAudioPath || null,
  generatedAudioUrl: toolTabUpdate.generatedAudioUrl || null,
  errorText: toolTabUpdate.errorText || null,
});

const getSafeTabDomId = (tabId: string): string =>
  `working-desk-tab-${tabId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

const WorkingDesk = ({
  project,
  resourcesLoader,
  selectedItem,
  toolTabUpdate,
  onProjectFilesChanged,
}: Props): React.Node => {
  const theme = React.useContext(GDevelopThemeContext);
  const [tabs, setTabs] = React.useState<Array<WorkingDeskTab>>([]);
  const [activeTabId, setActiveTabId] = React.useState<?string>(null);
  const [markdownContent, setMarkdownContent] = React.useState('');
  const [markdownMode, setMarkdownMode] = React.useState<
    'split' | 'edit' | 'preview'
  >('split');
  const [isMarkdownDirty, setIsMarkdownDirty] = React.useState(false);
  const [markdownStatus, setMarkdownStatus] = React.useState<?string>(null);
  const [textPreview, setTextPreview] = React.useState<?string>(null);
  const [textPreviewError, setTextPreviewError] = React.useState<?string>(null);
  const [imageZoomFactor, setImageZoomFactor] = React.useState(1);
  const [
    imageNaturalSize,
    setImageNaturalSize,
  ] = React.useState<?WorkingDeskImageSize>(null);
  const [isImageScrollable, setIsImageScrollable] = React.useState(false);
  const [isImagePanning, setIsImagePanning] = React.useState(false);
  const [audioPreviewError, setAudioPreviewError] = React.useState<?string>(
    null
  );
  const imageScrollAreaRef = React.useRef<?HTMLDivElement>(null);
  const imagePanStartRef = React.useRef<?ImagePanStart>(null);
  const markdownSaveGenerationRef = React.useRef<number>(0);
  const latestMarkdownContentRef = React.useRef<string>('');
  const latestMarkdownPathRef = React.useRef<?string>(null);

  React.useEffect(
    () => {
      if (!selectedItem || selectedItem.node.type !== 'file') return;

      const tabId = getFileTabId(selectedItem);
      setTabs(currentTabs => {
        const existingTabIndex = currentTabs.findIndex(tab => tab.id === tabId);
        const nextFileTab: WorkingDeskFileTab = {
          id: tabId,
          tabKind: 'file',
          title: selectedItem.node.name,
          selectedItem,
        };

        if (existingTabIndex === -1) return [...currentTabs, nextFileTab];

        return currentTabs.map((tab, index) =>
          index === existingTabIndex ? nextFileTab : tab
        );
      });
      setActiveTabId(tabId);
    },
    [selectedItem]
  );

  React.useEffect(
    () => {
      if (!toolTabUpdate) return;

      const nextToolTab = getToolTabFromUpdate(toolTabUpdate);
      setTabs(currentTabs => {
        const existingTabIndex = currentTabs.findIndex(
          tab => tab.id === nextToolTab.id
        );
        if (existingTabIndex === -1) return [...currentTabs, nextToolTab];
        return currentTabs.map((tab, index) =>
          index === existingTabIndex ? nextToolTab : tab
        );
      });
      setActiveTabId(nextToolTab.id);
    },
    [toolTabUpdate]
  );

  const activeTab =
    tabs.find(tab => tab.id === activeTabId) || tabs[tabs.length - 1] || null;
  const activeFileItem =
    activeTab && activeTab.tabKind === 'file' ? activeTab.selectedItem : null;
  const activeToolTab =
    activeTab && activeTab.tabKind === 'tool' ? activeTab : null;
  const selectedNode = activeFileItem ? activeFileItem.node : null;
  const selectedResource = activeFileItem ? activeFileItem.resource : null;

  React.useEffect(
    () => {
      latestMarkdownContentRef.current = markdownContent;
    },
    [markdownContent]
  );

  React.useEffect(
    () => {
      latestMarkdownPathRef.current =
        selectedNode && isMarkdownFile(selectedNode)
          ? selectedNode.absolutePath
          : null;
    },
    [selectedNode]
  );

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
      markdownSaveGenerationRef.current += 1;
      setMarkdownContent('');
      setMarkdownStatus(null);
      setIsMarkdownDirty(false);
      setTextPreview(null);
      setTextPreviewError(null);
      setImageZoomFactor(1);
      setImageNaturalSize(null);
      setIsImageScrollable(false);
      setIsImagePanning(false);
      imagePanStartRef.current = null;
      setAudioPreviewError(null);

      if (!activeFileItem || activeFileItem.node.type !== 'file') return;

      if (isMarkdownFile(activeFileItem.node)) {
        readTextFile(activeFileItem.node.absolutePath)
          .then(content => {
            if (!isMounted) return;
            setMarkdownContent(content);
          })
          .catch(error => {
            if (!isMounted) return;
            setMarkdownStatus(error.message);
          });
      } else if (isTextLikeFile(activeFileItem.node)) {
        readTextFile(activeFileItem.node.absolutePath)
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
    [activeFileItem]
  );

  const updateImageScrollable = React.useCallback(() => {
    const scrollArea = imageScrollAreaRef.current;
    if (!scrollArea) {
      setIsImageScrollable(false);
      return;
    }

    setIsImageScrollable(
      scrollArea.scrollWidth > scrollArea.clientWidth + 1 ||
        scrollArea.scrollHeight > scrollArea.clientHeight + 1
    );
  }, []);

  React.useEffect(
    () => {
      updateImageScrollable();
    },
    [imageNaturalSize, imageZoomFactor, selectedNode, updateImageScrollable]
  );

  React.useEffect(
    () => {
      if (typeof window === 'undefined') return;
      window.addEventListener('resize', updateImageScrollable);
      return () => window.removeEventListener('resize', updateImageScrollable);
    },
    [updateImageScrollable]
  );

  const stopImagePanning = React.useCallback(() => {
    const scrollArea = imageScrollAreaRef.current;
    if (scrollArea && imagePanStartRef.current) {
      try {
        scrollArea.releasePointerCapture(
          String(imagePanStartRef.current.pointerId)
        );
      } catch (error) {
        // The pointer capture can already be released when the pointer leaves
        // the document or the browser cancels the gesture.
      }
    }

    imagePanStartRef.current = null;
    setIsImagePanning(false);
  }, []);

  const handleImagePointerDown = React.useCallback((event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const scrollArea = imageScrollAreaRef.current;
    if (!scrollArea) return;

    const canPanImage =
      scrollArea.scrollWidth > scrollArea.clientWidth + 1 ||
      scrollArea.scrollHeight > scrollArea.clientHeight + 1;
    setIsImageScrollable(canPanImage);
    if (!canPanImage) return;

    event.preventDefault();
    let didCapturePointer = false;
    try {
      scrollArea.setPointerCapture(String(event.pointerId));
      didCapturePointer = true;
    } catch (error) {
      // Pointer capture is not available in every test/browser path.
    }

    imagePanStartRef.current = {
      pointerId: event.pointerId,
      didCapturePointer,
      clientX: event.clientX,
      clientY: event.clientY,
      scrollLeft: scrollArea.scrollLeft,
      scrollTop: scrollArea.scrollTop,
    };
    setIsImagePanning(true);
  }, []);

  const handleImagePointerMove = React.useCallback((event: PointerEvent) => {
    const panStart = imagePanStartRef.current;
    const scrollArea = imageScrollAreaRef.current;
    if (!panStart || !scrollArea || panStart.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    scrollArea.scrollLeft =
      panStart.scrollLeft - (event.clientX - panStart.clientX);
    scrollArea.scrollTop =
      panStart.scrollTop - (event.clientY - panStart.clientY);
  }, []);

  const handleImageWheel = React.useCallback(
    (event: WheelEvent) => {
      if (event.deltaY === 0) return;

      const scrollArea = imageScrollAreaRef.current;
      if (!scrollArea) return;

      event.preventDefault();
      event.stopPropagation();

      const nextZoomFactor = getNextImageZoomFactor(
        imageZoomFactor,
        event.deltaY < 0 ? 'in' : 'out'
      );
      if (nextZoomFactor === imageZoomFactor) return;

      const scrollAreaRect = scrollArea.getBoundingClientRect();
      const pointerX = event.clientX - scrollAreaRect.left;
      const pointerY = event.clientY - scrollAreaRect.top;
      const zoomRatio = nextZoomFactor / imageZoomFactor;
      const previousScrollLeft = scrollArea.scrollLeft;
      const previousScrollTop = scrollArea.scrollTop;

      setImageZoomFactor(nextZoomFactor);
      window.requestAnimationFrame(() => {
        scrollArea.scrollLeft =
          (previousScrollLeft + pointerX) * zoomRatio - pointerX;
        scrollArea.scrollTop =
          (previousScrollTop + pointerY) * zoomRatio - pointerY;
        updateImageScrollable();
      });
    },
    [imageZoomFactor, updateImageScrollable]
  );

  const handleImageLoad = React.useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      const imageElement = event.currentTarget;
      setImageNaturalSize({
        width: imageElement.naturalWidth || imageElement.clientWidth,
        height: imageElement.naturalHeight || imageElement.clientHeight,
      });
      window.requestAnimationFrame(updateImageScrollable);
    },
    [updateImageScrollable]
  );

  const handleImagePointerLeave = React.useCallback(
    () => {
      const panStart = imagePanStartRef.current;
      if (!panStart || panStart.didCapturePointer) return;

      stopImagePanning();
    },
    [stopImagePanning]
  );

  const saveMarkdown = React.useCallback(
    async (generation?: number, shouldRefreshProjectFiles: boolean = true) => {
      const pathToSave = latestMarkdownPathRef.current;
      if (!fs || !pathToSave) return;

      const savedGeneration =
        typeof generation === 'number'
          ? generation
          : markdownSaveGenerationRef.current;
      const contentToSave = latestMarkdownContentRef.current;
      setMarkdownStatus(null);
      setMarkdownStatus('Saving...');
      await fs.promises.writeFile(pathToSave, contentToSave, 'utf8');
      if (
        latestMarkdownPathRef.current === pathToSave &&
        markdownSaveGenerationRef.current === savedGeneration
      ) {
        setIsMarkdownDirty(false);
        setMarkdownStatus('Saved');
      }
      if (shouldRefreshProjectFiles) {
        await onProjectFilesChanged();
      }
    },
    [onProjectFilesChanged]
  );

  React.useEffect(
    () => {
      if (!isMarkdownDirty || !selectedNode || !isMarkdownFile(selectedNode)) {
        return;
      }

      const generation = markdownSaveGenerationRef.current;
      const timeoutId = setTimeout(() => {
        saveMarkdown(generation, false);
      }, 500);
      return () => clearTimeout(timeoutId);
    },
    [isMarkdownDirty, markdownContent, saveMarkdown, selectedNode]
  );

  const closeTab = React.useCallback(
    (tabId: string) => {
      setTabs(currentTabs => {
        const tabIndex = currentTabs.findIndex(tab => tab.id === tabId);
        if (tabIndex === -1) return currentTabs;

        const nextTabs = currentTabs.filter(tab => tab.id !== tabId);
        if (activeTabId === tabId) {
          const nextActiveTab =
            nextTabs[tabIndex] || nextTabs[tabIndex - 1] || null;
          setActiveTabId(nextActiveTab ? nextActiveTab.id : null);
        }
        return nextTabs;
      });
    },
    [activeTabId]
  );

  const renderTabIcon = (tab: WorkingDeskTab): React.Node => {
    if (tab.tabKind === 'tool') {
      if (tab.kind === 'elevenlabs-audio') return <MusicIcon />;
      if (tab.kind === 'local-image') return <PictureIcon />;
      return <SparkleIcon />;
    }

    const node = tab.selectedItem.node;
    if (isImageFile(node)) return <PictureIcon />;
    if (isAudioFile(node)) return <MusicIcon />;
    return null;
  };

  const renderTabs = () => {
    if (!tabs.length) return null;

    return (
      <div style={styles.tabsBar}>
        <ClosableTabs
          renderTabs={({ containerWidth }) => {
            const tabMaxWidth = Math.max(
              150,
              Math.min(260, containerWidth / Math.max(tabs.length, 1))
            );
            return tabs.map(tab => (
              <ClosableTab
                key={tab.id}
                id={getSafeTabDomId(tab.id)}
                active={activeTab ? activeTab.id === tab.id : false}
                label={tab.title}
                icon={renderTabIcon(tab)}
                closable
                onClick={() => setActiveTabId(tab.id)}
                onClose={() => closeTab(tab.id)}
                onCloseOthers={() => {
                  setTabs([tab]);
                  setActiveTabId(tab.id);
                }}
                onCloseAll={() => {
                  setTabs([]);
                  setActiveTabId(null);
                }}
                onActivated={() => {}}
                onHover={() => {}}
                maxWidth={tabMaxWidth}
              />
            ));
          }}
        />
      </div>
    );
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
    const imageZoomToolbar = renderImageZoomToolbar();
    const imageZoomStyles = getWorkingDeskImageZoomStyles(
      imageZoomFactor,
      imageNaturalSize
    );
    return (
      <div style={styles.previewColumn}>
        <div style={styles.mediaStage}>
          <CheckeredBackground />
          {!!imageZoomToolbar && (
            <div style={styles.imageOverlayToolbar}>{imageZoomToolbar}</div>
          )}
          <div
            ref={imageScrollAreaRef}
            style={{
              ...styles.imageScrollArea,
              cursor: isImageScrollable
                ? isImagePanning
                  ? 'grabbing'
                  : 'grab'
                : 'default',
              touchAction: isImageScrollable ? 'none' : 'auto',
              userSelect: isImagePanning ? 'none' : undefined,
            }}
            onPointerDown={handleImagePointerDown}
            onPointerMove={handleImagePointerMove}
            onPointerUp={stopImagePanning}
            onPointerCancel={stopImagePanning}
            onPointerLeave={handleImagePointerLeave}
            onWheel={handleImageWheel}
          >
            <div
              style={{
                ...styles.imageZoomCanvas,
                ...imageZoomStyles.canvas,
              }}
            >
              <img
                src={imageSource}
                alt={selectedNode.name}
                style={{
                  ...styles.image,
                  ...imageZoomStyles.image,
                }}
                draggable="false"
                onLoad={handleImageLoad}
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
                  markdownSaveGenerationRef.current += 1;
                  setMarkdownContent(event.currentTarget.value);
                  setIsMarkdownDirty(true);
                  setMarkdownStatus('Saving...');
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

  const renderDebugSection = ({
    title,
    content,
  }: {|
    title: React.Node,
    content: ?string,
  |}) => {
    if (!content) return null;

    return (
      <details style={styles.debugFoldedSection}>
        <summary style={styles.debugSummary}>{title}</summary>
        <pre style={styles.debugPre}>{content}</pre>
      </details>
    );
  };

  const getToolTaskDefaultStatusText = (
    kind: WorkingDeskToolTabKind
  ): string => {
    switch (kind) {
      case 'nano-banana':
        return 'Nano Banana task';
      case 'elevenlabs-audio':
        return 'ElevenLabs task';
      case 'local-image':
        return 'Local image tool';
      default:
        return 'Tool task';
    }
  };

  const renderToolTaskContent = (toolTab: WorkingDeskToolTab) => {
    const isRunning = toolTab.status === 'running';
    const statusText =
      toolTab.statusText || getToolTaskDefaultStatusText(toolTab.kind);

    return (
      <div style={styles.toolTaskContent}>
        <div style={styles.toolTaskStatusRow}>
          {isRunning && <CircularProgress size={20} />}
          <Text noMargin>{statusText}</Text>
        </div>
        {!!toolTab.errorText && (
          <Text color="error" noMargin>
            {toolTab.errorText}
          </Text>
        )}
        {renderDebugSection({
          title: <Trans>HTTP request</Trans>,
          content: toolTab.requestText,
        })}
        {renderDebugSection({
          title: <Trans>HTTP response</Trans>,
          content: toolTab.responseText,
        })}
        {!!toolTab.generatedImagePath && (
          <React.Fragment>
            <Text noMargin>
              <Trans>Generated image</Trans>
            </Text>
            <Text noMargin color="secondary" allowBrowserAutoTranslate={false}>
              {toolTab.generatedImagePath}
            </Text>
            {!!toolTab.generatedImageUrl && (
              <img
                src={toolTab.generatedImageUrl}
                alt="Generated result"
                style={styles.generatedImage}
                draggable="false"
              />
            )}
          </React.Fragment>
        )}
        {!!toolTab.generatedAudioPath && (
          <React.Fragment>
            <Text noMargin>
              <Trans>Generated audio</Trans>
            </Text>
            <Text noMargin color="secondary" allowBrowserAutoTranslate={false}>
              {toolTab.generatedAudioPath}
            </Text>
            {!!toolTab.generatedAudioUrl && (
              <audio
                controls
                src={toolTab.generatedAudioUrl}
                style={styles.generatedAudio}
              />
            )}
          </React.Fragment>
        )}
      </div>
    );
  };

  const renderActiveTabContent = () => {
    if (!activeTab) {
      return renderDeskMessage(
        <Text noMargin>
          <Trans>Select a project file to preview or edit it.</Trans>
        </Text>
      );
    }

    if (activeToolTab) return renderToolTaskContent(activeToolTab);
    return renderMediaPreview();
  };

  return (
    <div style={styles.container}>
      {renderTabs()}
      <div style={styles.content}>
        <div style={styles.previewArea}>
          {tabs.map(tab => (
            <TabContentContainer key={tab.id} active={activeTab === tab}>
              {activeTab === tab ? renderActiveTabContent() : null}
            </TabContentContainer>
          ))}
          {!tabs.length && renderActiveTabContent()}
        </div>
      </div>
      {!!activeFileItem && isMarkdownDirty && (
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
