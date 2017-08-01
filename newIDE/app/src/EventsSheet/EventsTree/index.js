import React, { Component } from 'react';
import {
  SortableTreeWithoutDndContext as SortableTree,
  getNodeAtPath,
} from 'react-sortable-tree';
import EventsRenderingService from '../EventsRenderingService';
import { mapFor } from '../../Utils/MapFor';
import '../../UI/Theme/EventsTree.css';
import findIndex from 'lodash/findIndex';

/**
 * Store the height of events and notify a component whenever
 * heights have changed.
 * Needed for EventsTree as we need to tell it when heights have changed
 * so it can recompute the internal row heights of the react-virtualized List.
 */
class EventHeightsCache {
  eventHeights = {};
  component = null;

  constructor(component) {
    this.component = component;
  }

  _notifyComponent() {
    if (this.updateTimeoutId) {
      return; // An update is already scheduled.
    }

    // Notify the component, on the next tick, that heights have changed
    this.updateTimeoutId = setTimeout(
      () => {
        if (this.component) {
          this.component.onHeightsChanged(() => this.updateTimeoutId = null);
        } else {
          this.updateTimeoutId = null;
        }
      },
      0
    );
  }

  setEventHeight(event, height) {
    const cachedHeight = this.eventHeights[event.ptr];
    if (!cachedHeight || cachedHeight !== height) {
      // console.log(event.ptr, 'has a new height', height, 'old:', cachedHeight);
      this._notifyComponent();
    }

    this.eventHeights[event.ptr] = height;
  }

  getEventHeight(event) {
    return this.eventHeights[event.ptr] || 60;
  }
}

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

  render() {
    const { event } = this.props;
    const EventComponent = EventsRenderingService.getEventComponent(event);

    return (
      <div
        ref={container => this._container = container}
        onClick={this.props.onEventClick}
      >
        {EventComponent &&
          <EventComponent
            event={event}
            selected={this.props.selected}
            selectedInstructions={this.props.selectedInstructions}
            onUpdate={this._onEventUpdated}
            onAddNewInstruction={this.props.onAddNewInstruction}
            onInstructionClick={this.props.onInstructionClick}
            onInstructionDoubleClick={this.props.onInstructionDoubleClick}
          />}
      </div>
    );
  }
}

const getNodeKey = ({ treeIndex }) => treeIndex;

/**
 * Display a tree of event. Builtin on react-sortable-tree so that event
 * can be drag'n'dropped and events rows are virtualized.
 */
export default class EventsTree extends Component {
  static defaultProps = {
    selectedEvents: [],
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
      this._list.wrappedInstance.recomputeRowHeights();
      if (cb) cb();
    });
  }

  /**
   * Should be called whenever events changed (new event...)
   * from outside this component.
   */
  forceEventsUpdate(cb) {
    this.setState(this._eventsToTreeData(this.props.events), () => {
      this._list.wrappedInstance.recomputeRowHeights();
      if (cb) cb();
    });
  }

  scrollToEvent(event) {
    const row = this._getEventRow(event);
    if (row !== -1) this._list.wrappedInstance.scrollToRow(row);
  }

  _getEventRow(searchedEvent) {
    return findIndex(
      this.state.flatData,
      event => event.ptr === searchedEvent.ptr
    );
  }

  _eventsToTreeData = (eventsList, flatData = []) => {
    const treeData = mapFor(0, eventsList.getEventsCount(), i => {
      const event = eventsList.getEventAt(i);
      flatData.push(event);

      return {
        title: this._renderEvent,
        event,
        eventsList,
        expanded: true,
        key: event.ptr,
        children: this._eventsToTreeData(
          event.getSubEvents(),
          flatData
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
    const targetEventsList = targetNode && targetNode.event
      ? targetNode.event.getSubEvents()
      : this.props.events;
    const targetPosition = targetNode && targetNode.children
      ? targetNode.children.indexOf(node)
      : 0;

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

  _renderEvent = ({ node }) => {
    const event = node.event;

    return (
      <EventContainer
        event={event}
        key={event.ptr}
        eventsHeightsCache={this.eventsHeightsCache}
        onAddNewInstruction={this.props.onAddNewInstruction}
        onInstructionClick={this.props.onInstructionClick}
        onInstructionDoubleClick={this.props.onInstructionDoubleClick}
        selected={this.props.selectedEvents.indexOf(event.ptr) !== -1}
        selectedInstructions={this.props.selectedInstructions}
        onEventClick={() =>
          this.props.onEventClick({
            event,
            eventsList: node.eventsList,
          })}
      />
    );
  };

  render() {
    return (
      <div style={{ height: this.props.height || 400 }}>
        <SortableTree
          className="gd-events-list"
          treeData={this.state.treeData}
          scaffoldBlockPxWidth={22}
          onChange={() => {}}
          onMoveNode={this._onMoveNode}
          canDrop={this._canDrop}
          rowHeight={({ index }) => {
            const extraBorderMargin = 4;
            const event = this.state.flatData[index];
            return this.eventsHeightsCache.getEventHeight(event) +
              extraBorderMargin;
          }}
          reactVirtualizedListProps={{
            ref: list => this._list = list,
          }}
        />
      </div>
    );
  }
}
