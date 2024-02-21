// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  executableEventContainer,
  disabledText,
  conditionsContainer,
} from '../ClassNames';
import { type EventRendererProps } from './EventRenderer';
import ConditionsActionsColumns from '../ConditionsActionsColumns';
import { Trans } from '@lingui/macro';
const gd: libGDevelop = global.gd;

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

export default class WhileEvent extends React.Component<EventRendererProps, *> {
  render() {
    var whileEvent = gd.asWhileEvent(this.props.event);

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
          <Trans>While these conditions are true:</Trans>
        </div>
        <InstructionsList
          platform={this.props.project.getCurrentPlatform()}
          instrsList={whileEvent.getWhileConditions()}
          style={
            {} /* TODO: Use a new object to force update - somehow updates are not always propagated otherwise */
          }
          className={conditionsContainer}
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
          windowSize={this.props.windowSize}
          scope={this.props.scope}
          resourcesManager={this.props.project.getResourcesManager()}
          globalObjectsContainer={this.props.globalObjectsContainer}
          objectsContainer={this.props.objectsContainer}
          idPrefix={this.props.idPrefix}
        />
        <div
          className={classNames({
            [disabledText]: this.props.disabled,
          })}
        >
          <Trans>Repeat these:</Trans>
        </div>
        <ConditionsActionsColumns
          leftIndentWidth={this.props.leftIndentWidth}
          windowSize={this.props.windowSize}
          renderConditionsList={({ style, className }) => (
            <InstructionsList
              platform={this.props.project.getCurrentPlatform()}
              instrsList={whileEvent.getConditions()}
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
              idPrefix={this.props.idPrefix}
            />
          )}
          renderActionsList={({ className }) => (
            <InstructionsList
              platform={this.props.project.getCurrentPlatform()}
              instrsList={whileEvent.getActions()}
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
              idPrefix={this.props.idPrefix}
            />
          )}
        />
      </div>
    );
  }
}
