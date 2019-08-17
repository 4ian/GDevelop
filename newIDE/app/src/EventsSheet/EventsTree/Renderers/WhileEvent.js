// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  executableEventContainer,
  disabledText,
} from '../ClassNames';
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

export default class ForEachEvent extends React.Component<
  EventRendererProps,
  *
> {
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
        <div
          className={classNames({
            [disabledText]: this.props.disabled,
          })}
        >
          While these conditions are true:
        </div>
        <InstructionsList
          instrsList={whileEvent.getWhileConditions()}
          style={
            {} /* TODO: Use a new object to force update - somehow updates are not always propagated otherwise */
          }
          selection={this.props.selection}
          areConditions
          onAddNewInstruction={this.props.onAddNewInstruction}
          onPasteInstructions={this.props.onPasteInstructions}
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
          renderObjectThumbnail={this.props.renderObjectThumbnail}
        />
        <div
          className={classNames({
            [disabledText]: this.props.disabled,
          })}
        >
          Repeat these:
        </div>
        <div style={styles.instructionsContainer}>
          <InstructionsList
            instrsList={whileEvent.getConditions()}
            style={conditionsListSyle}
            selection={this.props.selection}
            areConditions
            onAddNewInstruction={this.props.onAddNewInstruction}
            onPasteInstructions={this.props.onPasteInstructions}
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
            renderObjectThumbnail={this.props.renderObjectThumbnail}
          />
          <InstructionsList
            instrsList={whileEvent.getActions()}
            style={
              {
                ...styles.actionsList,
              } /* TODO: Use a new object to force update - somehow updates are not always propagated otherwise */
            }
            selection={this.props.selection}
            areConditions={false}
            onAddNewInstruction={this.props.onAddNewInstruction}
            onPasteInstructions={this.props.onPasteInstructions}
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
            renderObjectThumbnail={this.props.renderObjectThumbnail}
          />
        </div>
      </div>
    );
  }
}
