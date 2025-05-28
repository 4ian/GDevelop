// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import {
  SortableTreeWithoutDndContext,
  getFlatDataFromTree,
  getNodeAtPath,
} from 'react-sortable-tree';
import { type ConnectDragSource } from 'react-dnd';
import { mapFor } from '../../Utils/MapFor';
import { isEventSelected } from '../SelectionHandler';
import EventsRenderingService from './EventsRenderingService';
import EventHeightsCache from './EventHeightsCache';
import classNames from 'classnames';
import {
  eventsTree,
  eventsTreeWithSearchResults,
  handle,
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
import 'react-sortable-tree/style.css';
import './style.css';
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
import { isDescendant, type MoveFunctionArguments } from './helpers';
import { dataObjectToProps } from '../../Utils/HTMLDataset';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { useLongTouch } from '../../Utils/UseLongTouch';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

const eventsSheetEventsDnDType = 'events-sheet-events-dnd-type';

const getThumbnail = ObjectsRenderingService.getThumbnail.bind(
  ObjectsRenderingService
);

const defaultIndentWidth = 22;
const smallIndentWidth = 11;

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

export const getIndentWidth = (windowSize: WindowSizeType) =>
  windowSize === 'small' ? smallIndentWidth : defaultIndentWidth;
const getEventContainerStyle = (windowSize: WindowSizeType) =>
  windowSize === 'small'
    ? styles.smallEventContainer
    : styles.defaultEventContainer;

type EventsContainerProps = {|
  eventsHeightsCache: EventHeightsCache,
  event: gdBaseEvent,
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

  connectDragSource: ConnectDragSource,
  windowSize: WindowSizeType,

  idPrefix: string,
|};

const hiddenBecauseHeightNotComputedYetStyle = {
  visibility: 'hidden',
};

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
  } = props;
  const forceUpdate = useForceUpdate();
  const containerRef = React.useRef<?HTMLDivElement>(null);

  // At EACH rendering, update the cache with the current height of the event.
  React.useLayoutEffect(() => {
    const height = containerRef.current ? containerRef.current.offsetHeight : 0;
    if (height === 0) {
      // An empty height means that the event is hidden, when navigating outside of the events sheet tab for example.
      // Don't store the height in this case.
      return;
    }
    eventsHeightsCache.setEventHeight(event, height);
  });

  const _onEventContextMenu = React.useCallback(
    (domEvent: MouseEvent) => {
      domEvent.preventDefault();
      onEventContextMenu(domEvent.clientX, domEvent.clientY);
    },
    [onEventContextMenu]
  );

  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      (domEvent: any) => {
        onEventContextMenu(domEvent.clientX, domEvent.clientY);
      },
      [onEventContextMenu]
    ),
    { context: 'events-tree-event-component' }
  );

  const EventComponent = EventsRenderingService.getEventComponent(event);

  return (
    <div
      ref={containerRef}
      onClick={props.onEventClick}
      onContextMenu={_onEventContextMenu}
      {...longTouchForContextMenuProps}
      style={
        eventsHeightsCache.getEventHeight(event)
          ? undefined
          : hiddenBecauseHeightNotComputedYetStyle
      }
    >
      {!!EventComponent && (
        <div style={styles.eventComponentContainer}>
          {props.connectDragSource(<div className={handle} />)}
          <div style={styles.container}>
            <EventComponent
              project={project}
              scope={scope}
              event={event}
              globalObjectsContainer={props.globalObjectsContainer}
              objectsContainer={props.objectsContainer}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              selected={isEventSelected(props.selection, event)}
              selection={props.selection}
              leftIndentWidth={props.leftIndentWidth}
              onUpdate={forceUpdate}
              onAddNewInstruction={props.onAddNewInstruction}
              onPasteInstructions={props.onPasteInstructions}
              onMoveToInstruction={props.onMoveToInstruction}
              onMoveToInstructionsList={props.onMoveToInstructionsList}
              onInstructionClick={props.onInstructionClick}
              onInstructionDoubleClick={props.onInstructionDoubleClick}
              onInstructionContextMenu={props.onInstructionContextMenu}
              onAddInstructionContextMenu={props.onAddInstructionContextMenu}
              onVariableDeclarationClick={props.onVariableDeclarationClick}
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
            />
          </div>
        </div>
      )}
    </div>
  );
};

const SortableTree = ({ className, ...otherProps }) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <SortableTreeWithoutDndContext
      className={`${eventsTree} ${
        gdevelopTheme.palette.type === 'light' ? 'light-theme' : 'dark-theme'
      } ${className}`}
      {...otherProps}
    />
  );
};

const noop = () => {};

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
|};

export type EventsTreeInterface = {|
  forceEventsUpdate: (cb?: () => void) => void,
  foldAll: () => void,
  unfoldToLevel: (level: number) => void,
  getEventContextAtRowIndexes: (
    rowIndexes: Array<number>
  ) => Array<EventContext>,
  scrollToRow: (row: number) => void,
  getEventRow: (event: gdBaseEvent) => number,
  unfoldForEvent: (event: gdBaseEvent) => void,
|};

// A node displayed by the SortableTree. Almost always represents an
// event, except for the buttons at the bottom of the sheet and the tutorial.
export type SortableTreeNode = {|
  // Necessary attributes for react-sortable-tree.
  title: (node: {| node: SortableTreeNode |}) => React.Node,
  children: Array<any>,
  expanded: boolean,

  eventsList: gdEventsList,
  event: ?gdBaseEvent,
  depth: number,
  disabled: boolean,
  indexInList: number,
  rowIndex: number,
  nodePath: Array<number>,
  relativeNodePath: Array<number>,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  // Key is event pointer or an identification string.
  key: number | string,

  // In case of nodes without event (buttons at the bottom of the sheet),
  // use a fixed height.
  fixedHeight?: ?number,
|};

const getNodeKey = ({ treeIndex }) => treeIndex;

/**
 * Display a tree of event. Builtin on react-sortable-tree so that event
 * can be drag'n'dropped and events rows are virtualized.
 */
const EventsTree = React.forwardRef<EventsTreeProps, EventsTreeInterface>(
  (props, ref) => {
    const forceUpdate = useForceUpdate();

    const _list = React.useRef<?any>(null);

    const DragSourceAndDropTarget = React.useMemo(
      () =>
        makeDragSourceAndDropTarget<SortableTreeNode>(eventsSheetEventsDnDType),
      []
    );
    const DropTarget = React.useMemo(
      () => makeDropTarget<SortableTreeNode>(eventsSheetEventsDnDType),
      []
    );
    const temporaryUnfoldedNodes = React.useRef<Array<SortableTreeNode>>([]);
    const _hoverTimerId = React.useRef<?TimeoutID>(null);

    const [draggedNode, setDraggedNode] = React.useState(null);
    const [isScrolledTop, setIsScrolledTop] = React.useState(true);
    const [isScrolledBottom, setIsScrolledBottom] = React.useState(false);

    // TODO: ensure this is not needed anymore.
    // componentDidUpdate(prevProps: EventsTreeProps) {
    // const {
    //   values: { hiddenTutorialHints },
    // } = props.preferences;
    // const {
    //   values: { hiddenTutorialHints: previousHiddenTutorialHints },
    // } = prevProps.preferences;
    // if (
    //   hiddenTutorialHints['intro-event-system'] !==
    //   previousHiddenTutorialHints['intro-event-system']
    // ) {
    //   this.setState({
    //     ...this.state,
    //     treeData: this.state.treeData.filter(
    //       data => data.key !== 'eventstree-tutorial-node'
    //     ),
    //   });
    // }
    // }

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

    /**
     * Should be called whenever an event height has changed
     */
    const onHeightsChanged = React.useCallback(
      (cb: ?() => void) => {
        if (_list.current && _list.current.wrappedInstance.current) {
          _list.current.wrappedInstance.current.recomputeRowHeights();
        }
        forceUpdate();

        // Use a timeout so that the callback is called after the events
        // have been re-rendered.
        setTimeout(() => {
          if (cb) cb();
        });
      },
      [forceUpdate]
    );
    const forceEventsUpdate = onHeightsChanged;

    const eventsHeightsCache = React.useMemo(
      () => new EventHeightsCache(onHeightsChanged),
      [onHeightsChanged]
    );

    React.useEffect(() => {
      onHeightsChanged();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scrollToRow = React.useCallback((row: number) => {
      if (row === -1) return;
      if (!_list.current) return;
      if (!_list.current.wrappedInstance.current) return;
      _list.current.wrappedInstance.current.scrollToRow(row);
    }, []);

    /**
     * Unfold events so that the given one is visible
     */
    const unfoldForEvent = React.useCallback(
      (event: gdBaseEvent) => {
        gd.EventsListUnfolder.unfoldWhenContaining(props.events, event);
        forceEventsUpdate();
      },
      [forceEventsUpdate, props.events]
    );

    const foldAll = React.useCallback(
      () => {
        gd.EventsListUnfolder.foldAll(props.events);
        forceEventsUpdate();
      },
      [forceEventsUpdate, props.events]
    );

    const unfoldToLevel = React.useCallback(
      (level: number) => {
        gd.EventsListUnfolder.unfoldToLevel(props.events, level);
        forceEventsUpdate();
      },
      [forceEventsUpdate, props.events]
    );

    const tutorial = React.useMemo(
      () =>
        getTutorial(props.preferences, props.tutorials, 'intro-event-system'),
      [props.preferences, props.tutorials]
    );

    const _canDrag = React.useCallback((node: ?SortableTreeNode) => {
      return !!node && !!node.event;
    }, []);

    const _canDrop = React.useCallback((hoveredNode: SortableTreeNode) => {
      return true;
    }, []);

    const _restoreFoldedNodes = React.useCallback(
      () => {
        temporaryUnfoldedNodes.current.forEach(
          node => node.event && node.event.setFolded(true)
        );

        temporaryUnfoldedNodes.current = [];
        forceEventsUpdate();
      },
      [forceEventsUpdate]
    );

    const _onEndDrag = React.useCallback(
      () => {
        // This method is always called at the end of the drag, regardless of whether
        // an event was actually dropped. It is also already called in `_onDrop` to update
        // the event list and compute history. So if draggedNode is null, we want to avoid
        // recomputing the event list.
        if (draggedNode) {
          setDraggedNode(null);
          _restoreFoldedNodes();
          forceEventsUpdate();
        }
      },
      [draggedNode, _restoreFoldedNodes, forceEventsUpdate]
    );

    const eventPtrToRowIndex = React.useRef<{ [key: string]: number }>({});
    const getEventRow = React.useCallback(
      (searchedEvent: gdBaseEvent) => {
        return eventPtrToRowIndex.current['' + searchedEvent.ptr] || -1;
      },
      [eventPtrToRowIndex]
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
                // $FlowFixMe - Per the condition above, we are confident that node.event is not null.
                event.setFolded(false);
                temporaryUnfoldedNodes.current.push(node);
                forceEventsUpdate();
              }, 1000);
            }
          }
        } else {
          if (_hoverTimerId.current) window.clearTimeout(_hoverTimerId.current);
          _hoverTimerId.current = null;
        }
      },
      [forceEventsUpdate]
    );

    const _getRowHeight = ({ node }: {| node: ?SortableTreeNode |}) => {
      if (!node) {
        return 0;
      }
      if (!node.event) {
        return node.fixedHeight || 0;
      }

      return eventsHeightsCache.getEventHeight(node.event);
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
      const { event, depth, disabled } = node;
      if (!event) return null;

      const isDragged =
        !!draggedNode &&
        (isDescendant(draggedNode, node) || node.key === draggedNode.key);
      return (
        <DragSourceAndDropTarget
          beginDrag={() => {
            setDraggedNode(node);
            return node;
          }}
          canDrag={() => _canDrag(node)}
          canDrop={() => _canDrop(node)}
          // Drop operations are handled by DropContainers.
          drop={() => {
            return;
          }}
          endDrag={_onEndDrag}
        >
          {({ connectDragSource, connectDropTarget, isOverLazy }) => {
            temporaryUnfoldNode(isOverLazy, node);

            const eventContext = {
              eventsList: node.eventsList,
              event: event,
              indexInList: node.indexInList,
              projectScopedContainersAccessor:
                node.projectScopedContainersAccessor,
            };

            const dropTarget = (
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
                  projectScopedContainersAccessor={
                    node.projectScopedContainersAccessor
                  }
                  event={event}
                  key={event.ptr}
                  eventsHeightsCache={eventsHeightsCache}
                  selection={props.selection}
                  leftIndentWidth={
                    depth *
                    (getIndentWidth(props.windowSize) * props.indentScale)
                  }
                  onAddNewInstruction={instructionsListContext =>
                    props.onAddNewInstruction(
                      eventContext,
                      instructionsListContext
                    )
                  }
                  onPasteInstructions={instructionsListContext =>
                    props.onPasteInstructions(
                      eventContext,
                      instructionsListContext
                    )
                  }
                  onMoveToInstruction={instructionContext =>
                    props.onMoveToInstruction(eventContext, instructionContext)
                  }
                  onMoveToInstructionsList={instructionContext =>
                    props.onMoveToInstructionsList(
                      eventContext,
                      instructionContext
                    )
                  }
                  onInstructionClick={instructionContext =>
                    props.onInstructionClick(eventContext, instructionContext)
                  }
                  onInstructionDoubleClick={instructionContext =>
                    props.onInstructionDoubleClick(
                      eventContext,
                      instructionContext
                    )
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
                  connectDragSource={connectDragSource}
                  windowSize={props.windowSize}
                  idPrefix={`event-${node.relativeNodePath.join('-')}`}
                />
                {draggedNode && (
                  <DropContainer
                    node={node}
                    draggedNode={draggedNode}
                    draggedNodeHeight={_getRowHeight({
                      node: draggedNode,
                    })}
                    DnDComponent={DropTarget}
                    onDrop={_onDrop}
                    activateTargets={!isDragged && !!draggedNode}
                    windowSize={props.windowSize}
                    indentScale={props.indentScale}
                    getNodeAtPath={path =>
                      getNodeAtPath({
                        path,
                        treeData: treeDataRoot.current,
                        getNodeKey,
                      }).node
                    }
                  />
                )}
              </div>
            );

            return isDragged ? dropTarget : connectDropTarget(dropTarget);
          }}
        </DragSourceAndDropTarget>
      );
    };

    // TODO: consider moving this to a standalone function.
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

        const childrenTreeData = [];
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
          key: event.ptr, //TODO: useless?
          children: childrenTreeData,
          nodePath: currentAbsolutePath,
          relativeNodePath: currentRelativePath,
          projectScopedContainersAccessor,
        });
      });

      // Add the bottom buttons if we're at the root
      const extraNodes: Array<SortableTreeNode> = [
        depth === 0
          ? {
              title: () => (
                <BottomButtons
                  onAddEvent={(eventType: string) =>
                    props.onAddNewEvent(eventType, props.events)
                  }
                  DnDComponent={DropTarget}
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
                  description={
                    <Trans>Events define the rules of a game.</Trans>
                  }
                  actionLabel={<Trans>Add an event</Trans>}
                  helpPagePath="/events"
                  tutorialId="intro-event-system"
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
      const flatDataTree: Array<{
        node: SortableTreeNode,
      }> = getFlatDataFromTree({
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
      getEventRow,
      unfoldForEvent,
    }));

    const _onVisibilityToggle = React.useCallback(
      ({ node }: {| node: SortableTreeNode |}) => {
        const { event } = node;
        if (!event) return;

        event.setFolded(!event.isFolded());
        forceEventsUpdate();
      },
      [forceEventsUpdate]
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

        return searchResults.find(highlightedEvent =>
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

    buildEventsTreeData(
      treeDataRoot.current,
      props.projectScopedContainersAccessor,
      props.events
    );

    React.useLayoutEffect(() => {
      // Recompute the row heights of the tree at each render, because there
      // is no guarantee that events heights have not changed (resizing, change in event...).
      if (_list.current && _list.current.wrappedInstance.current) {
        _list.current.wrappedInstance.current.recomputeRowHeights();
      }
    });

    return (
      <div
        style={{
          ...styles.container,
          fontSize: `${zoomLevel}px`,
          '--icon-size': `${Math.round(zoomLevel * 1.14)}px`,
          '--instruction-missing-parameter-min-height': `${Math.round(
            zoomLevel * 1.1
          )}px`,
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
              DnDComponent={DropTarget}
              direction="top"
              activateTargets={!!draggedNode && !isScrolledTop}
              onHover={_scrollUp}
            />
            <AutoScroll
              DnDComponent={DropTarget}
              direction="bottom"
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
          onChange={noop}
          onVisibilityToggle={_onVisibilityToggle}
          canDrag={false}
          rowHeight={_getRowHeight}
          searchMethod={_isNodeHighlighted}
          searchQuery={props.searchResults}
          searchFocusOffset={props.searchFocusOffset}
          className={props.searchResults ? eventsTreeWithSearchResults : ''}
          reactVirtualizedListProps={{
            ref: list => {
              _list.current = list;
            },
            onScroll: event => {
              props.onScroll && props.onScroll();
              setIsScrolledTop(event.scrollTop === 0);
              setIsScrolledBottom(
                event.clientHeight + event.scrollTop >= event.scrollHeight
              );
            },
            scrollToAlignment: 'center',
          }}
          // Disable slideRegionSize on touchscreen because of a bug that makes scrolling
          // uncontrollable on touchscreens. Ternary operator does not update slideRegionSize
          // well.
          slideRegionSize={-10}
        />
      </div>
    );
  }
);

export default EventsTree;
