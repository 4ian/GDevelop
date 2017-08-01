import React, { Component } from 'react';
import EventsTree from '.';

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

export default class FullSizeEventsTree extends Component {
  render() {
    return (
      <div style={styles.container}>
        <EventsTree {...this.props}
              ref={eventsTree =>
                this.props.eventsTreeRef && this.props.eventsTreeRef(eventsTree)}/>
      </div>
    );
  }
}
