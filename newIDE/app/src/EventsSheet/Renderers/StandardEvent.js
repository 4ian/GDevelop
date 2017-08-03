import React, { Component } from 'react';
import InstructionsList from '../InstructionsList.js';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { largeSelectedArea, largeSelectableArea } from '../ClassNames';
const gd = global.gd;

const styles = {
  container: {
    display: 'flex',
  },
  conditionsList: {
    paddingLeft: 5,
    paddingRight: 5,
    background: '#f1f2f2',
    borderRight: '1px solid #d3d3d3',
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
    onInstructionDoubleClick: PropTypes.func.isRequired,
    onParameterClick: PropTypes.func.isRequired,
    selection: PropTypes.object.isRequired,
  };

  render() {
    var standardEvent = gd.asStandardEvent(this.props.event);

    const conditionsListSyle = {
      ...styles.conditionsList,
      width: `calc(35vw - ${this.props.leftIndentWidth}px)`,
    };

    return (
      <div
        style={styles.container}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
      >
        <InstructionsList
          instrsList={standardEvent.getConditions()}
          style={conditionsListSyle}
          selection={this.props.selection}
          areConditions
          onAddNewInstruction={this.props.onAddNewInstruction}
          onInstructionClick={this.props.onInstructionClick}
          onInstructionDoubleClick={this.props.onInstructionDoubleClick}
          onParameterClick={this.props.onParameterClick}
        />
        <InstructionsList
          instrsList={standardEvent.getActions()}
          style={styles.actionsList}
          selection={this.props.selection}
          areConditions={false}
          onAddNewInstruction={this.props.onAddNewInstruction}
          onInstructionClick={this.props.onInstructionClick}
          onInstructionDoubleClick={this.props.onInstructionDoubleClick}
          onParameterClick={this.props.onParameterClick}
        />
      </div>
    );
  }
}
