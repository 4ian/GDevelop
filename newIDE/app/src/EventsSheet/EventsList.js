import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types';
import Event from './Event'

export default class EventsList extends Component {
  static propTypes = {
    eventsList: PropTypes.object.isRequired,
    callbacks: PropTypes.object.isRequired,
  }

  render() {
    var children = [];
    for (var i = 0; i < this.props.eventsList.getEventsCount(); ++i) {
      var event = this.props.eventsList.getEventAt(i);
      children.push(
        React.createElement(Event, {
          event: event,
          eventsList: this.props.eventsList,
          index: i,
          key: event.ptr,
          callbacks: this.props.callbacks,
        })
      );
    }
    return React.createElement(
      'div',
      {
        className: 'events-list ' + this.props.className,
      },
      React.createElement(
        ReactCSSTransitionGroup,
        {
          transitionName: 'events-list-animation',
          transitionEnterTimeout: 200,
          transitionLeaveTimeout: 200,
        },
        children
      )
    );
  }
}