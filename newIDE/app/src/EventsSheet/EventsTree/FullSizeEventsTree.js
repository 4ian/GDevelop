import React, { Component } from 'react';
import EventsTree from '.';
import { background } from '../ClassNames';
import Measure from 'react-measure';

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'hidden',
  },
};

export default class FullSizeEventsTree extends Component {
  constructor() {
    super();

    this.state = {
      width: 0,
      height: 0,
    };
  }

  render() {
    return (
      <Measure
        onMeasure={({ width, height }) => this.setState({ width, height })}
      >
        <div style={styles.container} className={background}>
          {this.state.height &&
            <EventsTree
              {...this.props}
              height={this.state.height}
              ref={eventsTree =>
                this.props.eventsTreeRef &&
                this.props.eventsTreeRef(eventsTree)}
            />}
        </div>
      </Measure>
    );
  }
}
