import React, { Component } from 'react';
import InstructionsList from '../InstructionsList';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  executableEventContainer,
} from '../ClassNames';
const gd = global.gd;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  instructionsContainer: {
    display: 'flex',
  },
  actionsList: {
    flex: 1,
  },
};

export default class ForEachEvent extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
    onAddNewInstruction: PropTypes.func.isRequired,
    onInstructionClick: PropTypes.func.isRequired,
    onInstructionDoubleClick: PropTypes.func.isRequired,
    onInstructionContextMenu: PropTypes.func.isRequired,
    onInstructionsListContextMenu: PropTypes.func.isRequired,
    onParameterClick: PropTypes.func.isRequired,
    selection: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
  };

  render() {
    var whileEvent = gd.asWhileEvent(this.props.event);

    const conditionsListSyle = {
      width: `calc(35vw - ${this.props.leftIndentWidth}px)`,
    };

    return (
      <div
        style={styles.container}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
          [executableEventContainer]: true,
        })}
      >
        <div>While these conditions are true:</div>
        <InstructionsList
          instrsList={whileEvent.getWhileConditions()}
          selection={this.props.selection}
          areConditions
          onAddNewInstruction={this.props.onAddNewInstruction}
          onInstructionClick={this.props.onInstructionClick}
          onInstructionDoubleClick={this.props.onInstructionDoubleClick}
          onInstructionContextMenu={this.props.onInstructionContextMenu}
          onParameterClick={this.props.onParameterClick}
        />
        <div>Repeat these:</div>
        <div style={styles.instructionsContainer}>
          <InstructionsList
            instrsList={whileEvent.getConditions()}
            style={conditionsListSyle}
            selection={this.props.selection}
            areConditions
            onAddNewInstruction={this.props.onAddNewInstruction}
            onInstructionClick={this.props.onInstructionClick}
            onInstructionDoubleClick={this.props.onInstructionDoubleClick}
            onInstructionContextMenu={this.props.onInstructionContextMenu}
            onInstructionsListContextMenu={
              this.props.onInstructionsListContextMenu
            }
            onParameterClick={this.props.onParameterClick}
          />
          <InstructionsList
            instrsList={whileEvent.getActions()}
            style={styles.actionsList}
            selection={this.props.selection}
            areConditions={false}
            onAddNewInstruction={this.props.onAddNewInstruction}
            onInstructionClick={this.props.onInstructionClick}
            onInstructionDoubleClick={this.props.onInstructionDoubleClick}
            onInstructionContextMenu={this.props.onInstructionContextMenu}
            onInstructionsListContextMenu={
              this.props.onInstructionsListContextMenu
            }
            onParameterClick={this.props.onParameterClick}
          />
        </div>
      </div>
    );
  }
}
