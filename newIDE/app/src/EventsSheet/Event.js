import React, { Component } from 'react';
import eventsRenderingService from './EventsRenderingService.js';
import EventsList from './EventsList';
import PropTypes from 'prop-types';

const eventLongPressTime = 300;

export default class Event extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
    eventsList: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    callbacks: PropTypes.object.isRequired,
  }

  handleTouch = (event) => {
    const { callbacks } = this.props;

    if (!this.touchStartDate) {
      this.touchStartDate = Date.now();
      this.touchTimeout = setTimeout(
        function() {
          callbacks.onEventLongClicked(this.props);
        }.bind(this),
        eventLongPressTime
      );
    }
  }

  handleTouchEnd = (event) => {
    const { callbacks } = this.props;

    clearTimeout(this.touchTimeout);
    if (Date.now() - this.touchStartDate < eventLongPressTime) {
      callbacks.onEventClicked(this.props);
    }
    this.touchStartDate = undefined;
  }

  handleAddSubEventClick = () => {
    const { callbacks } = this.props;
    callbacks.onAddNewEvent(this.props);
  }

  handleFoldSubEventClick = (event) => {
    const { callbacks } = this.props;
    callbacks.onToggleEventFolding(this.props);
  }

  render() {
    var event = this.props.event;
    var elements = [];

    elements.push(
      React.createElement(
        eventsRenderingService.getEventComponent(event),
        {
          event: event,
          key: 'theEvent',
          className: 'event ' + event.getType().replace('::', '-'),
          onMouseDown: this.handleTouch,
          onMouseUp: this.handleTouchEnd,
          onTouchStart: this.handleTouch,
          onTouchMove: this.handleTouch,
          onTouchEnd: this.handleTouchEnd,
          callbacks: this.props.callbacks,
        }
      )
    );

    if (event.canHaveSubEvents()) {
      elements.push(
        <button
          className="btn btn-default btn-xs add-sub-events-button"
          key="addSubEventsButton"
          onClick={this.handleAddSubEventClick}>
          Add a sub event
        </button>
      );

      if (event.getSubEvents().getEventsCount() > 0) {
        elements.push(
          <button
            className={'btn btn-default btn-xs fold-sub-events-button ' +
              'glyphicon glyphicon-chevron-' +
              (event.isFolded() ? 'up up' : 'down down')}
            key="foldSubEventsButton"
            onClick={this.handleFoldSubEventClick}>
            {''}
          </button>
        );
      }

      if (!event.isFolded()) {
        elements.push(
          // eslint-disable-next-line
          <EventsList
            eventsList={event.getSubEvents()}
            key="subEvents"
            className="sub-events"
            callbacks={this.props.callbacks} />
        );
      }
    }

    return (
      <div
        className={'event-container ' +
          (event.isDisabled() ? 'disabled-event ' : '') +
          (event.dragging ? 'dragged-event ' : '')}>
        {elements}
      </div>
    );
  }
}