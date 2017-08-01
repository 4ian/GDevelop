import React, { Component } from 'react';
import InstructionsList from '../InstructionsList.js';
import PropTypes from 'prop-types';
const gd = global.gd;

const standardEventStyles = {
  container: {
    display: 'flex',
  },
  conditionsList: {
    flex: 1,
    paddingLeft: 5,
    paddingRight: 5,
    background: '#F5F6FC',
  },
  actionsList: {
    flex: 1,
    paddingLeft: 5,
    paddingRight: 5,
  },
};

export default class StandardEvent extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
  };

  render() {
    var standardEvent = gd.asStandardEvent(this.props.event);

    return (
      <div style={standardEventStyles.container}>
        <InstructionsList
          instrsList={standardEvent.getConditions()}
          style={standardEventStyles.conditionsList}
          areConditions
        />
        <InstructionsList
          instrsList={standardEvent.getActions()}
          style={standardEventStyles.actionsList}
          areConditions={false}
        />
      </div>
    );
  }
}
