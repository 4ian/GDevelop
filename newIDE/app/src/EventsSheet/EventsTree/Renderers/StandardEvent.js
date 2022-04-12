// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  executableEventContainer,
} from '../ClassNames';
import { type EventRendererProps } from './EventRenderer';
import ConditionsActionsColumns from '../ConditionsActionsColumns';
const gd: libGDevelop = global.gd;

const styles = {
  actionsList: {
    flex: 1,
  },
};

export default class StandardEvent extends React.Component<
  EventRendererProps,
  *
> {
  render() {
    var standardEvent = gd.asStandardEvent(this.props.event);

    return (
      <ConditionsActionsColumns
        leftIndentWidth={this.props.leftIndentWidth}
        windowWidth={this.props.windowWidth}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
          [executableEventContainer]: true,
        })}
        renderConditionsList={({ style, className }) => (
          <InstructionsList
            instrsList={standardEvent.getConditions()}
            style={style}
            className={className}
            selection={this.props.selection}
            areConditions
            onAddNewInstruction={this.props.onAddNewInstruction}
            onPasteInstructions={this.props.onPasteInstructions}
            onMoveToInstruction={this.props.onMoveToInstruction}
            onMoveToInstructionsList={this.props.onMoveToInstructionsList}
            onInstructionClick={this.props.onInstructionClick}
            onInstructionDoubleClick={this.props.onInstructionDoubleClick}
            onInstructionContextMenu={this.props.onInstructionContextMenu}
            onAddInstructionContextMenu={this.props.onAddInstructionContextMenu}
            onParameterClick={this.props.onParameterClick}
            disabled={this.props.disabled}
            renderObjectThumbnail={this.props.renderObjectThumbnail}
            screenType={this.props.screenType}
            windowWidth={this.props.windowWidth}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
          />
        )}
        renderActionsList={({ className }) => (
          <InstructionsList
            instrsList={standardEvent.getActions()}
            style={
              {
                ...styles.actionsList,
              } /* TODO: Use a new object to force update - somehow updates are not always propagated otherwise */
            }
            className={className}
            selection={this.props.selection}
            areConditions={false}
            onAddNewInstruction={this.props.onAddNewInstruction}
            onPasteInstructions={this.props.onPasteInstructions}
            onMoveToInstruction={this.props.onMoveToInstruction}
            onMoveToInstructionsList={this.props.onMoveToInstructionsList}
            onInstructionClick={this.props.onInstructionClick}
            onInstructionDoubleClick={this.props.onInstructionDoubleClick}
            onInstructionContextMenu={this.props.onInstructionContextMenu}
            onAddInstructionContextMenu={this.props.onAddInstructionContextMenu}
            onParameterClick={this.props.onParameterClick}
            disabled={this.props.disabled}
            renderObjectThumbnail={this.props.renderObjectThumbnail}
            screenType={this.props.screenType}
            windowWidth={this.props.windowWidth}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
          />
        )}
      />
    );
  }
}
