import React, { Component } from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import findIndex from 'lodash/findIndex';
import {
  SortableTreeWithoutDndContext,
  getNodeAtPath,
} from 'react-sortable-tree';
import { mapFor } from '../../Utils/MapFor';
import { getInitialSelection, isEventSelected } from '../SelectionHandler';
import EventsRenderingService from './EventsRenderingService';
import EventHeightsCache from './EventHeightsCache';
import { eventsTree } from './ClassNames';
import './style.css';

const indentWidth = 22;

/**
 * The component containing an event.
 * It will report the rendered event height so that the EventsTree can
 * update accordingly.
 */
class EventContainer extends Component {
  componentDidMount() {
    const height = this._container.offsetHeight;
    this.props.eventsHeightsCache.setEventHeight(this.props.event, height);
  }

  componentDidUpdate() {
    const height = this._container.offsetHeight;
    this.props.eventsHeightsCache.setEventHeight(this.props.event, height);
  }

  _onEventUpdated = () => {
    this.forceUpdate();
  };

  _onEventContextMenu = domEvent => {
    domEvent.preventDefault();
    this.props.onEventContextMenu(domEvent.clientX, domEvent.clientY);
  };

  render() {
    const { event, project, layout } = this.props;
    const EventComponent = EventsRenderingService.getEventComponent(event);

    return (
      <div
        ref={container => (this._container = container)}
        onClick={this.props.onEventClick}
        onContextMenu={this._onEventContextMenu}
      >
        {EventComponent && (
          <EventComponent
            project={project}
            layout={layout}
            event={event}
            selected={isEventSelected(this.props.selection, event)}
            selection={this.props.selection}
            leftIndentWidth={this.props.leftIndentWidth}
            onUpdate={this._onEventUpdated}
            onAddNewInstruction={this.props.onAddNewInstruction}
            onInstructionClick={this.props.onInstructionClick}
            onInstructionDoubleClick={this.props.onInstructionDoubleClick}
            onInstructionContextMenu={this.props.onInstructionContextMenu}
            onInstructionsListContextMenu={
              this.props.onInstructionsListContextMenu
            }
            onParameterClick={this.props.onParameterClick}
            onOpenExternalEvents={this.props.onOpenExternalEvents}
            onOpenLayout={this.props.onOpenLayout}
          />
        )}
      </div>
    );
  }
}

const getNodeKey = ({ treeIndex }) => treeIndex;

const ThemableSortableTree = ({ muiTheme, ...otherProps }) => (
  <SortableTreeWithoutDndContext
    className={`${eventsTree} ${muiTheme.eventsSheetRootClassName}`}
    {...otherProps}
  />
);
const SortableTree = muiThemeable()(ThemableSortableTree);

/**
 * Display a tree of event. Builtin on react-sortable-tree so that event
 * can be drag'n'dropped and events rows are virtualized.
 */
export default class ThemableEventsTree extends Component {
  static defaultProps = {
    selection: getInitialSelection(),
  };

  constructor(props) {
    super(props);

    this.eventsHeightsCache = new EventHeightsCache(this);
    this.state = {
      ...this._eventsToTreeData(props.events),
    };
  }

  componentDidMount() {
    this.onHeightsChanged();
  }

  /**
   * Should be called whenever an event height has changed
   */
  onHeightsChanged(cb) {
    this.forceUpdate(() => {
      if (this._list) this._list.wrappedInstance.recomputeRowHeights();
      if (cb) cb();
    });
  }

  /**
   * Should be called whenever events changed (new event...)
   * from outside this component.
   */
  forceEventsUpdate(cb) {
    this.setState(this._eventsToTreeData(this.props.events), () => {
      if (this._list) this._list.wrappedInstance.recomputeRowHeights();
      if (cb) cb();
    });
  }

  scrollToEvent(event) {
    const row = this._getEventRow(event);
    if (row !== -1 && this._list) this._list.wrappedInstance.scrollToRow(row);
  }

  _getEventRow(searchedEvent) {
    return findIndex(
      this.state.flatData,
      event => event.ptr === searchedEvent.ptr
    );
  }

  _eventsToTreeData = (eventsList, flatData = [], depth = 0) => {
    const treeData = mapFor(0, eventsList.getEventsCount(), i => {
      const event = eventsList.getEventAt(i);
      flatData.push(event);

      return {
        title: this._renderEvent,
        event,
        eventsList,
        indexInList: i,
        expanded: !event.isFolded(),
        depth,
        key: event.ptr, //TODO: useless?
        children: this._eventsToTreeData(
          event.getSubEvents(),
          // flatData is a flat representation of events, one for each line.
          // Hence it should not contain the folded events.
          !event.isFolded() ? flatData : [],
          depth + 1
        ).treeData,
      };
    });

    return {
      treeData,
      flatData,
    };
  };

  _onMoveNode = ({ treeData, path, node }) => {
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

    // Get the moved event and its list from the moved node.
    const { event, eventsList } = node;

    // Do the move
    const newEvent = event.clone();
    eventsList.removeEvent(event);
    targetEventsList.insertEvent(newEvent, targetPosition);
    newEvent.delete();

    this.forceEventsUpdate();
  };

  _canDrop = ({ nextParent }) => {
    if (nextParent && nextParent.event)
      return nextParent.event.canHaveSubEvents();

    return true;
  };

  _onVisibilityToggle = ({ node }) => {
    const { event } = node;

    event.setFolded(!event.isFolded());
    this.forceEventsUpdate();
  };

  _renderEvent = ({ node }) => {
    const { event, depth } = node;

    return (
      <EventContainer
        project={this.props.project}
        layout={this.props.layout}
        event={event}
        key={event.ptr}
        eventsHeightsCache={this.eventsHeightsCache}
        selection={this.props.selection}
        leftIndentWidth={depth * indentWidth}
        onAddNewInstruction={this.props.onAddNewInstruction}
        onInstructionClick={this.props.onInstructionClick}
        onInstructionDoubleClick={this.props.onInstructionDoubleClick}
        onParameterClick={this.props.onParameterClick}
        onEventClick={() => this.props.onEventClick(node)}
        onEventContextMenu={(x, y) => this.props.onEventContextMenu(x, y, node)}
        onInstructionContextMenu={this.props.onInstructionContextMenu}
        onInstructionsListContextMenu={this.props.onInstructionsListContextMenu}
        onOpenExternalEvents={this.props.onOpenExternalEvents}
        onOpenLayout={this.props.onOpenLayout}
      />
    );
  };

  render() {
    const { height } = this.props;

    return (
      <div style={{ height: height || 400 }}>
        <SortableTree
          treeData={this.state.treeData}
          scaffoldBlockPxWidth={indentWidth}
          onChange={() => {}}
          onVisibilityToggle={this._onVisibilityToggle}
          onMoveNode={this._onMoveNode}
          canDrop={this._canDrop}
          rowHeight={({ index }) => {
            const event = this.state.flatData[index];
            if (!event) return 0;

            return this.eventsHeightsCache.getEventHeight(event);
          }}
          reactVirtualizedListProps={{
            ref: list => (this._list = list),
          }}
        />
      </div>
    );
  }
}
