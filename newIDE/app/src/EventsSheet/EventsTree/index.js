// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import SortableEventsTree, {
  getFlatDataFromTree,
  getNodeAtPath,
  type SortableTreeNode,
} from './SortableEventsTree';
import { mapFor } from '../../Utils/MapFor';
import { isEventSelected } from '../SelectionHandler';
import EventsRenderingService from './EventsRenderingService';
import EventHeightsCache from './EventHeightsCache';
import classNames from 'classnames';
import {
  eventsTree,
  eventsTreeWithSearchResults,
  handle,
  aiGeneratedEventHandle,
  icon,
} from './ClassNames';
import {
  type SelectionState,
  type EventContext,
  type InstructionsListContext,
  type InstructionContext,
  type ParameterContext,
  type VariableDeclarationContext,
} from '../SelectionHandler';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope';
import getObjectByName from '../../Utils/GetObjectByName';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';
import { type ScreenType } from '../../UI/Responsive/ScreenTypeMeasurer';
import { type WindowSizeType } from '../../UI/Responsive/ResponsiveWindowMeasurer';

// Import default style of react-sortable-tree and the override made for EventsSheet.
import './style.css';
import './SortableEventsTree.css';
import BottomButtons from './BottomButtons';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import { Line } from '../../UI/Grid';
import { type Preferences } from '../../MainFrame/Preferences/PreferencesContext';
import { type Tutorial } from '../../Utils/GDevelopServices/Tutorial';
import TutorialMessage from '../../Hints/TutorialMessage';
import getTutorial from '../../Hints/getTutorial';
import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import { makeDropTarget } from '../../UI/DragAndDrop/DropTarget';
import { AutoScroll, DropContainer } from './DropContainer';
import {
  isDescendant,
  isElseEventValid,
  type MoveFunctionArguments,
} from './helpers';
import { dataObjectToProps } from '../../Utils/HTMLDataset';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { useLongTouch } from '../../Utils/UseLongTouch';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

const eventsSheetEventsDnDType = 'events-sheet-events-dnd-type';

const EventDragSourceAndDropTarget = makeDragSourceAndDropTarget<SortableTreeNode>(
  eventsSheetEventsDnDType
);
const EventDropTarget = makeDropTarget<SortableTreeNode>(
  eventsSheetEventsDnDType
);

const getThumbnail = ObjectsRenderingService.getThumbnail.bind(
  ObjectsRenderingService
);

const defaultIndentWidth = 22;
const smallIndentWidth = 11;
// Placeholder height for events whose real height is not yet measured.
// Prevents all events from collapsing to 1px at startup, which would cause
// the virtualized list to render all of them at once.
const defaultEventHeight = 100;

const styles = {
  container: { flex: 1, position: 'relative' },
  defaultEventContainer: {
    marginRight: 10,
    position: 'relative',
  },
  smallEventContainer: {
    marginRight: 0,
    position: 'relative',
  },
  eventComponentContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'stretch',
    position: 'relative',
  },
};

export const getIndentWidth = (windowSize: WindowSizeType): number =>
  windowSize === 'small' ? smallIndentWidth : defaultIndentWidth;
const getEventContainerStyle = (windowSize: WindowSizeType) =>
  windowSize === 'small'
    ? styles.smallEventContainer
    : styles.defaultEventContainer;

type EventsContainerProps = {|
  eventsHeightsCache: EventHeightsCache,
  event: gdBaseEvent,
  onUpdate: () => void,
  leftIndentWidth: number,
  disabled: boolean,
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  selection: SelectionState,
  onAddNewInstruction: InstructionsListContext => void,
  onPasteInstructions: InstructionsListContext => void,
  onMoveToInstruction: (destinationContext: InstructionContext) => void,
  onMoveToInstructionsList: (
    destinationContext: InstructionsListContext
  ) => void,
  onInstructionClick: InstructionContext => void,
  onInstructionDoubleClick: InstructionContext => void,
  onInstructionContextMenu: (x: number, y: number, InstructionContext) => void,
  onAddInstructionContextMenu: (
    HTMLButtonElement,
    InstructionsListContext
  ) => void,
  onParameterClick: ParameterContext => void,

  onVariableDeclarationClick: VariableDeclarationContext => void,
  onVariableDeclarationDoubleClick: VariableDeclarationContext => void,

  onEventClick: (eventContext: EventContext) => void,
  onEndEditingEvent: () => void,
  onEventContextMenu: (x: number, y: number) => void,
  onOpenExternalEvents: string => void,
  onOpenLayout: string => void,
  renderObjectThumbnail: string => React.Node,

  screenType: ScreenType,
  eventsSheetWidth: number,
  eventsSheetHeight: number,

  windowSize: WindowSizeType,

  idPrefix: string,
  highlightedAiGeneratedEventIds: Set<string>,
  isValidElseEvent: boolean,
  highlightedSearchText: ?string,
  highlightedSearchMatchCase?: boolean,

  node: SortableTreeNode,
  isDragged: boolean,
  onBeginDrag: () => void,
  onEndDrag: () => void,
  onTemporaryUnfoldNode: (isOverLazy: boolean) => void,
|};

/**
 * The component containing an event.
 * It will report the rendered event height so that the EventsTree can
 * update accordingly.
 */
const EventContainer = (props: EventsContainerProps) => {
  const {
    event,
    project,
    scope,
    disabled,
    eventsHeightsCache,
    onEventContextMenu,
    projectScopedContainersAccessor,
    onUpdate,
    highlightedAiGeneratedEventIds,
  } = props;
  const forceUpdate = useForceUpdate();
  const containerRef = React.useRef<?HTMLDivElement>(null);

  // At EACH rendering, update the cache with the current height of the event.
  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const height = container ? container.offsetHeight : 0;
    const width = container ? container.offsetWidth : 0;
    if (height === 0 || width === 0) {
      // An empty height or width means the event is hidden (e.g. navigating outside
      // the events sheet tab), or the container hasn't been sized yet.
      // Don't store the height in this case.
      return;
    }
    eventsHeightsCache.setEventHeight(event, height);
  });

  const _onUpdate = React.useCallback(
    () => {
      forceUpdate();
      onUpdate();
    },
    [forceUpdate, onUpdate]
  );

  const _onEventContextMenu = React.useCallback(
    (domEvent: MouseEvent) => {
      domEvent.preventDefault();
      onEventContextMenu(domEvent.clientX, domEvent.clientY);
    },
    [onEventContextMenu]
  );

  const {
    isPressingRef,
    contextMenuProps: longTouchForContextMenuProps,
  } = useLongTouch(
    React.useCallback(
      (domEvent: any) => {
        onEventContextMenu(domEvent.clientX, domEvent.clientY);
      },
      [onEventContextMenu]
    ),
    { context: 'events-tree-event-component' }
  );

  const EventComponent = EventsRenderingService.getEventComponent(event);

  const eventType = event.getType();
  const coloredHandleStyle = (() => {
    if (eventType === 'BuiltinCommonInstructions::Comment') {
      const commentEvent = gd.asCommentEvent(event);
      return {
        backgroundColor: `rgb(${commentEvent.getBackgroundColorRed()}, ${commentEvent.getBackgroundColorGreen()}, ${commentEvent.getBackgroundColorBlue()})`,
        filter: 'brightness(0.8)',
      };
    }
    if (eventType === 'BuiltinCommonInstructions::Group') {
      const groupEvent = gd.asGroupEvent(event);
      return {
        backgroundColor: `rgb(${groupEvent.getBackgroundColorR()}, ${groupEvent.getBackgroundColorG()}, ${groupEvent.getBackgroundColorB()})`,
        filter: 'brightness(0.8)',
      };
    }
    return undefined;
  })();

  return (
    <EventDragSourceAndDropTarget
      beginDrag={() => {
        // During a long-press (which will open the context menu on mobile), suppress
        // the drag by returning an item with no data. We cannot block canDrag()
        // instead, because react-dnd-touch-backend evaluates canDrag() once (after its
        // delayTouchStart of 100ms), at which point isPressingRef is always true — so
        // blocking canDrag() would permanently break drags on mobile.
        if (isPressingRef.current) {
          // $FlowFixMe[incompatible-type]
          return {};
        }
        props.onBeginDrag();
        // $FlowFixMe[incompatible-type]
        return props.node;
      }}
      canDrag={() => !!props.node && !!props.node.event}
      canDrop={() => true}
      drop={() => {}}
      endDrag={props.onEndDrag}
    >
      {({ connectDragSource, connectDropTarget, isOverLazy }) => {
        props.onTemporaryUnfoldNode(isOverLazy);
        const content = (
          <div
            ref={containerRef}
            onClick={props.onEventClick}
            onContextMenu={_onEventContextMenu}
            {...longTouchForContextMenuProps}
          >
            {!!EventComponent && (
              <div style={styles.eventComponentContainer}>
                {connectDragSource(
                  <div
                    className={classNames({
                      [handle]: true,
                      [aiGeneratedEventHandle]: highlightedAiGeneratedEventIds.has(
                        event.getAiGeneratedEventId()
                      ),
                    })}
                    style={coloredHandleStyle}
                  />
                )}
                <div style={styles.container}>
                  <EventComponent
                    project={project}
                    scope={scope}
                    event={event}
                    globalObjectsContainer={props.globalObjectsContainer}
                    objectsContainer={props.objectsContainer}
                    projectScopedContainersAccessor={
                      projectScopedContainersAccessor
                    }
                    selected={isEventSelected(props.selection, event)}
                    selection={props.selection}
                    leftIndentWidth={props.leftIndentWidth}
                    onUpdate={_onUpdate}
                    onAddNewInstruction={props.onAddNewInstruction}
                    onPasteInstructions={props.onPasteInstructions}
                    onMoveToInstruction={props.onMoveToInstruction}
                    onMoveToInstructionsList={props.onMoveToInstructionsList}
                    onInstructionClick={props.onInstructionClick}
                    onInstructionDoubleClick={props.onInstructionDoubleClick}
                    onInstructionContextMenu={props.onInstructionContextMenu}
                    onAddInstructionContextMenu={
                      props.onAddInstructionContextMenu
                    }
                    onVariableDeclarationClick={
                      props.onVariableDeclarationClick
                    }
                    onVariableDeclarationDoubleClick={
                      props.onVariableDeclarationDoubleClick
                    }
                    onEndEditingEvent={props.onEndEditingEvent}
                    onParameterClick={props.onParameterClick}
                    onOpenExternalEvents={props.onOpenExternalEvents}
                    onOpenLayout={props.onOpenLayout}
                    disabled={
                      disabled /* Use disabled (not event.disabled) as it is true if a parent event is disabled*/
                    }
                    renderObjectThumbnail={props.renderObjectThumbnail}
                    screenType={props.screenType}
                    eventsSheetWidth={props.eventsSheetWidth}
                    eventsSheetHeight={props.eventsSheetHeight}
                    windowSize={props.windowSize}
                    idPrefix={props.idPrefix}
                    isValidElseEvent={props.isValidElseEvent}
                    highlightedSearchText={props.highlightedSearchText}
                    highlightedSearchMatchCase={
                      props.highlightedSearchMatchCase
                    }
                  />
                </div>
              </div>
            )}
          </div>
        );
        return props.isDragged ? content : connectDropTarget(content);
      }}
    </EventDragSourceAndDropTarget>
  );
};

// $FlowFixMe[missing-local-annot]
const SortableTree = ({ className, ...otherProps }) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <SortableEventsTree
      className={`${eventsTree} ${
        gdevelopTheme.palette.type === 'light' ? 'light-theme' : 'dark-theme'
      } ${className}`}
      {...otherProps}
    />
  );
};

type EventsTreeProps = {|
  events: gdEventsList,
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  selection: SelectionState,
  onAddNewInstruction: (
    eventContext: EventContext,
    InstructionsListContext
  ) => void,
  onPasteInstructions: (
    eventContext: EventContext,
    InstructionsListContext
  ) => void,
  onMoveToInstruction: (
    eventContext: EventContext,
    destinationContext: InstructionContext
  ) => void,
  onMoveToInstructionsList: (
    eventContext: EventContext,
    destinationContext: InstructionsListContext
  ) => void,
  onInstructionClick: (
    eventContext: EventContext,
    instructionContext: InstructionContext
  ) => void,
  onInstructionDoubleClick: (
    eventContext: EventContext,
    instructionContext: InstructionContext
  ) => void,
  onInstructionContextMenu: (
    eventContext: EventContext,
    x: number,
    y: number,
    InstructionContext
  ) => void,
  onAddInstructionContextMenu: (
    eventContext: EventContext,
    HTMLButtonElement,
    InstructionsListContext
  ) => void,
  onParameterClick: (
    eventContext: EventContext,
    parameterContext: ParameterContext
  ) => void,

  onVariableDeclarationClick: (
    eventContext: EventContext,
    variableDeclarationContext: VariableDeclarationContext
  ) => void,
  onVariableDeclarationDoubleClick: (
    eventContext: EventContext,
    variableDeclarationContext: VariableDeclarationContext
  ) => void,

  onEventClick: (eventContext: EventContext) => void,
  onEventContextMenu: (
    x: number,
    y: number,
    eventContext: EventContext
  ) => void,
  onAddNewEvent: (eventType: string, eventsList: gdEventsList) => void,
  onOpenExternalEvents: string => void,
  onOpenLayout: string => void,
  showObjectThumbnails: boolean,

  searchResults: ?Array<gdBaseEvent>,
  searchFocusOffset: ?number,
  highlightedSearchText: ?string,
  highlightedSearchMatchCase?: boolean,

  onEventMoved: (previousRowIndex: number, nextRowIndex: number) => void,
  onEndEditingEvent: (event: gdBaseEvent) => void,
  onScroll?: () => void,

  screenType: ScreenType,
  windowSize: WindowSizeType,
  eventsSheetWidth: number,
  eventsSheetHeight: number,
  fontSize?: number,
  indentScale: number,

  preferences: Preferences,
  tutorials: ?Array<Tutorial>,

  highlightedAiGeneratedEventIds: Set<string>,
|};

export type EventsTreeInterface = {|
  forceEventsUpdate: (cb?: () => void) => void,
  foldAll: () => void,
  unfoldToLevel: (level: number) => void,
  getEventContextAtRowIndexes: (
    rowIndexes: Array<number>
  ) => Array<EventContext>,
  scrollToRow: (row: number) => void,
  scrollToInstruction: (
    rowIndex: number,
    listLabel: string,
    instructionIndex: number
  ) => void,
  getEventRow: (event: gdBaseEvent) => number,
  unfoldForEvent: (event: gdBaseEvent) => void,
|};

export type { SortableTreeNode };

// $FlowFixMe[missing-local-annot]
const getNodeKey = ({ treeIndex }) => treeIndex;

/**
 * Display a tree of event. Builtin on react-sortable-tree so that event
 * can be drag'n'dropped and events rows are virtualized.
 */
const EventsTree: React.ComponentType<{
  ...EventsTreeProps,
  +ref?: React.RefSetter<EventsTreeInterface>,
}> = React.forwardRef<EventsTreeProps, EventsTreeInterface>((props, ref) => {
  const forceUpdate = useForceUpdate();

  const _list = React.useRef<?any>(null);
  const eventsHeightsCache = React.useMemo(() => new EventHeightsCache(), []);

  React.useLayoutEffect(
    () => {
      eventsHeightsCache.setOnHeightsChanged(forceUpdate);
      return () => eventsHeightsCache.setOnHeightsChanged(null);
    },
    [eventsHeightsCache, forceUpdate]
  );
  const temporaryUnfoldedNodes = React.useRef<Array<SortableTreeNode>>([]);
  const _hoverTimerId = React.useRef<?TimeoutID>(null);

  const [draggedNode, setDraggedNode] = React.useState(null);
  const [isScrolledTop, setIsScrolledTop] = React.useState(true);
  const [isScrolledBottom, setIsScrolledBottom] = React.useState(false);
  const lastKnownScrollPosition = React.useRef(0);

  // This is the data that will be displayed by the tree - reconstructed at each render
  // (because events could have changed, some could have been deleted, so we can't keep
  // any reference to them).
  // Array is created now, so can be referenced by callbacks, and filled later.
  const treeDataRoot = React.useRef<Array<SortableTreeNode>>([]);

  React.useEffect(() => {
    return () => {
      if (_hoverTimerId.current) clearTimeout(_hoverTimerId.current);
    };
  }, []);

  const forceEventsUpdate = React.useCallback(
    (cb?: () => void) => {
      // Note: do not do anything here that would trigger re-render of the events yet,
      // because they can be invalid (deleted). We just ask for a re-render of this component,
      // which will rebuild the tree data passed to SortableEventsTree.
      forceUpdate();

      // Use a timeout so that the callback is called after the events
      // have been re-rendered.
      setTimeout(() => {
        if (cb) cb();
      });
    },
    [forceUpdate]
  );

  React.useEffect(() => {
    forceUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToRow = React.useCallback((row: number) => {
    if (row === -1) return;
    const list = _list.current;
    if (!list) return;

    // If the target row is already fully visible in the DOM, skip the scroll.
    // React-window's scrollToItem uses summed item heights which can be
    // inaccurate for non-visible rows, causing unnecessary jumps.
    const container = list.container;
    if (container) {
      const element = container.querySelector(`[data-row-index="${row}"]`);
      if (element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        if (
          elementRect.top >= containerRect.top &&
          elementRect.bottom <= containerRect.bottom
        ) {
          return;
        }
      }
    }

    list.scrollToRow(row);
  }, []);

  /**
   * Unfold events so that the given one is visible
   */
  const unfoldForEvent = React.useCallback(
    (event: gdBaseEvent) => {
      gd.EventsListUnfolder.unfoldWhenContaining(props.events, event);
      forceUpdate();
    },
    [forceUpdate, props.events]
  );

  const foldAll = React.useCallback(
    () => {
      gd.EventsListUnfolder.foldAll(props.events);
      forceUpdate();
    },
    [forceUpdate, props.events]
  );

  const unfoldToLevel = React.useCallback(
    (level: number) => {
      gd.EventsListUnfolder.unfoldToLevel(props.events, level);
      forceUpdate();
    },
    [forceUpdate, props.events]
  );

  const tutorial = React.useMemo(
    () => getTutorial(props.preferences, props.tutorials, 'the-events'),
    [props.preferences, props.tutorials]
  );

  const _restoreFoldedNodes = React.useCallback(
    () => {
      temporaryUnfoldedNodes.current.forEach(
        node => node.event && node.event.setFolded(true)
      );

      temporaryUnfoldedNodes.current = [];
      forceUpdate();
    },
    [forceUpdate]
  );

  const _onEndDrag = React.useCallback(
    () => {
      // This method is always called at the end of the drag, regardless of whether
      // an event was actually dropped. It is also already called in `_onDrop` to update
      // the event list and compute history. So if draggedNode is null, we want to avoid
      // recomputing the event list.
      // $FlowFixMe[constant-condition]
      if (draggedNode) {
        setDraggedNode(null);
        _restoreFoldedNodes();
        forceUpdate();
      }
    },
    [draggedNode, _restoreFoldedNodes, forceUpdate]
  );

  // Position-based height snapshot. Used as a fallback in _getRowHeight when
  // the ptr-based cache has no entry (e.g. right after undo/redo, which
  // deserializes all events with fresh pointers). Merged rather than replaced
  // so off-screen events keep their last known height instead of collapsing to
  // defaultEventHeight.
  const heightsByRowIndex = React.useRef<{ [number]: number }>({});

  const eventPtrToRowIndex = React.useRef<{ [key: string]: number }>({});
  const getEventRow = React.useCallback(
    (searchedEvent: gdBaseEvent) => {
      const key = '' + searchedEvent.ptr;
      const rowIndex = eventPtrToRowIndex.current[key];
      return rowIndex === undefined ? -1 : rowIndex;
    },
    [eventPtrToRowIndex]
  );

  const scrollToInstruction = React.useCallback(
    (rowIndex: number, listLabel: string, instructionIndex: number) => {
      // Do NOT call scrollToRow here unconditionally. For tall event rows (many
      // actions), scrollToRow snaps the row's top edge to the viewport top even
      // when the target instruction is already visible. We only fall back to it
      // inside tryScrollToElement if the DOM element isn't found (row not yet
      // rendered by the virtual list).

      const tryScrollToElement = ({
        retriesLeft,
        didScrollToRow,
      }: {
        retriesLeft: number,
        didScrollToRow: boolean,
      }) => {
        requestAnimationFrame(() => {
          const list = _list.current;
          if (!list || !list.container) return;

          // Search by rowIndex (position-based, stable across undo/redo) rather
          // than by event.ptr which changes after every deserialization.
          let relativeNodePath = null;
          const findNode = (nodes: Array<SortableTreeNode>): boolean => {
            for (const node of nodes) {
              if (node.rowIndex === rowIndex) {
                relativeNodePath = node.relativeNodePath;
                return true;
              }
              if (node.children.length > 0 && findNode(node.children))
                return true;
            }
            return false;
          };
          findNode(treeDataRoot.current);
          if (!relativeNodePath) return;

          // For WhileEvent's loop-guard list the idPrefix gets a '-while' suffix
          // (set in WhileEvent.js) to avoid colliding with the body conditions.
          const listIdPrefix =
            listLabel === 'whileConditions'
              ? `event-${relativeNodePath.join('-')}-while`
              : `event-${relativeNodePath.join('-')}`;
          const type = listLabel === 'actions' ? 'action' : 'condition';
          const doc = list.container.ownerDocument;

          // Try the exact index first, then one below (covers undo of add where
          // the instruction at instructionIndex was removed).
          const element =
            doc.getElementById(`${listIdPrefix}-${type}-${instructionIndex}`) ||
            (instructionIndex > 0
              ? doc.getElementById(
                  `${listIdPrefix}-${type}-${instructionIndex - 1}`
                )
              : null);

          if (element) {
            const containerRect = list.container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const alreadyVisible =
              elementRect.top >= containerRect.top &&
              elementRect.bottom <= containerRect.bottom;
            if (!alreadyVisible) {
              element.scrollIntoView({ block: 'nearest' });
            }
          } else if (!didScrollToRow) {
            // Element not in DOM — the row may not be rendered by the virtual
            // list yet. Scroll to the row first, then retry.
            scrollToRow(rowIndex);
            tryScrollToElement({ retriesLeft, didScrollToRow: true });
          } else if (retriesLeft > 0) {
            tryScrollToElement({
              retriesLeft: retriesLeft - 1,
              didScrollToRow: true,
            });
          }
        });
      };

      tryScrollToElement({ retriesLeft: 2, didScrollToRow: false });
    },
    [scrollToRow]
  );

  const temporaryUnfoldNode = React.useCallback(
    (isOverLazy: boolean, node: SortableTreeNode) => {
      const { event } = node;
      if (!event) return;

      const isNodeTemporaryUnfolded = temporaryUnfoldedNodes.current.some(
        foldedNode => node.key === foldedNode.key
      );
      if (isOverLazy) {
        if (!_hoverTimerId.current && !node.expanded) {
          if (!isNodeTemporaryUnfolded) {
            _hoverTimerId.current = window.setTimeout(() => {
              // $FlowFixMe[incompatible-type] - Per the condition above, we are confident that node.event is not null.
              event.setFolded(false);
              temporaryUnfoldedNodes.current.push(node);
              forceUpdate();
            }, 1000);
          }
        }
      } else {
        if (_hoverTimerId.current) window.clearTimeout(_hoverTimerId.current);
        _hoverTimerId.current = null;
      }
    },
    [forceUpdate]
  );

  const _getRowHeight = ({ node }: { node: ?SortableTreeNode }) => {
    if (!node) {
      return 0;
    }
    if (!node.event) {
      return node.fixedHeight || 0;
    }

    const height = eventsHeightsCache.getEventHeight(node.event);
    if (height > 0) return height;
    // Fall back to the last known height for this row position. This avoids a
    // visible collapse to defaultEventHeight after undo/redo, which replaces all
    // event pointers via deserialization and empties the ptr-based cache.
    return heightsByRowIndex.current[node.rowIndex] || defaultEventHeight;
  };

  const {
    project,
    globalObjectsContainer,
    objectsContainer,
    showObjectThumbnails,
  } = props;
  const renderObjectThumbnail = React.useCallback(
    (objectName: string) => {
      if (!showObjectThumbnails) return null;

      const object = getObjectByName(
        globalObjectsContainer,
        objectsContainer,
        objectName
      );
      if (!object) return null;

      return (
        <CorsAwareImage
          className={classNames({
            [icon]: true,
          })}
          alt=""
          src={getThumbnail(project, object.getConfiguration())}
        />
      );
    },
    [project, globalObjectsContainer, objectsContainer, showObjectThumbnails]
  );

  const { onEventMoved } = props;
  const _onDrop = React.useCallback(
    (
      moveFunction: MoveFunctionArguments => void,
      currentNode: SortableTreeNode
    ) => {
      // $FlowFixMe[constant-condition]
      if (!draggedNode) return;

      moveFunction({
        node: draggedNode,
        targetNode: currentNode,
      });
      const { nodePath, event } = draggedNode;
      _onEndDrag();
      if (!event) {
        console.warn('EventsSheet: No event found in dragged node.');
        return;
      }
      const newRowIndex = getEventRow(event);
      onEventMoved(nodePath[nodePath.length - 1], newRowIndex);
    },
    [draggedNode, _onEndDrag, onEventMoved, getEventRow]
  );

  const _renderEvent = ({ node }: {| node: SortableTreeNode |}) => {
    const { event, depth, disabled, isValidElseEvent } = node;
    if (!event) return null;

    const isDragged =
      // $FlowFixMe[constant-condition]
      !!draggedNode &&
      // $FlowFixMe[invalid-compare]
      (isDescendant(draggedNode, node) || node.key === draggedNode.key);

    const eventContext = {
      eventsList: node.eventsList,
      event: event,
      indexInList: node.indexInList,
      projectScopedContainersAccessor: node.projectScopedContainersAccessor,
    };

    return (
      <div
        style={{
          opacity: isDragged ? 0.5 : 1,
          ...getEventContainerStyle(props.windowSize),
        }}
        {...dataObjectToProps({ rowIndex: node.rowIndex.toString() })}
      >
        <EventContainer
          project={props.project}
          scope={props.scope}
          globalObjectsContainer={props.globalObjectsContainer}
          objectsContainer={props.objectsContainer}
          projectScopedContainersAccessor={node.projectScopedContainersAccessor}
          event={event}
          key={event.ptr}
          eventsHeightsCache={eventsHeightsCache}
          selection={props.selection}
          leftIndentWidth={
            depth * (getIndentWidth(props.windowSize) * props.indentScale)
          }
          onUpdate={forceUpdate}
          onAddNewInstruction={instructionsListContext =>
            props.onAddNewInstruction(eventContext, instructionsListContext)
          }
          onPasteInstructions={instructionsListContext =>
            props.onPasteInstructions(eventContext, instructionsListContext)
          }
          onMoveToInstruction={instructionContext =>
            props.onMoveToInstruction(eventContext, instructionContext)
          }
          onMoveToInstructionsList={instructionContext =>
            props.onMoveToInstructionsList(eventContext, instructionContext)
          }
          onInstructionClick={instructionContext =>
            props.onInstructionClick(eventContext, instructionContext)
          }
          onInstructionDoubleClick={instructionContext =>
            props.onInstructionDoubleClick(eventContext, instructionContext)
          }
          onParameterClick={parameterContext =>
            props.onParameterClick(eventContext, parameterContext)
          }
          onVariableDeclarationClick={variableDeclarationContext =>
            props.onVariableDeclarationClick(
              eventContext,
              variableDeclarationContext
            )
          }
          onVariableDeclarationDoubleClick={variableDeclarationContext =>
            props.onVariableDeclarationDoubleClick(
              eventContext,
              variableDeclarationContext
            )
          }
          onEventClick={() =>
            props.onEventClick({
              eventsList: node.eventsList,
              event: event,
              indexInList: node.indexInList,
              projectScopedContainersAccessor:
                node.projectScopedContainersAccessor,
            })
          }
          onEndEditingEvent={() => props.onEndEditingEvent(event)}
          onEventContextMenu={(x, y) =>
            props.onEventContextMenu(x, y, {
              eventsList: node.eventsList,
              event: event,
              indexInList: node.indexInList,
              projectScopedContainersAccessor:
                node.projectScopedContainersAccessor,
            })
          }
          onInstructionContextMenu={(...args) =>
            props.onInstructionContextMenu(eventContext, ...args)
          }
          onAddInstructionContextMenu={(...args) =>
            props.onAddInstructionContextMenu(eventContext, ...args)
          }
          onOpenExternalEvents={props.onOpenExternalEvents}
          onOpenLayout={(name: string) => {
            props.onOpenLayout(name);
          }}
          disabled={
            disabled /* Use node.disabled (not event.disabled) as it is true if a parent event is disabled*/
          }
          renderObjectThumbnail={renderObjectThumbnail}
          screenType={props.screenType}
          eventsSheetWidth={props.eventsSheetWidth}
          eventsSheetHeight={props.eventsSheetHeight}
          windowSize={props.windowSize}
          idPrefix={`event-${node.relativeNodePath.join('-')}`}
          isValidElseEvent={isValidElseEvent}
          highlightedSearchText={props.highlightedSearchText}
          highlightedSearchMatchCase={props.highlightedSearchMatchCase}
          highlightedAiGeneratedEventIds={props.highlightedAiGeneratedEventIds}
          node={node}
          isDragged={isDragged}
          // $FlowFixMe[incompatible-type]
          onBeginDrag={() => setDraggedNode(node)}
          onEndDrag={_onEndDrag}
          onTemporaryUnfoldNode={isOverLazy =>
            temporaryUnfoldNode(isOverLazy, node)
          }
        />
        {/* $FlowFixMe[constant-condition] */}
        {draggedNode && (
          <DropContainer
            node={node}
            draggedNode={draggedNode}
            draggedNodeHeight={_getRowHeight({ node: draggedNode })}
            DnDComponent={EventDropTarget}
            onDrop={_onDrop}
            activateTargets={!isDragged && !!draggedNode}
            windowSize={props.windowSize}
            indentScale={props.indentScale}
            getNodeAtPath={path => {
              const result = getNodeAtPath({
                path,
                treeData: treeDataRoot.current,
                getNodeKey,
              });
              if (!result)
                throw new Error('Could not find node at path in events tree.');
              return result.node;
            }}
          />
        )}
      </div>
    );
  };

  const buildEventsTreeData = (
    treeData: Array<SortableTreeNode>,
    parentProjectScopedContainersAccessor: ProjectScopedContainersAccessor,
    eventsList: gdEventsList,
    flattenedList: Array<gdBaseEvent> = [],
    depth: number = 0,
    parentDisabled: boolean = false,
    parentAbsolutePath: Array<number> = [],
    parentRelativePath: ?Array<number> = null
  ) => {
    treeData.length = 0;
    mapFor(0, eventsList.getEventsCount(), i => {
      const event = eventsList.getEventAt(i);
      flattenedList.push(event);

      const disabled = parentDisabled || event.isDisabled();
      const absoluteIndex = flattenedList.length - 1;
      const currentAbsolutePath = parentAbsolutePath.concat(
        flattenedList.length - 1
      );
      const currentRelativePath = [...(parentRelativePath || []), i];
      const projectScopedContainersAccessor = event.canHaveVariables()
        ? parentProjectScopedContainersAccessor.makeNewProjectScopedContainersWithLocalVariables(
            event
          )
        : parentProjectScopedContainersAccessor;

      eventPtrToRowIndex.current['' + event.ptr] = absoluteIndex;

      const isValidElseEvent =
        event.getType() === 'BuiltinCommonInstructions::Else'
          ? isElseEventValid(eventsList, i)
          : false;

      const childrenTreeData: Array<SortableTreeNode> = [];
      buildEventsTreeData(
        childrenTreeData,
        projectScopedContainersAccessor,
        event.getSubEvents(),
        // flattenedList is a flat representation of events, one for each line.
        // Hence it should not contain the folded events.
        !event.isFolded() ? flattenedList : [],
        depth + 1,
        disabled,
        currentAbsolutePath,
        currentRelativePath
      );

      treeData.push({
        title: _renderEvent,
        event,
        eventsList,
        indexInList: i,
        rowIndex: absoluteIndex,
        expanded: !event.isFolded(),
        disabled,
        depth,
        key: event.ptr,
        isValidElseEvent,
        isDisabledEvent: event.isDisabled(),
        isNonExecutableEvent: !event.isExecutable(),
        children: childrenTreeData,
        nodePath: currentAbsolutePath,
        relativeNodePath: currentRelativePath,
        projectScopedContainersAccessor,
      });
    });

    // Add the bottom buttons if we're at the root
    // $FlowFixMe[incompatible-type]
    const extraNodes: Array<SortableTreeNode> = [
      depth === 0
        ? {
            title: () => (
              <BottomButtons
                onAddEvent={(eventType: string) =>
                  props.onAddNewEvent(eventType, props.events)
                }
                DnDComponent={EventDropTarget}
                draggedNode={draggedNode}
                rootEventsList={eventsList}
              />
            ),
            event: null,
            indexInList: eventsList.getEventsCount(),
            disabled: false,
            depth: 0,
            fixedHeight: 40,
            children: [],
            eventsList,
            rowIndex: flattenedList.length,
            projectScopedContainersAccessor: parentProjectScopedContainersAccessor,
            key: 'bottom-buttons',
            isValidElseEvent: false,
            isDisabledEvent: false,
            isNonExecutableEvent: false,
            // Unused, but still provided to make typing happy:
            expanded: false,
            nodePath: [flattenedList.length + 0],
            relativeNodePath: [flattenedList.length + 0],
          }
        : null,
      depth === 0 && eventsList.getEventsCount() !== 0 && tutorial
        ? {
            title: () => (
              <Line justifyContent="center">
                <TutorialMessage tutorial={tutorial} />
              </Line>
            ),
            event: null,
            indexInList: eventsList.getEventsCount() + 1,
            disabled: false,
            depth: 0,
            fixedHeight: 150,
            children: [],
            eventsList,
            rowIndex: flattenedList.length + 1,
            projectScopedContainersAccessor: parentProjectScopedContainersAccessor,
            key: 'eventstree-tutorial-node',
            isValidElseEvent: false,
            isDisabledEvent: false,
            isNonExecutableEvent: false,
            // Unused, but still provided to make typing happy:
            expanded: false,
            nodePath: [flattenedList.length + 1],
            relativeNodePath: [flattenedList.length + 1],
          }
        : null,
      depth === 0 && eventsList.getEventsCount() === 0
        ? {
            title: () => (
              <EmptyPlaceholder
                title={<Trans>Add your first event</Trans>}
                description={<Trans>Events define the rules of a game.</Trans>}
                actionLabel={<Trans>Add an event</Trans>}
                helpPagePath="/events"
                tutorialId="the-events"
                actionButtonId="add-event-button"
                onAction={() =>
                  props.onAddNewEvent(
                    'BuiltinCommonInstructions::Standard',
                    props.events
                  )
                }
              />
            ),
            event: null,
            indexInList: eventsList.getEventsCount() + 1,
            disabled: false,
            depth: 0,
            fixedHeight: 300,
            children: [],
            eventsList,
            rowIndex: flattenedList.length + 2,
            projectScopedContainersAccessor: parentProjectScopedContainersAccessor,
            key: 'empty-state',
            isValidElseEvent: false,
            isDisabledEvent: false,
            isNonExecutableEvent: false,
            // Unused, but still provided to make typing happy:
            expanded: false,
            nodePath: [flattenedList.length + 2],
            relativeNodePath: [flattenedList.length + 2],
          }
        : null,
    ].filter(Boolean);

    treeData.push(...extraNodes);
  };

  const getEventContextAtRowIndexes = (
    rowIndexes: Array<number>
  ): Array<EventContext> => {
    // We use flatDataTree instead of treeDataRoot because we need the events contexts too.
    const flatDataTree = getFlatDataFromTree({
      treeData: treeDataRoot.current,
      getNodeKey,
      ignoreCollapsed: true,
    });
    return rowIndexes
      .map(rowIndex => {
        if (!flatDataTree[rowIndex]) return null;
        const {
          node: {
            event,
            eventsList,
            indexInList,
            projectScopedContainersAccessor,
          },
        } = flatDataTree[rowIndex];
        return event
          ? {
              event,
              eventsList,
              indexInList,
              projectScopedContainersAccessor,
            }
          : null;
      })
      .filter(Boolean);
  };

  React.useImperativeHandle(ref, () => ({
    forceEventsUpdate,
    foldAll,
    unfoldToLevel,
    getEventContextAtRowIndexes,
    scrollToRow,
    scrollToInstruction,
    getEventRow,
    unfoldForEvent,
  }));

  const _onVisibilityToggle = React.useCallback(
    ({ node }: {| node: SortableTreeNode |}) => {
      const { event } = node;
      if (!event) return;

      event.setFolded(!event.isFolded());
      forceUpdate();
    },
    [forceUpdate]
  );

  const _isNodeHighlighted = React.useCallback(
    ({
      node,
      searchQuery,
    }: {
      node: SortableTreeNode,
      searchQuery: ?Array<gdBaseEvent>,
    }) => {
      const searchResults = searchQuery;
      if (!searchResults) return false;
      const { event } = node;
      if (!event) return false;

      return searchResults.some(highlightedEvent =>
        // $FlowFixMe[incompatible-exact]
        gd.compare(highlightedEvent, event)
      );
    },
    []
  );

  const _scrollUp = React.useCallback(() => {
    _list.current && _list.current.container.scrollBy({ top: -5 });
  }, []);

  const _scrollDown = React.useCallback(() => {
    _list.current && _list.current.container.scrollBy({ top: 5 });
  }, []);

  const zoomLevel = props.fontSize || 14;

  // Update treeDataRoot with the events tree. Done at each render as events
  // could change at any time, so we can't keep stale data
  // (we would risk pointing to deleted events in memory).
  buildEventsTreeData(
    treeDataRoot.current,
    props.projectScopedContainersAccessor,
    props.events
  );

  React.useLayoutEffect(() => {
    // Recompute row heights on every render. This is needed for any change
    // that affects which event is at which row (deletion, fold/unfold, move)
    // — not just changes to individual event heights. Scroll-triggered
    // re-renders (isScrolledTop / isScrolledBottom state flips) are infrequent
    // and recalculate the same heights, so the extra work is negligible.
    if (_list.current) {
      _list.current.recomputeRowHeights();
    }
    // Merge newly measured heights into the position-based snapshot so that the
    // next render after an undo/redo (which replaces all ptrs) can use them as
    // fallback heights instead of collapsing to defaultEventHeight.
    const flatData = getFlatDataFromTree({
      treeData: treeDataRoot.current,
      getNodeKey,
      ignoreCollapsed: true,
    });
    flatData.forEach(entry => {
      if (entry.node.event) {
        const h = eventsHeightsCache.getEventHeight(entry.node.event);
        if (h > 0) heightsByRowIndex.current[entry.node.rowIndex] = h;
      }
    });
  });

  return (
    <div
      style={{
        ...styles.container,
        fontSize: `${zoomLevel}px`,
        '--icon-size': `${Math.round(zoomLevel * 1.14)}px`,
        '--instruction-missing-parameter-min-width': `${Math.round(
          zoomLevel * 3
        )}px`,
      }}
    >
      {/* Disable for touchscreen because the dragged DOM node gets deleted, the */}
      {/* touch events are lost and the dnd does not drop anymore (hypothesis). */}
      {props.screenType !== 'touch' && (
        <>
          <AutoScroll
            DnDComponent={EventDropTarget}
            direction="top"
            // $FlowFixMe[constant-condition]
            activateTargets={!!draggedNode && !isScrolledTop}
            onHover={_scrollUp}
          />
          <AutoScroll
            DnDComponent={EventDropTarget}
            direction="bottom"
            // $FlowFixMe[constant-condition]
            activateTargets={!!draggedNode && !isScrolledBottom}
            onHover={_scrollDown}
          />
        </>
      )}
      <SortableTree
        treeData={
          // Pass a new array each time, otherwise the tree will not re-render.
          [...treeDataRoot.current]
        }
        scaffoldBlockPxWidth={
          getIndentWidth(props.windowSize) * props.indentScale
        }
        onVisibilityToggle={_onVisibilityToggle}
        rowHeight={_getRowHeight}
        searchMethod={_isNodeHighlighted}
        searchQuery={props.searchResults}
        searchFocusOffset={props.searchFocusOffset}
        searchFocusedEvent={
          props.searchResults && props.searchFocusOffset != null
            ? props.searchResults[props.searchFocusOffset] || null
            : null
        }
        className={props.searchResults ? eventsTreeWithSearchResults : ''}
        eventsSheetWidth={props.eventsSheetWidth}
        reactVirtualizedListProps={{
          ref: list => {
            _list.current = list;
          },
          onScroll: event => {
            if (lastKnownScrollPosition.current === event.scrollTop) {
              return;
            }
            lastKnownScrollPosition.current = event.scrollTop;
            props.onScroll && props.onScroll();
            setIsScrolledTop(event.scrollTop === 0);
            setIsScrolledBottom(
              event.clientHeight + event.scrollTop >= event.scrollHeight
            );
          },
          // 'smart': no-op if the row is already visible; centers it only when
          // it is more than one viewport away. This prevents undo of an in-view
          // edit from jumping the viewport due to accumulated height-estimate
          // errors in never-scrolled-to rows.
          scrollToAlignment: 'smart',
        }}
      />
    </div>
  );
});

export default EventsTree;
