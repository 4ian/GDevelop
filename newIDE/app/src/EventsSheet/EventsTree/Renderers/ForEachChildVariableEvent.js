// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList';
import classNames from 'classnames';
import {
  selectableArea,
  largeSelectableArea,
  largeSelectedArea,
  executableEventContainer,
  disabledText,
  instructionParameter,
  nameAndIconContainer,
  icon,
} from '../ClassNames';
import InlinePopover from '../../InlinePopover';
import SceneVariableField from '../../ParameterFields/SceneVariableField';
import { type ParameterFieldInterface } from '../../ParameterFields/ParameterFieldCommons';
import { type EventRendererProps } from './EventRenderer';
import ConditionsActionsColumns from '../ConditionsActionsColumns';
import { Trans } from '@lingui/macro';
import { shouldActivate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
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
  variableContainer: {
    marginLeft: '3px',
    marginRight: '2px',
  },
  eventLabel: {
    marginLeft: '5px',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
};

type State = {|
  editingValueIteratorVariableName: boolean,
  editingKeyIteratorVariableName: boolean,
  editingIterableVariableName: boolean,
  editingPreviousValue: ?string,
  anchorEl: ?HTMLSpanElement,
|};

export default class ForEachChildVariableEvent extends React.Component<
  EventRendererProps,
  State
> {
  _valueIteratorField: ?ParameterFieldInterface = null;
  _keyIteratorField: ?ParameterFieldInterface = null;
  _iterableField: ?ParameterFieldInterface = null;

  state = {
    editingValueIteratorVariableName: false,
    editingKeyIteratorVariableName: false,
    editingIterableVariableName: false,
    editingPreviousValue: null,
    anchorEl: null,
  };

  edit = (
    variable: 'iterable' | 'iteratorValue' | 'iteratorKey',
    anchorEl: HTMLSpanElement
  ) => {
    const forEachChildVariableEvent = gd.asForEachChildVariableEvent(
      this.props.event
    );
    const valueIteratorName = forEachChildVariableEvent.getValueIteratorVariableName();
    const keyIteratorName = forEachChildVariableEvent.getKeyIteratorVariableName();
    const iterableName = forEachChildVariableEvent.getIterableVariableName();

    // We should not need to use a timeout, but
    // if we don't do this, the InlinePopover's clickaway listener
    // is immediately picking up the event and closing.
    // Search the rest of the codebase for inlinepopover-event-hack
    setTimeout(
      () =>
        this.setState(
          {
            editingValueIteratorVariableName: variable === 'iteratorValue',
            editingKeyIteratorVariableName: variable === 'iteratorKey',
            editingIterableVariableName: variable === 'iterable',
            editingPreviousValue:
              variable === 'iterable'
                ? iterableName
                : variable === 'iteratorValue'
                ? valueIteratorName
                : keyIteratorName,
            anchorEl,
          },
          () => {
            // Give a bit of time for the popover to mount itself
            setTimeout(() => {
              const field =
                variable === 'iterable'
                  ? this._iterableField
                  : variable === 'iteratorValue'
                  ? this._valueIteratorField
                  : this._keyIteratorField;
              if (field) field.focus();
            }, 10);
          }
        ),
      10
    );
  };

  cancelEditing = () => {
    this.endEditing();

    const forEachChildVariableEvent = gd.asForEachChildVariableEvent(
      this.props.event
    );
    const {
      editingPreviousValue,
      editingIterableVariableName,
      editingValueIteratorVariableName,
      editingKeyIteratorVariableName,
    } = this.state;
    if (editingPreviousValue != null) {
      if (editingIterableVariableName) {
        forEachChildVariableEvent.setIterableVariableName(editingPreviousValue);
      } else if (editingValueIteratorVariableName) {
        forEachChildVariableEvent.setValueIteratorVariableName(
          editingPreviousValue
        );
      } else if (editingKeyIteratorVariableName) {
        forEachChildVariableEvent.setKeyIteratorVariableName(
          editingPreviousValue
        );
      }
      this.forceUpdate();
    }
  };

  endEditing = () => {
    const { anchorEl } = this.state;
    // Put back the focus after closing the inline popover.
    // $FlowFixMe
    if (anchorEl) anchorEl.focus();

    this.setState({
      editingKeyIteratorVariableName: false,
      editingValueIteratorVariableName: false,
      editingIterableVariableName: false,
      editingPreviousValue: null,
      anchorEl: null,
    });
  };

  render() {
    const forEachChildVariableEvent = gd.asForEachChildVariableEvent(
      this.props.event
    );
    const valueIteratorName = forEachChildVariableEvent.getValueIteratorVariableName();
    const keyIteratorName = forEachChildVariableEvent.getKeyIteratorVariableName();
    const iterableName = forEachChildVariableEvent.getIterableVariableName();

    return (
      <div
        style={styles.container}
        className={classNames({
          [executableEventContainer]: true,
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
      >
        <div style={styles.eventLabel}>
          <Trans>
            <span
              className={classNames({
                [disabledText]: this.props.disabled,
              })}
            >
              For every child in
              <span
                className={classNames({
                  [selectableArea]: true,
                  [instructionParameter]: true,
                  [nameAndIconContainer]: true,
                  scenevar: true,
                })}
                style={styles.variableContainer}
                onClick={e => this.edit('iterable', e.currentTarget)}
                onKeyPress={event => {
                  if (shouldActivate(event)) {
                    this.edit('iterable', event.currentTarget);
                  }
                }}
                tabIndex={0}
              >
                <img
                  className={icon}
                  src="res/types/scenevar.png"
                  alt="Scene variable"
                />
                {iterableName.length !== 0 ? (
                  <span>{iterableName}</span>
                ) : (
                  <span className="instruction-missing-parameter">
                    <Trans>{`<Select a variable>`}</Trans>
                  </span>
                )}
              </span>
              , store the child in variable
              <span
                className={classNames({
                  [selectableArea]: true,
                  [instructionParameter]: true,
                  [nameAndIconContainer]: true,
                  scenevar: true,
                })}
                style={styles.variableContainer}
                onClick={e => this.edit('iteratorValue', e.currentTarget)}
                onKeyPress={event => {
                  if (shouldActivate(event)) {
                    this.edit('iteratorValue', event.currentTarget);
                  }
                }}
                tabIndex={0}
              >
                <img
                  className={icon}
                  src="res/types/scenevar.png"
                  alt="Scene variable"
                />
                {valueIteratorName.length !== 0 ? (
                  <span>{valueIteratorName}</span>
                ) : (
                  <span>
                    <Trans>{`<Select a variable> (optional)`}</Trans>
                  </span>
                )}
              </span>
              , the child name in
              <span
                className={classNames({
                  [selectableArea]: true,
                  [instructionParameter]: true,
                  [nameAndIconContainer]: true,
                  scenevar: true,
                })}
                style={styles.variableContainer}
                onClick={e => this.edit('iteratorKey', e.currentTarget)}
                onKeyPress={event => {
                  if (shouldActivate(event)) {
                    this.edit('iteratorKey', event.currentTarget);
                  }
                }}
                tabIndex={0}
              >
                <img
                  className={icon}
                  src="res/types/scenevar.png"
                  alt="Scene variable"
                />
                {keyIteratorName.length !== 0 ? (
                  <span>{keyIteratorName}</span>
                ) : (
                  <span>
                    <Trans>{`<Select a variable> (optional)`}</Trans>
                  </span>
                )}
              </span>
              and do:
            </span>
          </Trans>
        </div>
        <ConditionsActionsColumns
          leftIndentWidth={this.props.leftIndentWidth}
          windowSize={this.props.windowSize}
          renderConditionsList={({ style, className }) => (
            <InstructionsList
              platform={this.props.project.getCurrentPlatform()}
              instrsList={forEachChildVariableEvent.getConditions()}
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
              instrsList={forEachChildVariableEvent.getActions()}
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
          open={this.state.editingValueIteratorVariableName}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.cancelEditing}
          onApply={this.endEditing}
        >
          <SceneVariableField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            value={valueIteratorName}
            onChange={text => {
              forEachChildVariableEvent.setValueIteratorVariableName(text);
              this.props.onUpdate();
            }}
            isInline
            onRequestClose={this.cancelEditing}
            onApply={this.endEditing}
            ref={iteratorField => (this._valueIteratorField = iteratorField)}
          />
        </InlinePopover>
        <InlinePopover
          open={this.state.editingKeyIteratorVariableName}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.cancelEditing}
          onApply={this.endEditing}
        >
          <SceneVariableField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            value={keyIteratorName}
            onChange={text => {
              forEachChildVariableEvent.setKeyIteratorVariableName(text);
              this.props.onUpdate();
            }}
            isInline
            onRequestClose={this.cancelEditing}
            onApply={this.endEditing}
            ref={iteratorField => (this._keyIteratorField = iteratorField)}
          />
        </InlinePopover>
        <InlinePopover
          open={this.state.editingIterableVariableName}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.cancelEditing}
          onApply={this.endEditing}
        >
          <SceneVariableField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            value={iterableName}
            onChange={text => {
              forEachChildVariableEvent.setIterableVariableName(text);
              this.props.onUpdate();
            }}
            isInline
            onRequestClose={this.cancelEditing}
            onApply={this.endEditing}
            ref={iterableField => (this._iterableField = iterableField)}
          />
        </InlinePopover>
      </div>
    );
  }
}
