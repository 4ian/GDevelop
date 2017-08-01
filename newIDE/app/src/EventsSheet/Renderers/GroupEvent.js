import React, { Component } from 'react';
import PropTypes from 'prop-types';
const gd = global.gd;

export default class GroupEvent extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
  };

  handleClick() {
    // TODO
    this.props.callbacks.onEditEventTemplate(this.props.event);
  }

  render() {
    var groupEvent = gd.asGroupEvent(this.props.event);

    var children = [];
    children.push(
      <span key="title" className="lead">
        {groupEvent.getName()}
      </span>
    );

    if (groupEvent.getSource() !== '') {
      children.push(
        <span key="editButton" className="btn btn-sm btn-default pull-right">
          Click/touch to edit
        </span>
      );
    }

    return (
      <div>
        {children}
      </div>
    );
  }
}
