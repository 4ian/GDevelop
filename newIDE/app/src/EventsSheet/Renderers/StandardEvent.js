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
    background: '#f1f2f2',
  },
  actionsList: {
    flex: 2,
    paddingLeft: 5,
    paddingRight: 5,
  },
};

export default class StandardEvent extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
    onAddNewInstruction: PropTypes.func.isRequired,
    onInstructionClick: PropTypes.func.isRequired,
  };

  render() {
    var standardEvent = gd.asStandardEvent(this.props.event);

    return (
      <div style={standardEventStyles.container}>
        <InstructionsList
          instrsList={standardEvent.getConditions()}
          style={standardEventStyles.conditionsList}
          areConditions
          onAddNewInstruction={this.props.onAddNewInstruction}
          onInstructionClick={this.props.onInstructionClick}
        />
        <InstructionsList
          instrsList={standardEvent.getActions()}
          style={standardEventStyles.actionsList}
          areConditions={false}
          onAddNewInstruction={this.props.onAddNewInstruction}
          onInstructionClick={this.props.onInstructionClick}
        />
      </div>
    );
  }
}
