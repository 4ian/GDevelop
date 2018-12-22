// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList.js';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
  executableEventContainer,
  disabledText,
} from '../ClassNames';
import InlinePopover from '../../InlinePopover';
import DefaultField from '../../ParameterFields/DefaultField';
import { type EventRendererProps } from './EventRenderer.flow';
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

export default class RepeatEvent extends React.Component<
  EventRendererProps,
  *
> {
  state = {
    editing: false,
    anchorEl: null,
  };

  edit = (domEvent: any) => {
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
            [disabledText]: this.props.disabled,
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
            onMoveToInstruction={this.props.onMoveToInstruction}
            onMoveToInstructionsList={this.props.onMoveToInstructionsList}
            onInstructionClick={this.props.onInstructionClick}
            onInstructionDoubleClick={this.props.onInstructionDoubleClick}
            onInstructionContextMenu={this.props.onInstructionContextMenu}
            onInstructionsListContextMenu={
              this.props.onInstructionsListContextMenu
            }
            onParameterClick={this.props.onParameterClick}
            disabled={this.props.disabled}
          />
          <InstructionsList
            instrsList={repeatEvent.getActions()}
            style={styles.actionsList}
            selection={this.props.selection}
            areConditions={false}
            onAddNewInstruction={this.props.onAddNewInstruction}
            onMoveToInstruction={this.props.onMoveToInstruction}
            onMoveToInstructionsList={this.props.onMoveToInstructionsList}
            onInstructionClick={this.props.onInstructionClick}
            onInstructionDoubleClick={this.props.onInstructionDoubleClick}
            onInstructionContextMenu={this.props.onInstructionContextMenu}
            onInstructionsListContextMenu={
              this.props.onInstructionsListContextMenu
            }
            onParameterClick={this.props.onParameterClick}
            disabled={this.props.disabled}
          />
        </div>
        <InlinePopover
          open={this.state.editing}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.endEditing}
        >
          <DefaultField
            project={this.props.project}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
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
