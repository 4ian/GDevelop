// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList.js';
import classNames from 'classnames';
import {
  selectableArea,
  executableEventContainer,
  disabledText,
  instructionParameter,
  nameAndIconContainer,
} from '../ClassNames';
import InlinePopover from '../../InlinePopover';
import SceneVariableField from '../../ParameterFields/SceneVariableField';
import { type EventRendererProps } from './EventRenderer';
import ConditionsActionsColumns from '../ConditionsActionsColumns';
import { shouldActivate } from '../../../UI/KeyboardShortcuts/InteractionKeys.js';
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

export default class ForEachStructureEvent extends React.Component<
  EventRendererProps,
  *
> {
  _objectField: ?ObjectField = null;
  state = {
    editingVariable: false,
    editingStructure: false,
    anchorEl: null,
  };

  edit = (variable: 'structure' | 'variable', domEvent: any) => {
    // We should not need to use a timeout, but
    // if we don't do this, the InlinePopover's clickaway listener
    // is immediately picking up the event and closing.
    // Search the rest of the codebase for inlinepopover-event-hack
    const anchorEl = domEvent.currentTarget;
    setTimeout(
      () =>
        this.setState(
          {
            editingVariable: variable === 'variable',
            editingStructure: variable === 'structure',
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

  endEditing = () => {
    const { anchorEl } = this.state;
    // Put back the focus after closing the inline popover.
    // $FlowFixMe
    if (anchorEl) anchorEl.focus();

    this.setState({
      editingVariable: false,
      editingStructure: false,
      anchorEl: null,
    });
  };

  render() {
    const forEachStructureEvent = gd.asForEachStructureEvent(this.props.event);
    const variableName = forEachStructureEvent.getVariable();
    const structureName = forEachStructureEvent.getStructure();

    return (
      <div
        style={styles.container}
        className={classNames({
          [executableEventContainer]: true,
        })}
      >
        <div>
          <span
            className={classNames({
              [disabledText]: this.props.disabled,
            })}
            tabIndex={0}
          >
            For every child in{' '}
            <span
              className={classNames({
                [selectableArea]: true,
                [instructionParameter]: true,
                [nameAndIconContainer]: true,
                scenevar: true,
              })}
              onClick={e => this.edit('structure', e)}
              onKeyPress={event => {
                if (shouldActivate(event)) {
                  this.edit('structure', event);
                }
              }}
            >
              <img class="icon" src="res/types/scenevar.png" alt="" />
              {structureName.length !== 0 ? (
                <span>{structureName}</span>
              ) : (
                <span className="instruction-missing-parameter">
                  No variable selected!
                </span>
              )}
            </span>
            , store the child in variable{' '}
            <span
              className={classNames({
                [selectableArea]: true,
                [instructionParameter]: true,
                [nameAndIconContainer]: true,
                scenevar: true,
              })}
              onClick={e => this.edit('variable', e)}
              onKeyPress={event => {
                if (shouldActivate(event)) {
                  this.edit('variable', event);
                }
              }}
            >
              <img class="icon" src="res/types/scenevar.png" alt="" />
              {variableName.length !== 0 ? (
                <span>{variableName}</span>
              ) : (
                <span className="instruction-missing-parameter">
                  No variable selected!
                </span>
              )}{' '}
            </span>
            and do:
          </span>
        </div>
        <ConditionsActionsColumns
          leftIndentWidth={this.props.leftIndentWidth}
          windowWidth={this.props.windowWidth}
          renderConditionsList={({ style, className }) => (
            <InstructionsList
              instrsList={forEachStructureEvent.getConditions()}
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
              windowWidth={this.props.windowWidth}
            />
          )}
          renderActionsList={({ className }) => (
            <InstructionsList
              instrsList={forEachStructureEvent.getActions()}
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
              windowWidth={this.props.windowWidth}
            />
          )}
        />
        <InlinePopover
          open={this.state.editingVariable}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.endEditing}
        >
          <SceneVariableField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            value={variableName}
            onChange={text => {
              forEachStructureEvent.setVariable(text);
              this.props.onUpdate();
            }}
            isInline
            onRequestClose={this.endEditing}
            ref={objectField => (this._objectField = objectField)}
          />
        </InlinePopover>
        <InlinePopover
          open={this.state.editingStructure}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.endEditing}
        >
          <SceneVariableField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            value={structureName}
            onChange={text => {
              forEachStructureEvent.setStructure(text);
              this.props.onUpdate();
            }}
            isInline
            onRequestClose={this.endEditing}
            ref={objectField => (this._objectField = objectField)}
          />
        </InlinePopover>
      </div>
    );
  }
}
