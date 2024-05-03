// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
  executableEventContainer,
  disabledText,
} from '../ClassNames';
import InlinePopover from '../../InlinePopover';
import ObjectField from '../../ParameterFields/ObjectField';
import { type EventRendererProps } from './EventRenderer';
import ConditionsActionsColumns from '../ConditionsActionsColumns';
import { shouldActivate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { type ParameterFieldInterface } from '../../ParameterFields/ParameterFieldCommons';
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

export default class ForEachEvent extends React.Component<
  EventRendererProps,
  *
> {
  _objectField: ?ParameterFieldInterface = null;
  state = {
    editing: false,
    editingPreviousValue: null,
    anchorEl: null,
  };

  edit = (domEvent: any) => {
    const forEachEvent = gd.asForEachEvent(this.props.event);
    const objectName = forEachEvent.getObjectToPick();

    // We should not need to use a timeout, but
    // if we don't do this, the InlinePopover's clickaway listener
    // is immediately picking up the event and closing.
    // Search the rest of the codebase for inlinepopover-event-hack
    const anchorEl = domEvent.currentTarget;
    setTimeout(
      () =>
        this.setState(
          {
            editing: true,
            editingPreviousValue: objectName,
            anchorEl,
          },
          () => {
            // Give a bit of time for the popover to mount itself
            setTimeout(() => {
              if (this._objectField) this._objectField.focus();
            }, 10);
          }
        ),
      10
    );
  };

  cancelEditing = () => {
    this.endEditing();

    const forEachEvent = gd.asForEachEvent(this.props.event);
    const { editingPreviousValue } = this.state;
    if (editingPreviousValue != null) {
      forEachEvent.setObjectToPick(editingPreviousValue);
      this.forceUpdate();
    }
  };

  endEditing = () => {
    const { anchorEl } = this.state;
    // Put back the focus after closing the inline popover.
    // $FlowFixMe
    if (anchorEl) anchorEl.focus();

    this.setState({
      editing: false,
      editingPreviousValue: null,
      anchorEl: null,
    });
  };

  render() {
    const forEachEvent = gd.asForEachEvent(this.props.event);
    const objectName = forEachEvent.getObjectToPick();

    return (
      <div
        style={styles.container}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
          [executableEventContainer]: true,
        })}
      >
        <div>
          <span
            className={classNames({
              [selectableArea]: true,
              [disabledText]: this.props.disabled,
            })}
            onClick={this.edit}
            onKeyPress={event => {
              if (shouldActivate(event)) {
                this.edit(event);
              }
            }}
            tabIndex={0}
          >
            {objectName ? (
              <Trans>Repeat for each instance of {objectName}:</Trans>
            ) : (
              <i>
                <Trans>
                  Click to choose for which objects this event will be repeated
                </Trans>
              </i>
            )}
          </span>
        </div>
        <ConditionsActionsColumns
          leftIndentWidth={this.props.leftIndentWidth}
          windowSize={this.props.windowSize}
          renderConditionsList={({ style, className }) => (
            <InstructionsList
              platform={this.props.project.getCurrentPlatform()}
              instrsList={forEachEvent.getConditions()}
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
              instrsList={forEachEvent.getActions()}
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
        <InlinePopover
          open={this.state.editing}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.cancelEditing}
          onApply={this.endEditing}
        >
          <ObjectField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            value={objectName}
            onChange={text => {
              forEachEvent.setObjectToPick(text);
              this.props.onUpdate();
            }}
            isInline
            onRequestClose={this.cancelEditing}
            onApply={this.endEditing}
            ref={objectField => (this._objectField = objectField)}
          />
        </InlinePopover>
      </div>
    );
  }
}
