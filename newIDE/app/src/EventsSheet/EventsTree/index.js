import React, { Component } from 'react';
import {
  SortableTreeWithoutDndContext as SortableTree,
  getNodeAtPath,
} from 'react-sortable-tree';
import EventsRenderingService from '../EventsRenderingService';
import { mapFor } from '../../Utils/MapFor';

//TODO: Any change (event not equal to its last height or new event should trigger a recomputeRowHeights)
const eventHeights = {};

class EventRenderer extends Component {
  componentDidMount() {
    const height = this._container.clientHeight;
    console.log(this.props.event.ptr, ' has height ', height);
    eventHeights[this.props.event.ptr] = height;
  }

  render() {
    const {event} = this.props;
    const EventComponent = EventsRenderingService.getEventComponent(event);

    return (
      <div
        ref={container => this._container = container}
      >
        {EventComponent && <EventComponent event={event}/>}
      </div>
    );
  }
}

const renderEvent = ({ node }) => {
  const event = node.event;

  return <EventRenderer event={event} key={event.ptr}/>;
};

const toTreeData = (eventsList, flatData = []) => {
  const treeData = mapFor(0, eventsList.getEventsCount(), i => {
    const event = eventsList.getEventAt(i);
    flatData.push(event);

    return {
      title: renderEvent,
      event,
      eventsList,
      expanded: true,
      key: event.ptr,
      children: toTreeData(event.getSubEvents(), flatData).treeData,
    };
  });

  return {
    treeData,
    flatData,
  };
};

const getNodeKey = ({ treeIndex }) => treeIndex;

export default class Tree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...toTreeData(props.events),
    };
  }

  componentDidMount() {
    this._list.wrappedInstance.recomputeRowHeights();
    this.forceUpdate();
  }

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

    this.setState(toTreeData(this.props.events), () => {
      this._list.wrappedInstance.recomputeRowHeights();
    });
  };

  render() {
    return (
      <div style={{ height: 400 }}>
        <SortableTree
          treeData={this.state.treeData}
          scaffoldBlockPxWidth={22}
          onChange={() => {}}
          onMoveNode={this._onMoveNode}
          rowHeight={({index}) => {
            const extraBorderMargin = 30;
            console.log(eventHeights);
            const event = this.state.flatData[index];
            console.log(index, "is", event);
            if (!event) return 60;

            console.log(eventHeights[event.ptr]);
            return (eventHeights[event.ptr] + extraBorderMargin) || 60;
          }}
          reactVirtualizedListProps={{
            ref: list => this._list = list,
          }}
        />
      </div>
    );
  }
}
