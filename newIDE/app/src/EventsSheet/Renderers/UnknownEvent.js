import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { largeSelectedArea, largeSelectableArea } from '../ClassNames';

export default class UnknownEvent extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
  };

  render() {
    return (
      <p
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
      >
        {'Unknown event of type ' + this.props.event.getType()}
      </p>
    );
  }
}
