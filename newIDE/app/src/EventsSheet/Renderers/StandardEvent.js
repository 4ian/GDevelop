import React, { Component } from 'react';
import InstructionsList from '../InstructionsList.js';
import PropTypes from 'prop-types';
const gd = global.gd;

const standardEventStyles = {
  container: {
    display: 'flex',
  },
  selectedContainer: {
    display: 'flex',
    background: 'orange',
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
    selectedInstructions: PropTypes.array.isRequired,
  };

  render() {
    var standardEvent = gd.asStandardEvent(this.props.event);

    const containerStyle = !this.props.selected ?
      standardEventStyles.container :
      standardEventStyles.selectedContainer;

    return (
      <div style={containerStyle}>
        <InstructionsList
          instrsList={standardEvent.getConditions()}
          style={standardEventStyles.conditionsList}
          selectedInstructions={this.props.selectedInstructions}
          areConditions
          onAddNewInstruction={this.props.onAddNewInstruction}
          onInstructionClick={this.props.onInstructionClick}
          onInstructionDoubleClick={this.props.onInstructionDoubleClick}
        />
        <InstructionsList
          instrsList={standardEvent.getActions()}
          style={standardEventStyles.actionsList}
          selectedInstructions={this.props.selectedInstructions}
          areConditions={false}
          onAddNewInstruction={this.props.onAddNewInstruction}
          onInstructionClick={this.props.onInstructionClick}
          onInstructionDoubleClick={this.props.onInstructionDoubleClick}
        />
      </div>
    );
  }
}
