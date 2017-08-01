import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class UnknownEvent extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
  };

  render() {
    return (
      <p>
        {'Unknown event of type ' + this.props.event.getType()}
      </p>
    );
  }
}
