import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EventsList from './EventsList';

export default class EventsSheet extends Component {
  static propTypes = {
    events: PropTypes.object.isRequired,
    layout: PropTypes.object.isRequired,
    callbacks: PropTypes.object.isRequired,
  }

  render() {
    // TODO: Existing Events* and Instruction* classes have been
    // ported to ES5 codebase and not yet updated.
    var element = React.createElement(EventsList, {
      eventsList: this.props.events,
      callbacks: this.props.callbacks,
    });

    return element;
  }
}