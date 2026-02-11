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
  instructionParameter,
  instructionInvalidParameter,
} from '../ClassNames';
import InlinePopover from '../../InlinePopover';
import ExpressionField from '../../ParameterFields/ExpressionField';
import { type ParameterFieldInterface } from '../../ParameterFields/ParameterFieldCommons';
import { type EventRendererProps } from './EventRenderer';
import ConditionsActionsColumns from '../ConditionsActionsColumns';
import { shouldActivate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import ParameterRenderingService from '../../ParameterRenderingService';
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

export default class RepeatEvent extends React.Component<
  EventRendererProps,
  *
> {
  _field: ?ParameterFieldInterface = null;
  state = {
    editing: false,
    editingPreviousValue: null,
    anchorEl: null,
  };

  edit = (domEvent: any) => {
    const repeatEvent = gd.asRepeatEvent(this.props.event);
    const expression = repeatEvent.getRepeatExpression().getPlainString();

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
            editingPreviousValue: expression,
            anchorEl,
          },
          () => {
            // Give a bit of time for the popover to mount itself
            setTimeout(() => {
              if (this._field) this._field.focus();
            }, 10);
          }
        ),
      10
    );
  };

  cancelEditing = () => {
    this.endEditing();

    const repeatEvent = gd.asRepeatEvent(this.props.event);
    const { editingPreviousValue } = this.state;
    if (editingPreviousValue != null) {
      repeatEvent.setRepeatExpressionPlainString(editingPreviousValue);
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
    const repeatEvent = gd.asRepeatEvent(this.props.event);
    const expression = repeatEvent.getRepeatExpression();
    const expressionPlainString = expression.getPlainString();

    const expressionValidator = new gd.ExpressionValidator(
      gd.JsPlatform.get(),
      this.props.projectScopedContainersAccessor.get(),
      'number',
      ''
    );
    expression.getRootNode().visit(expressionValidator);
    const isExpressionValid = expressionValidator.getAllErrors().size() === 0;
    expressionValidator.delete();

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
            <Trans>
              Repeat{' '}
              <span
                className={classNames({
                  [selectableArea]: true,
                  [instructionParameter]: true,
                  number: true,
                })}
                onClick={this.edit}
                onKeyPress={event => {
                  if (shouldActivate(event)) {
                    this.edit(event);
                  }
                }}
                tabIndex={0}
              >
                {expressionPlainString ? (
                  <span>
                    {isExpressionValid ? (
                      expressionPlainString
                    ) : (
                      <span
                        className={classNames({
                          [instructionInvalidParameter]: true,
                        })}
                      >
                        {expressionPlainString}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="instruction-missing-parameter" />
                )}
              </span>{' '}
              times:
            </Trans>
          </span>
        </div>
        <ConditionsActionsColumns
          leftIndentWidth={this.props.leftIndentWidth}
          windowSize={this.props.windowSize}
          eventsSheetWidth={this.props.eventsSheetWidth}
          renderConditionsList={({ style, className }) => (
            <InstructionsList
              platform={this.props.project.getCurrentPlatform()}
              instrsList={repeatEvent.getConditions()}
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
              instrsList={repeatEvent.getActions()}
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
              projectScopedContainersAccessor={
                this.props.projectScopedContainersAccessor
              }
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
          <ExpressionField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            projectScopedContainersAccessor={
              this.props.projectScopedContainersAccessor
            }
            value={expressionPlainString}
            onChange={text => {
              repeatEvent.setRepeatExpressionPlainString(text);
              this.props.onUpdate();
            }}
            parameterRenderingService={ParameterRenderingService}
            isInline
            ref={field => (this._field = field)}
          />
        </InlinePopover>
      </div>
    );
  }
}
