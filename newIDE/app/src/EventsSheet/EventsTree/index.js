// @flow
import { Trans } from '@lingui/macro';
import React, { Component, type Node } from 'react';
import findIndex from 'lodash/findIndex';
import {
  SortableTreeWithoutDndContext,
  getFlatDataFromTree,
  getNodeAtPath,
} from 'react-sortable-tree';
import { type ConnectDragSource } from 'react-dnd';
import { mapFor } from '../../Utils/MapFor';
import { getInitialSelection, isEventSelected } from '../SelectionHandler';
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
} from '../SelectionHandler';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';
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

  onEventClick: (eventContext: EventContext) => void,
  onEndEditingEvent: () => void,
  onEventContextMenu: (x: number, y: number) => void,
  onOpenExternalEvents: string => void,
  onOpenLayout: string => void,
  renderObjectThumbnail: string => Node,

  screenType: ScreenType,
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
  } = props;
  const forceUpdate = useForceUpdate();
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const height = containerRef.current ? containerRef.current.offsetHeight : 0;
  React.useEffect(
    () => {
      eventsHeightsCache.setEventHeight(event, height);
    },
    [event, eventsHeightsCache, height]
  );

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
              onEndEditingEvent={props.onEndEditingEvent}
              onParameterClick={props.onParameterClick}
              onOpenExternalEvents={props.onOpenExternalEvents}
              onOpenLayout={props.onOpenLayout}
              disabled={
                disabled /* Use disabled (not event.disabled) as it is true if a parent event is disabled*/
              }
              renderObjectThumbnail={props.renderObjectThumbnail}
              screenType={props.screenType}
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
  eventsSheetHeight: number,
  fontSize?: number,

  preferences: Preferences,
  tutorials: ?Array<Tutorial>,
|};

// A node displayed by the SortableTree. Almost always represents an
// event, except for the buttons at the bottom of the sheet and the tutorial.
export type SortableTreeNode = {|
  // Necessary attributes for react-sortable-tree.
  title: (node: { node: SortableTreeNode }) => Node,
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
  // Key is event pointer or an identification string.
  key: number | string,

  // In case of nodes without event (buttons at the bottom of the sheet),
  // use a fixed height.
  fixedHeight?: ?number,
|};

type State = {|
  treeData: Array<any>,
  flatData: Array<gdBaseEvent>,
  draggedNode: ?SortableTreeNode,
  isScrolledTop: boolean,
  isScrolledBottom: boolean,
|};

const getNodeKey = ({ treeIndex }) => treeIndex;

/**
 * Display a tree of event. Builtin on react-sortable-tree so that event
 * can be drag'n'dropped and events rows are virtualized.
 */
export default class ThemableEventsTree extends Component<
  EventsTreeProps,
  State
> {
  static defaultProps = {
    selection: getInitialSelection(),
  };
  _list: ?any;
  eventsHeightsCache: EventHeightsCache;
  DragSourceAndDropTarget = makeDragSourceAndDropTarget<SortableTreeNode>(
    eventsSheetEventsDnDType
  );
  DropTarget = makeDropTarget<SortableTreeNode>(eventsSheetEventsDnDType);
  temporaryUnfoldedNodes: Array<SortableTreeNode>;
  _hoverTimerId: ?TimeoutID;

  constructor(props: EventsTreeProps) {
    super(props);
    this.temporaryUnfoldedNodes = [];
    this.eventsHeightsCache = new EventHeightsCache(this);
    this.state = {
      ...this._eventsToTreeData(props.events),
      draggedNode: null,
      isScrolledTop: true,
      isScrolledBottom: false,
    };
  }

  componentDidMount() {
    this.onHeightsChanged();
  }

  componentDidUpdate(prevProps: EventsTreeProps) {
    const {
      values: { hiddenTutorialHints },
    } = this.props.preferences;
    const {
      values: { hiddenTutorialHints: previousHiddenTutorialHints },
    } = prevProps.preferences;
    if (
      hiddenTutorialHints['intro-event-system'] !==
      previousHiddenTutorialHints['intro-event-system']
    ) {
      this.setState({
        ...this.state,
        treeData: this.state.treeData.filter(
          data => data.key !== 'eventstree-tutorial-node'
        ),
      });
    }
  }

  componentWillUnmount() {
    this._hoverTimerId && clearTimeout(this._hoverTimerId);
  }

  /**
   * Should be called whenever an event height has changed
   */
  onHeightsChanged(cb: ?() => void) {
    this.forceUpdate(() => {
      if (this._list && this._list.wrappedInstance.current) {
        this._list.wrappedInstance.current.recomputeRowHeights();
      }
      if (cb) cb();
    });
  }

  /**
   * Should be called whenever events changed (new event...)
   * from outside this component.
   */
  forceEventsUpdate(cb: ?() => void) {
    this.setState(this._eventsToTreeData(this.props.events), () => {
      if (this._list && this._list.wrappedInstance.current) {
        this._list.wrappedInstance.current.recomputeRowHeights();
      }
      if (cb) cb();
    });
  }

  scrollToRow(row: number) {
    if (row !== -1) {
      const currentList = this._list;
      if (currentList) {
        const listWrapper = currentList.wrappedInstance.current;
        listWrapper && listWrapper.scrollToRow(row);
      }
    }
  }

  /**
   * Unfold events so that the given one is visible
   */
  unfoldForEvent(event: gdBaseEvent) {
    gd.EventsListUnfolder.unfoldWhenContaining(this.props.events, event);
    this.forceEventsUpdate();
  }

  foldAll() {
    gd.EventsListUnfolder.foldAll(this.props.events);
    this.forceEventsUpdate();
  }

  unfoldToLevel(level: number) {
    gd.EventsListUnfolder.unfoldToLevel(this.props.events, level);
    this.forceEventsUpdate();
  }

  getEventRow(searchedEvent: gdBaseEvent) {
    // TODO: flatData could be replaced by a hashmap of events to row index
    return findIndex(
      this.state.flatData,
      event => event.ptr === searchedEvent.ptr
    );
  }

  getEventContextAtRowIndexes(rowIndexes: Array<number>): Array<EventContext> {
    // We use flatDataTree instead of this.state.flatData because we need the events contexts too.
    const flatDataTree: Array<{ node: SortableTreeNode }> = getFlatDataFromTree(
      {
        treeData: this.state.treeData,
        getNodeKey,
        ignoreCollapsed: true,
      }
    );
    return rowIndexes
      .map(rowIndex => {
        if (!flatDataTree[rowIndex]) return null;
        const {
          node: { event, eventsList, indexInList },
        } = flatDataTree[rowIndex];
        return event ? { event, eventsList, indexInList } : null;
      })
      .filter(Boolean);
  }

  _eventsToTreeData = (
    eventsList: gdEventsList,
    flatData: Array<gdBaseEvent> = [],
    depth: number = 0,
    parentDisabled: boolean = false,
    parentAbsolutePath: Array<number> = [],
    parentRelativePath: ?Array<number> = null
  ) => {
    const treeData = mapFor<SortableTreeNode>(
      0,
      eventsList.getEventsCount(),
      i => {
        const event = eventsList.getEventAt(i);
        flatData.push(event);

        const disabled = parentDisabled || event.isDisabled();
        const absoluteIndex = flatData.length - 1;
        const currentAbsolutePath = parentAbsolutePath.concat(
          flatData.length - 1
        );
        const currentRelativePath = [...(parentRelativePath || []), i];

        return {
          title: this._renderEvent,
          event,
          eventsList,
          indexInList: i,
          rowIndex: absoluteIndex,
          expanded: !event.isFolded(),
          disabled,
          depth,
          key: event.ptr, //TODO: useless?
          children: this._eventsToTreeData(
            event.getSubEvents(),
            // flatData is a flat representation of events, one for each line.
            // Hence it should not contain the folded events.
            !event.isFolded() ? flatData : [],
            depth + 1,
            disabled,
            currentAbsolutePath,
            currentRelativePath
          ).treeData,
          nodePath: currentAbsolutePath,
          relativeNodePath: currentRelativePath,
        };
      }
    );
    const tutorial = getTutorial(
      this.props.preferences,
      this.props.tutorials,
      'intro-event-system'
    );

    // Add the bottom buttons if we're at the root
    const extraNodes = [
      depth === 0
        ? {
            title: () => (
              <BottomButtons
                onAddEvent={(eventType: string) =>
                  this.props.onAddNewEvent(eventType, this.props.events)
                }
                DnDComponent={this.DropTarget}
                draggedNode={this.state.draggedNode}
                rootEventsList={eventsList}
              />
            ),
            event: null,
            indexInList: eventsList.getEventsCount(),
            disabled: false,
            depth: 0,
            fixedHeight: 40,
            children: [],
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
            key: 'eventstree-tutorial-node',
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
                tutorialId="intro-event-system"
                actionButtonId="add-event-button"
                onAction={() =>
                  this.props.onAddNewEvent(
                    'BuiltinCommonInstructions::Standard',
                    this.props.events
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
          }
        : null,
    ].filter(Boolean);

    return {
      // $FlowFixMe - We are confident treeData and extraNodes are both arrays of SortableTreeNode
      treeData: extraNodes.length ? treeData.concat(extraNodes) : treeData,
      flatData,
    };
  };

  _canDrag = (node: ?SortableTreeNode) => {
    return !!node && !!node.event;
  };

  _canDrop = (hoveredNode: SortableTreeNode) => {
    return true;
  };

  _onDrop = (
    moveFunction: MoveFunctionArguments => void,
    currentNode: SortableTreeNode
  ) => {
    const draggedNode = this.state.draggedNode;
    if (draggedNode) {
      moveFunction({
        node: draggedNode,
        targetNode: currentNode,
      });
      const { nodePath, event } = draggedNode;
      this._onEndDrag();
      if (!event) {
        console.warn('EventsSheet: No event found in dragged node.');
        return;
      }
      const newRowIndex = this.getEventRow(event);
      this.props.onEventMoved(nodePath[nodePath.length - 1], newRowIndex);
    }
  };

  _onVisibilityToggle = ({ node }: { node: SortableTreeNode }) => {
    const { event } = node;
    if (!event) return;

    event.setFolded(!event.isFolded());
    this.forceEventsUpdate();
  };

  _renderObjectThumbnail = (objectName: string) => {
    const { project, scope, showObjectThumbnails } = this.props;
    if (!showObjectThumbnails) return null;

    const object = getObjectByName(project, scope.layout, objectName);
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
  };

  _temporaryUnfoldNode = (isOverLazy: boolean, node: SortableTreeNode) => {
    const { event } = node;
    if (!event) return;

    const isNodeTemporaryUnfolded = this.temporaryUnfoldedNodes.some(
      foldedNode => node.key === foldedNode.key
    );
    if (isOverLazy) {
      if (!this._hoverTimerId && !node.expanded) {
        if (!isNodeTemporaryUnfolded) {
          this._hoverTimerId = window.setTimeout(() => {
            // $FlowFixMe - Per the condition above, we are confident that node.event is not null.
            event.setFolded(false);
            this.temporaryUnfoldedNodes.push(node);
            this.forceEventsUpdate();
          }, 1000);
        }
      }
    } else {
      window.clearTimeout(this._hoverTimerId);
      this._hoverTimerId = null;
    }
  };

  _restoreFoldedNodes = () => {
    this.temporaryUnfoldedNodes.forEach(
      node => node.event && node.event.setFolded(true)
    );

    this.temporaryUnfoldedNodes = [];
    this.forceEventsUpdate();
  };

  _getRowHeight = ({ node }: { node: ?SortableTreeNode }) => {
    if (!node) return 0;
    if (!node.event) return node.fixedHeight || 0;

    return this.eventsHeightsCache.getEventHeight(node.event);
  };

  _onEndDrag = () => {
    // This method is always called at the end of the drag, regardless of whether
    // an event was actually dropped. It is also already called in `_onDrop` to update
    // the event list and compute history. So if draggedNode is null, we want to avoid
    // recomputing the event list.
    if (this.state.draggedNode) {
      this.setState({ draggedNode: null });
      this._restoreFoldedNodes();
      this.forceEventsUpdate();
    }
  };

  _renderEvent = ({ node }: { node: SortableTreeNode }) => {
    const { event, depth, disabled } = node;
    if (!event) return null;
    const { DragSourceAndDropTarget, DropTarget } = this;
    const isDragged =
      !!this.state.draggedNode &&
      (isDescendant(this.state.draggedNode, node) ||
        node.key === this.state.draggedNode.key);
    return (
      <DragSourceAndDropTarget
        beginDrag={() => {
          this.setState({ draggedNode: node });
          return node;
        }}
        canDrag={() => this._canDrag(node)}
        canDrop={() => this._canDrop(node)}
        // Drop operations are handled by DropContainers.
        drop={() => {
          return;
        }}
        endDrag={this._onEndDrag}
      >
        {({ connectDragSource, connectDropTarget, isOverLazy }) => {
          this._temporaryUnfoldNode(isOverLazy, node);

          const eventContext = {
            eventsList: node.eventsList,
            event: event,
            indexInList: node.indexInList,
          };

          const dropTarget = (
            <div
              style={{
                opacity: isDragged ? 0.5 : 1,
                ...getEventContainerStyle(this.props.windowSize),
              }}
              {...dataObjectToProps({ rowIndex: node.rowIndex.toString() })}
            >
              <EventContainer
                project={this.props.project}
                scope={this.props.scope}
                globalObjectsContainer={this.props.globalObjectsContainer}
                objectsContainer={this.props.objectsContainer}
                event={event}
                key={event.ptr}
                eventsHeightsCache={this.eventsHeightsCache}
                selection={this.props.selection}
                leftIndentWidth={depth * getIndentWidth(this.props.windowSize)}
                onAddNewInstruction={instructionsListContext =>
                  this.props.onAddNewInstruction(
                    eventContext,
                    instructionsListContext
                  )
                }
                onPasteInstructions={instructionsListContext =>
                  this.props.onPasteInstructions(
                    eventContext,
                    instructionsListContext
                  )
                }
                onMoveToInstruction={instructionContext =>
                  this.props.onMoveToInstruction(
                    eventContext,
                    instructionContext
                  )
                }
                onMoveToInstructionsList={instructionContext =>
                  this.props.onMoveToInstructionsList(
                    eventContext,
                    instructionContext
                  )
                }
                onInstructionClick={instructionContext =>
                  this.props.onInstructionClick(
                    eventContext,
                    instructionContext
                  )
                }
                onInstructionDoubleClick={instructionContext =>
                  this.props.onInstructionDoubleClick(
                    eventContext,
                    instructionContext
                  )
                }
                onParameterClick={parameterContext =>
                  this.props.onParameterClick(eventContext, parameterContext)
                }
                onEventClick={() =>
                  this.props.onEventClick({
                    eventsList: node.eventsList,
                    event: event,
                    indexInList: node.indexInList,
                  })
                }
                onEndEditingEvent={() => this.props.onEndEditingEvent(event)}
                onEventContextMenu={(x, y) =>
                  this.props.onEventContextMenu(x, y, {
                    eventsList: node.eventsList,
                    event: event,
                    indexInList: node.indexInList,
                  })
                }
                onInstructionContextMenu={(...args) =>
                  this.props.onInstructionContextMenu(eventContext, ...args)
                }
                onAddInstructionContextMenu={(...args) =>
                  this.props.onAddInstructionContextMenu(eventContext, ...args)
                }
                onOpenExternalEvents={this.props.onOpenExternalEvents}
                onOpenLayout={(name: string) => {
                  this.props.onOpenLayout(name);
                }}
                disabled={
                  disabled /* Use node.disabled (not event.disabled) as it is true if a parent event is disabled*/
                }
                renderObjectThumbnail={this._renderObjectThumbnail}
                screenType={this.props.screenType}
                eventsSheetHeight={this.props.eventsSheetHeight}
                connectDragSource={connectDragSource}
                windowSize={this.props.windowSize}
                idPrefix={`event-${node.relativeNodePath.join('-')}`}
              />
              {this.state.draggedNode && (
                <DropContainer
                  node={node}
                  draggedNode={this.state.draggedNode}
                  draggedNodeHeight={this._getRowHeight({
                    node: this.state.draggedNode,
                  })}
                  DnDComponent={DropTarget}
                  onDrop={this._onDrop}
                  activateTargets={!isDragged && !!this.state.draggedNode}
                  windowSize={this.props.windowSize}
                  getNodeAtPath={path =>
                    getNodeAtPath({
                      path,
                      treeData: this.state.treeData,
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

  _isNodeHighlighted = ({
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
  };

  _scrollUp = () => {
    this._list && this._list.container.scrollBy({ top: -5 });
  };

  _scrollDown = () => {
    this._list && this._list.container.scrollBy({ top: 5 });
  };

  render() {
    // react-sortable-tree does the rendering by transforming treeData
    // into a flat array, the result being memoized. This hack forces
    // a re-rendering of events, by discarding the memoized flat array
    // (otherwise, no re-rendering would be done).
    const treeData = this.state.treeData ? [...this.state.treeData] : null;
    const zoomLevel = this.props.fontSize || 14;

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
        {this.props.screenType !== 'touch' && (
          <>
            <AutoScroll
              DnDComponent={this.DropTarget}
              direction="top"
              activateTargets={
                !!this.state.draggedNode && !this.state.isScrolledTop
              }
              onHover={this._scrollUp}
            />
            <AutoScroll
              DnDComponent={this.DropTarget}
              direction="bottom"
              activateTargets={
                !!this.state.draggedNode && !this.state.isScrolledBottom
              }
              onHover={this._scrollDown}
            />
          </>
        )}
        <SortableTree
          treeData={treeData}
          scaffoldBlockPxWidth={getIndentWidth(this.props.windowSize)}
          onChange={noop}
          onVisibilityToggle={this._onVisibilityToggle}
          canDrag={false}
          rowHeight={this._getRowHeight}
          searchMethod={this._isNodeHighlighted}
          searchQuery={this.props.searchResults}
          searchFocusOffset={this.props.searchFocusOffset}
          className={
            this.props.searchResults ? eventsTreeWithSearchResults : ''
          }
          reactVirtualizedListProps={{
            ref: list => (this._list = list),
            onScroll: event => {
              this.props.onScroll && this.props.onScroll();
              this.setState({
                isScrolledTop: event.scrollTop === 0,
                isScrolledBottom:
                  event.clientHeight + event.scrollTop >= event.scrollHeight,
              });
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
}
