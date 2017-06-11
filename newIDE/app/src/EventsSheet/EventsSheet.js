import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EventsList from './EventsList';

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'scroll',
  },
}

export default class EventsSheet extends Component {
  static propTypes = {
    events: PropTypes.object.isRequired,
    layout: PropTypes.object.isRequired,
    callbacks: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div style={styles.container}>
        <EventsList
          eventsList={this.props.events}
          callbacks={this.props.callbacks}
        />
      </div>
    );
  }
}
