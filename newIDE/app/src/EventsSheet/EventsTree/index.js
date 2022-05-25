// @flow
import { Trans } from '@lingui/macro';
import React, { Component, type Node } from 'react';
import findIndex from 'lodash/findIndex';
import {
  SortableTreeWithoutDndContext,
  getNodeAtPath,
} from 'react-sortable-tree';
import { mapFor } from '../../Utils/MapFor';
import { getInitialSelection, isEventSelected } from '../SelectionHandler';
import EventsRenderingService from './EventsRenderingService';
import EventHeightsCache from './EventHeightsCache';
import classNames from 'classnames';
import { eventsTree, eventsTreeWithSearchResults, icon } from './ClassNames';
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
import { type ScreenType } from '../../UI/Reponsive/ScreenTypeMeasurer';
import { type WidthType } from '../../UI/Reponsive/ResponsiveWindowMeasurer';

// Import default style of react-sortable-tree and the override made for EventsSheet.
import 'react-sortable-tree/style.css';
import './style.css';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import BottomButtons from './BottomButtons';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import { Line } from '../../UI/Grid';
import { type Preferences } from '../../MainFrame/Preferences/PreferencesContext';
import { type Tutorial } from '../../Utils/GDevelopServices/Tutorial';
import TutorialMessage from '../../Hints/TutorialMessage';
import getTutorial from '../../Hints/getTutorial';
const gd: libGDevelop = global.gd;

const getThumbnail = ObjectsRenderingService.getThumbnail.bind(
  ObjectsRenderingService
);

const defaultIndentWidth = 22;
const smallIndentWidth = 11;

const styles = {
  container: { flex: 1 },
  defaultEventContainer: {
    marginRight: 10,
  },
  smallEventContainer: {
    marginRight: 0,
  },
};

const getIndentWidth = (windowWidth: WidthType) =>
  windowWidth === 'small' ? smallIndentWidth : defaultIndentWidth;
const getEventContainerStyle = (windowWidth: WidthType) =>
  windowWidth === 'small'
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
  onEventContextMenu: (x: number, y: number) => void,
  onOpenExternalEvents: string => void,
  onOpenLayout: string => void,
  renderObjectThumbnail: string => Node,

  screenType: ScreenType,
  windowWidth: WidthType,
  eventsSheetHeight: number,
|};

/**
 * The component containing an event.
 * It will report the rendered event height so that the EventsTree can
 * update accordingly.
 */
class EventContainer extends Component<EventsContainerProps, {||}> {
  _container: ?any;
  componentDidMount() {
    const height = this._container ? this._container.offsetHeight : 0;
    this.props.eventsHeightsCache.setEventHeight(this.props.event, height);
  }

  componentDidUpdate() {
    const height = this._container ? this._container.offsetHeight : 0;
    this.props.eventsHeightsCache.setEventHeight(this.props.event, height);
  }

  _onEventUpdated = () => {
    this.forceUpdate();
  };

  _onEventContextMenu = (domEvent: any) => {
    domEvent.preventDefault();
    this.props.onEventContextMenu(domEvent.clientX, domEvent.clientY);
  };

  render() {
    const { event, project, scope, disabled } = this.props;
    const EventComponent = EventsRenderingService.getEventComponent(event);

    return (
      <div
        ref={container => (this._container = container)}
        onClick={this.props.onEventClick}
        onContextMenu={this._onEventContextMenu}
        style={getEventContainerStyle(this.props.windowWidth)}
      >
        {EventComponent && (
          <EventComponent
            project={project}
            scope={scope}
            event={event}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            selected={isEventSelected(this.props.selection, event)}
            selection={this.props.selection}
            leftIndentWidth={this.props.leftIndentWidth}
            onUpdate={this._onEventUpdated}
            onAddNewInstruction={this.props.onAddNewInstruction}
            onPasteInstructions={this.props.onPasteInstructions}
            onMoveToInstruction={this.props.onMoveToInstruction}
            onMoveToInstructionsList={this.props.onMoveToInstructionsList}
            onInstructionClick={this.props.onInstructionClick}
            onInstructionDoubleClick={this.props.onInstructionDoubleClick}
            onInstructionContextMenu={this.props.onInstructionContextMenu}
            onAddInstructionContextMenu={this.props.onAddInstructionContextMenu}
            onParameterClick={this.props.onParameterClick}
            onOpenExternalEvents={this.props.onOpenExternalEvents}
            onOpenLayout={this.props.onOpenLayout}
            disabled={
              disabled /* Use disabled (not event.disabled) as it is true if a parent event is disabled*/
            }
            renderObjectThumbnail={this.props.renderObjectThumbnail}
            screenType={this.props.screenType}
            windowWidth={this.props.windowWidth}
            eventsSheetHeight={this.props.eventsSheetHeight}
          />
        )}
      </div>
    );
  }
}

const getNodeKey = ({ treeIndex }) => treeIndex;

const SortableTree = ({ className, ...otherProps }) => (
  <ThemeConsumer>
    {muiTheme => (
      <SortableTreeWithoutDndContext
        className={`${eventsTree} ${
          muiTheme.eventsSheetRootClassName
        } ${className}`}
        {...otherProps}
      />
    )}
  </ThemeConsumer>
);

const noop = () => {};

type EventsTreeProps = {|
  events: gdEventsList,
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

  onEventMoved: () => void,
  onScroll?: () => void,

  screenType: ScreenType,
  windowWidth: WidthType,
  eventsSheetHeight: number,
  fontSize?: number,

  preferences: Preferences,
  tutorials: ?Array<Tutorial>,
|};

// A node displayed by the SortableTree. Almost always represents an
// event, except for the buttons at the bottom of the sheet.
type SortableTreeNode = {
  eventsList: gdEventsList,
  event: ?gdBaseEvent,
  depth: number,
  disabled: boolean,
  indexInList: number,

  // In case of nodes without event (buttons at the bottom of the sheet),
  // use a fixed height.
  fixedHeight?: ?number,
};

/**
 * Display a tree of event. Builtin on react-sortable-tree so that event
 * can be drag'n'dropped and events rows are virtualized.
 */
export default class ThemableEventsTree extends Component<EventsTreeProps, *> {
  static defaultProps = {
    selection: getInitialSelection(),
  };
  _list: ?any;
  eventsHeightsCache: EventHeightsCache;

  constructor(props: EventsTreeProps) {
    super(props);

    this.eventsHeightsCache = new EventHeightsCache(this);
    this.state = {
      ...this._eventsToTreeData(props.events),
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

  scrollToEvent(event: gdBaseEvent) {
    const row = this._getEventRow(event);
    if (row !== -1) {
      if (this._list && this._list.wrappedInstance.current) {
        this._list.wrappedInstance.current.scrollToRow(row);
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

  _getEventRow(searchedEvent: gdBaseEvent) {
    // TODO: flatData could be replaced by a hashmap of events to row index
    return findIndex(
      this.state.flatData,
      event => event.ptr === searchedEvent.ptr
    );
  }

  _eventsToTreeData = (
    eventsList: gdEventsList,
    flatData: Array<gdBaseEvent> = [],
    depth: number = 0,
    parentDisabled: boolean = false
  ) => {
    const treeData = mapFor<SortableTreeNode>(
      0,
      eventsList.getEventsCount(),
      i => {
        const event = eventsList.getEventAt(i);
        flatData.push(event);

        const disabled = parentDisabled || event.isDisabled();

        return {
          title: this._renderEvent,
          event,
          eventsList,
          indexInList: i,
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
            disabled
          ).treeData,
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
      treeData: extraNodes.length ? treeData.concat(extraNodes) : treeData,
      flatData,
    };
  };

  _onMoveNode = ({
    treeData,
    path,
    node,
  }: {
    treeData: any,
    path: Array<any>,
    node: SortableTreeNode,
  }) => {
    // Get the moved event and its list from the moved node.
    const { event, eventsList } = node;
    if (!event) return;

    // Get the event list where the event should be moved to.
    const targetPath = path.slice(0, -1);
    const target = getNodeAtPath({
      getNodeKey,
      treeData: treeData,
      path: targetPath,
    });
    const targetNode = target.node;
    const targetEventsList =
      targetNode && targetNode.event
        ? targetNode.event.getSubEvents()
        : this.props.events;
    const targetPosition =
      targetNode && targetNode.children ? targetNode.children.indexOf(node) : 0;

    // Do the move
    // Note that moveEventToAnotherEventsList does not invalidate the
    // references to the event in memory - so things refering to this event like the
    // selection in EventsSheet remain valid. This might not be needed anymore
    // if events drag'n'drop is reworked to be similar to instructions drag'n'drop.
    eventsList.moveEventToAnotherEventsList(
      event,
      targetEventsList,
      targetPosition
    );

    this.forceEventsUpdate();
    this.props.onEventMoved();
  };

  _canDrag = ({ node }: { node: ?SortableTreeNode }) => {
    return !!node && !!node.event;
  };

  _canDrop = ({ nextParent }: { nextParent: ?SortableTreeNode }) => {
    if (nextParent) {
      if (nextParent.event) {
        return nextParent.event.canHaveSubEvents();
      }
    }

    // No "nextParent" means that we're trying to drop at the root
    // of the events tree.
    return true;
  };

  _canNodeHaveChildren = (node: ?SortableTreeNode) => {
    if (node && node.event) {
      return node.event.canHaveSubEvents();
    }

    return false;
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
        src={getThumbnail(project, object)}
      />
    );
  };

  _renderEvent = ({ node }: { node: SortableTreeNode }) => {
    const { event, depth, disabled } = node;
    if (!event) return null;

    return (
      <EventContainer
        project={this.props.project}
        scope={this.props.scope}
        globalObjectsContainer={this.props.globalObjectsContainer}
        objectsContainer={this.props.objectsContainer}
        event={event}
        key={event.ptr}
        eventsHeightsCache={this.eventsHeightsCache}
        selection={this.props.selection}
        leftIndentWidth={depth * getIndentWidth(this.props.windowWidth)}
        onAddNewInstruction={this.props.onAddNewInstruction}
        onPasteInstructions={this.props.onPasteInstructions}
        onMoveToInstruction={this.props.onMoveToInstruction}
        onMoveToInstructionsList={this.props.onMoveToInstructionsList}
        onInstructionClick={this.props.onInstructionClick}
        onInstructionDoubleClick={this.props.onInstructionDoubleClick}
        onParameterClick={this.props.onParameterClick}
        onEventClick={() =>
          this.props.onEventClick({
            eventsList: node.eventsList,
            event: event,
            indexInList: node.indexInList,
          })
        }
        onEventContextMenu={(x, y) =>
          this.props.onEventContextMenu(x, y, {
            eventsList: node.eventsList,
            event: event,
            indexInList: node.indexInList,
          })
        }
        onInstructionContextMenu={this.props.onInstructionContextMenu}
        onAddInstructionContextMenu={this.props.onAddInstructionContextMenu}
        onOpenExternalEvents={this.props.onOpenExternalEvents}
        onOpenLayout={this.props.onOpenLayout}
        disabled={
          disabled /* Use node.disabled (not event.disabled) as it is true if a parent event is disabled*/
        }
        renderObjectThumbnail={this._renderObjectThumbnail}
        screenType={this.props.screenType}
        windowWidth={this.props.windowWidth}
        eventsSheetHeight={this.props.eventsSheetHeight}
      />
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
        }}
      >
        <SortableTree
          treeData={treeData}
          scaffoldBlockPxWidth={getIndentWidth(this.props.windowWidth)}
          onChange={noop}
          onVisibilityToggle={this._onVisibilityToggle}
          onMoveNode={this._onMoveNode}
          canDrag={this._canDrag}
          canDrop={this._canDrop}
          canNodeHaveChildren={this._canNodeHaveChildren}
          rowHeight={({ node }: { node: SortableTreeNode }) => {
            if (!node.event) return node.fixedHeight || 0;

            return this.eventsHeightsCache.getEventHeight(node.event);
          }}
          searchMethod={this._isNodeHighlighted}
          searchQuery={this.props.searchResults}
          searchFocusOffset={this.props.searchFocusOffset}
          className={
            this.props.searchResults ? eventsTreeWithSearchResults : ''
          }
          reactVirtualizedListProps={{
            ref: list => (this._list = list),
            onScroll: this.props.onScroll,
          }}
        />
      </div>
    );
  }
}
