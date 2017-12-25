import React, { Component } from 'react';
import InstructionsList from '../InstructionsList.js';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
  executableEventContainer,
} from '../ClassNames';
import InlinePopover from '../../InlinePopover';
import DefaultField from '../../InstructionEditor/ParameterFields/DefaultField';
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

export default class RepeatEvent extends Component {
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
    });
  };

  endEditing = () => {
    this.setState({
      editing: false,
      anchorEl: null,
    });
  };

  render() {
    var repeatEvent = gd.asRepeatEvent(this.props.event);

    const conditionsListSyle = {
      width: `calc(35vw - ${this.props.leftIndentWidth}px)`,
    };

    const expression = repeatEvent.getRepeatExpression();
    return (
      <div
        style={styles.container}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
          [executableEventContainer]: true,
        })}
      >
        <div
          className={classNames({
            [selectableArea]: true,
          })}
          onClick={this.edit}
        >
          {expression ? (
            `Repeat ${expression} times:`
          ) : (
            <i>Click to choose how many times will be repeated</i>
          )}
        </div>
        <div style={styles.instructionsContainer}>
          <InstructionsList
            instrsList={repeatEvent.getConditions()}
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
            instrsList={repeatEvent.getActions()}
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
        <InlinePopover
          open={this.state.editing}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.endEditing}
        >
          <DefaultField
            project={this.props.project}
            layout={this.props.layout}
            value={expression}
            onChange={text => {
              repeatEvent.setRepeatExpression(text);
              this.props.onUpdate();
            }}
            isInline
          />
        </InlinePopover>
      </div>
    );
  }
}
