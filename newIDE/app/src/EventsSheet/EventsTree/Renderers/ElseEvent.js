// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList';
import VariableDeclarationsList from '../VariableDeclarationsList';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  executableEventContainer,
  instructionInvalidParameter,
} from '../ClassNames';
import { type EventRendererProps } from './EventRenderer';
import ConditionsActionsColumns from '../ConditionsActionsColumns';
import Tooltip from '@material-ui/core/Tooltip';
import { Trans } from '@lingui/macro';

const gd: libGDevelop = global.gd;

const styles = {
  actionsList: {
    flex: 1,
  },
  elseLine: {
    paddingLeft: 4,
    fontWeight: 'bold',
  },
};

export default class ElseEvent extends React.Component<EventRendererProps, *> {
  render() {
    const elseEvent = gd.asElseEvent(this.props.event);
    const invalidElse = !this.props.isPreviousEventStandardOrElse;

    return (
      <div
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
      >
        <Tooltip
          disableHoverListener={!invalidElse}
          title={
            <Trans>
              This Else event is not preceded by a Standard/Else event, so it
              will run like a Standard event.
            </Trans>
          }
        >
          <div
            style={styles.elseLine}
            className={classNames({
              [instructionInvalidParameter]: invalidElse,
            })}
          >
            Else
          </div>
        </Tooltip>
        <VariableDeclarationsList
          variablesContainer={elseEvent.getVariables()}
          onVariableDeclarationClick={this.props.onVariableDeclarationClick}
          onVariableDeclarationDoubleClick={
            this.props.onVariableDeclarationDoubleClick
          }
          className={'local-variables-container'}
          disabled={this.props.disabled}
          screenType={this.props.screenType}
          windowSize={this.props.windowSize}
          idPrefix={this.props.idPrefix}
        />
        <ConditionsActionsColumns
          leftIndentWidth={this.props.leftIndentWidth}
          windowSize={this.props.windowSize}
          eventsSheetWidth={this.props.eventsSheetWidth}
          className={classNames({
            [executableEventContainer]: true,
          })}
          renderConditionsList={({ style, className }) => (
            <InstructionsList
              platform={this.props.project.getCurrentPlatform()}
              instrsList={elseEvent.getConditions()}
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
              onAddInstructionContextMenu={
                this.props.onAddInstructionContextMenu
              }
              onParameterClick={this.props.onParameterClick}
              disabled={this.props.disabled}
              renderObjectThumbnail={this.props.renderObjectThumbnail}
              screenType={this.props.screenType}
              windowSize={this.props.windowSize}
              scope={this.props.scope}
              resourcesManager={this.props.project.getResourcesManager()}
              globalObjectsContainer={this.props.globalObjectsContainer}
              objectsContainer={this.props.objectsContainer}
              projectScopedContainersAccessor={
                this.props.projectScopedContainersAccessor
              }
              idPrefix={this.props.idPrefix}
            />
          )}
          renderActionsList={({ className }) => (
            <InstructionsList
              platform={this.props.project.getCurrentPlatform()}
              instrsList={elseEvent.getActions()}
              style={{ ...styles.actionsList }}
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
              onAddInstructionContextMenu={
                this.props.onAddInstructionContextMenu
              }
              onParameterClick={this.props.onParameterClick}
              disabled={this.props.disabled}
              renderObjectThumbnail={this.props.renderObjectThumbnail}
              screenType={this.props.screenType}
              windowSize={this.props.windowSize}
              scope={this.props.scope}
              resourcesManager={this.props.project.getResourcesManager()}
              globalObjectsContainer={this.props.globalObjectsContainer}
              objectsContainer={this.props.objectsContainer}
              projectScopedContainersAccessor={
                this.props.projectScopedContainersAccessor
              }
              idPrefix={this.props.idPrefix}
            />
          )}
        />
      </div>
    );
  }
}
