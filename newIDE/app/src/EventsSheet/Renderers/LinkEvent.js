import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
} from '../ClassNames';
import InlinePopover from '../InlinePopover';
import ExternalEventsField from '../InstructionEditor/ParameterFields/ExternalEventsField';
const gd = global.gd;

const styles = {
  container: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    padding: 5,
  },
  title: {
    fontSize: 18,
  },
};

export default class LinkEvent extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
  };

  _externalEventsField = null;

  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      anchorEl: null,
    };
  }

  edit = domEvent => {
    this.setState({
      editing: true,
      anchorEl: domEvent.currentTarget,
    }, () => {
      if (this._externalEventsField) this._externalEventsField.focus();
    });
  };

  endEditing = () => {
    this.setState({
      editing: false,
      anchorEl: null,
    });
  };

  render() {
    var linkEvent = gd.asLinkEvent(this.props.event);
    const target = linkEvent.getTarget();

    return (
      <div
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
        style={styles.container}
      >
        <span style={styles.title}>
          Include events from {' '}
          <i
            className={classNames({
              [selectableArea]: true,
            })}
            onClick={this.edit}
          >
            {target || '< Enter the name of external events >'}
          </i>
        </span>
        <InlinePopover
          open={this.state.editing}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.endEditing}
        >
          <ExternalEventsField
            project={this.props.project}
            value={target}
            onChange={text => {
              linkEvent.setTarget(text);
              this.props.onUpdate();
            }}
            isInline
            ref={externalEventsField => this._externalEventsField = externalEventsField}
          />
        </InlinePopover>
      </div>
    );
  }
}
