// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList';
import VariableDeclarationsList from '../VariableDeclarationsList';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
  executableEventContainer,
  instructionParameter,
  nameAndIconContainer,
  instructionInvalidParameter,
  disabledText,
  eventLabel,
} from '../ClassNames';
import InlinePopover from '../../InlinePopover';
import ObjectField from '../../ParameterFields/ObjectField';
import ExpressionField from '../../ParameterFields/ExpressionField';
import { type EventRendererProps } from './EventRenderer';
import ConditionsActionsColumns from '../ConditionsActionsColumns';
import { shouldActivate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { type ParameterFieldInterface } from '../../ParameterFields/ParameterFieldCommons';
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
  objectContainer: {
    marginLeft: '3px',
    marginRight: '2px',
  },
  orderByContainer: {
    marginLeft: '3px',
    marginRight: '2px',
  },
  orderConfigContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '4px',
    minWidth: '300px',
  },
  orderConfigRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  orderSelect: {
    padding: '2px 4px',
    fontSize: 'inherit',
    fontFamily: 'inherit',
  },
  linkButton: {
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    background: 'none',
    border: 'none',
    padding: '2px 4px',
    color: 'inherit',
  },
};

export default class ForEachEvent extends React.Component<
  EventRendererProps,
  // $FlowFixMe[unsupported-syntax]
  *
> {
  _objectField: ?ParameterFieldInterface = null;
  _orderByField: ?ParameterFieldInterface = null;
  _limitField: ?ParameterFieldInterface = null;
  // $FlowFixMe[missing-local-annot]
  state = {
    editingObject: false,
    editingObjectPreviousValue: null,
    objectAnchorEl: null,
    editingOrder: false,
    orderAnchorEl: null,
  };

  editObject = (domEvent: any) => {
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
            editingObject: true,
            editingObjectPreviousValue: objectName,
            objectAnchorEl: anchorEl,
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

  cancelEditingObject = () => {
    this.endEditingObject();

    const forEachEvent = gd.asForEachEvent(this.props.event);
    const { editingObjectPreviousValue } = this.state;
    if (editingObjectPreviousValue != null) {
      forEachEvent.setObjectToPick(editingObjectPreviousValue);
      this.forceUpdate();
    }
  };

  endEditingObject = () => {
    const { objectAnchorEl } = this.state;
    // Put back the focus after closing the inline popover.
    // $FlowFixMe[incompatible-type]
    if (objectAnchorEl) objectAnchorEl.focus();

    this.setState({
      editingObject: false,
      editingObjectPreviousValue: null,
      objectAnchorEl: null,
    });
  };

  editOrder = (domEvent: any) => {
    const anchorEl = domEvent.currentTarget;
    setTimeout(
      () =>
        this.setState({
          editingOrder: true,
          orderAnchorEl: anchorEl,
        }),
      10
    );
  };

  endEditingOrder = () => {
    const { orderAnchorEl } = this.state;
    // $FlowFixMe[incompatible-type]
    if (orderAnchorEl) orderAnchorEl.focus();

    this.setState({
      editingOrder: false,
      orderAnchorEl: null,
    });
  };

  _switchToOrderedBy = () => {
    const forEachEvent = gd.asForEachEvent(this.props.event);
    forEachEvent.setOrderBy('0');
    forEachEvent.setOrder('asc');
    this.props.onUpdate();
    this.forceUpdate();
  };

  _switchToAnyOrder = () => {
    const forEachEvent = gd.asForEachEvent(this.props.event);
    forEachEvent.setOrderBy('');
    forEachEvent.setLimit('');
    this.props.onUpdate();
    this.forceUpdate();
  };

  render(): any {
    const forEachEvent = gd.asForEachEvent(this.props.event);
    const objectName = forEachEvent.getObjectToPick();
    const orderBy = forEachEvent.getOrderBy();
    const order = forEachEvent.getOrder();
    const limit = forEachEvent.getLimit();
    const hasOrderBy = !!orderBy;

    const objectNameIsValid = this.props.projectScopedContainersAccessor
      .get()
      .getObjectsContainersList()
      .hasObjectOrGroupNamed(objectName);

    return (
      <div
        style={styles.container}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
          [executableEventContainer]: true,
        })}
      >
        <VariableDeclarationsList
          variablesContainer={forEachEvent.getVariables()}
          loopIndexVariableName={forEachEvent.getLoopIndexVariableName()}
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
        <div className={eventLabel}>
          <Trans>
            Repeat for each instance of
            <span
              className={classNames({
                [selectableArea]: true,
                [instructionParameter]: true,
                [nameAndIconContainer]: true,
                object: true,
              })}
              style={styles.objectContainer}
              onClick={this.editObject}
              onKeyPress={event => {
                if (shouldActivate(event)) {
                  this.editObject(event);
                }
              }}
              tabIndex={0}
            >
              {objectName ? (
                <span>
                  {this.props.renderObjectThumbnail(objectName)}
                  {objectNameIsValid ? (
                    objectName
                  ) : (
                    <span
                      className={classNames({
                        [instructionInvalidParameter]: true,
                      })}
                    >
                      {objectName}
                    </span>
                  )}
                </span>
              ) : (
                <span className="instruction-missing-parameter">
                  <Trans>{`<Select an object>`}</Trans>
                </span>
              )}
            </span>
          </Trans>
          {hasOrderBy ? (
            <span>
              <Trans>
                {' ordered by '}
                <span
                  className={classNames({
                    [selectableArea]: true,
                    [instructionParameter]: true,
                    number: true,
                  })}
                  style={styles.orderByContainer}
                  onClick={this.editOrder}
                  onKeyPress={event => {
                    if (shouldActivate(event)) {
                      this.editOrder(event);
                    }
                  }}
                  tabIndex={0}
                >
                  {orderBy}
                </span>
                {' (' + (order === 'desc' ? 'descending' : 'ascending') + ')'}
              </Trans>
              {limit ? (
                <span>
                  <Trans>{' limit: '}</Trans>
                  <span
                    className={classNames({
                      [selectableArea]: true,
                      [instructionParameter]: true,
                      number: true,
                    })}
                    onClick={this.editOrder}
                    onKeyPress={event => {
                      if (shouldActivate(event)) {
                        this.editOrder(event);
                      }
                    }}
                    tabIndex={0}
                  >
                    {limit}
                  </span>
                </span>
              ) : null}
            </span>
          ) : (
            <span
              className={classNames({
                [selectableArea]: true,
                [disabledText]: this.props.disabled,
              })}
              style={styles.orderByContainer}
              onClick={this.editOrder}
              onKeyPress={event => {
                if (shouldActivate(event)) {
                  this.editOrder(event);
                }
              }}
              tabIndex={0}
            >
              <Trans>(any order)</Trans>
            </span>
          )}
          <Trans>:</Trans>
        </div>
        <ConditionsActionsColumns
          leftIndentWidth={this.props.leftIndentWidth}
          windowSize={this.props.windowSize}
          eventsSheetWidth={this.props.eventsSheetWidth}
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
              projectScopedContainersAccessor={
                this.props.projectScopedContainersAccessor
              }
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
              projectScopedContainersAccessor={
                this.props.projectScopedContainersAccessor
              }
              idPrefix={this.props.idPrefix}
            />
          )}
        />
        <InlinePopover
          open={this.state.editingObject}
          anchorEl={this.state.objectAnchorEl}
          onRequestClose={this.cancelEditingObject}
          onApply={this.endEditingObject}
        >
          <ObjectField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            projectScopedContainersAccessor={
              this.props.projectScopedContainersAccessor
            }
            value={objectName}
            onChange={text => {
              forEachEvent.setObjectToPick(text);
              this.props.onUpdate();
            }}
            isInline
            onRequestClose={this.cancelEditingObject}
            onApply={this.endEditingObject}
            ref={objectField => (this._objectField = objectField)}
          />
        </InlinePopover>
        <InlinePopover
          open={this.state.editingOrder}
          anchorEl={this.state.orderAnchorEl}
          onRequestClose={this.endEditingOrder}
          onApply={this.endEditingOrder}
        >
          <div style={styles.orderConfigContainer}>
            <div style={styles.orderConfigRow}>
              <span>
                <Trans>Order:</Trans>
              </span>
              <select
                style={styles.orderSelect}
                value={hasOrderBy ? 'orderBy' : 'any'}
                onChange={e => {
                  if (e.target.value === 'any') {
                    this._switchToAnyOrder();
                  } else {
                    this._switchToOrderedBy();
                  }
                }}
              >
                <option value="any">
                  {'(any order)'}
                </option>
                <option value="orderBy">
                  {'ordered by'}
                </option>
              </select>
            </div>
            {hasOrderBy && (
              <React.Fragment>
                <div style={styles.orderConfigRow}>
                  <span>
                    <Trans>Expression:</Trans>
                  </span>
                  <ExpressionField
                    project={this.props.project}
                    scope={this.props.scope}
                    globalObjectsContainer={this.props.globalObjectsContainer}
                    objectsContainer={this.props.objectsContainer}
                    projectScopedContainersAccessor={
                      this.props.projectScopedContainersAccessor
                    }
                    value={orderBy}
                    onChange={text => {
                      forEachEvent.setOrderBy(text);
                      this.props.onUpdate();
                      this.forceUpdate();
                    }}
                    // $FlowFixMe[incompatible-type]
                    parameterRenderingService={ParameterRenderingService}
                    isInline
                    ref={field => (this._orderByField = field)}
                  />
                </div>
                <div style={styles.orderConfigRow}>
                  <span>
                    <Trans>Direction:</Trans>
                  </span>
                  <select
                    style={styles.orderSelect}
                    value={order}
                    onChange={e => {
                      forEachEvent.setOrder(e.target.value);
                      this.props.onUpdate();
                      this.forceUpdate();
                    }}
                  >
                    <option value="asc">
                      {'ascending'}
                    </option>
                    <option value="desc">
                      {'descending'}
                    </option>
                  </select>
                </div>
                <div style={styles.orderConfigRow}>
                  <span>
                    <Trans>Limit:</Trans>
                  </span>
                  {limit ? (
                    <React.Fragment>
                      <ExpressionField
                        project={this.props.project}
                        scope={this.props.scope}
                        globalObjectsContainer={
                          this.props.globalObjectsContainer
                        }
                        objectsContainer={this.props.objectsContainer}
                        projectScopedContainersAccessor={
                          this.props.projectScopedContainersAccessor
                        }
                        value={limit}
                        onChange={text => {
                          forEachEvent.setLimit(text);
                          this.props.onUpdate();
                          this.forceUpdate();
                        }}
                        // $FlowFixMe[incompatible-type]
                        parameterRenderingService={ParameterRenderingService}
                        isInline
                        ref={field => (this._limitField = field)}
                      />
                      <button
                        style={styles.linkButton}
                        onClick={() => {
                          forEachEvent.setLimit('');
                          this.props.onUpdate();
                          this.forceUpdate();
                        }}
                      >
                        <Trans>Remove limit</Trans>
                      </button>
                    </React.Fragment>
                  ) : (
                    <button
                      style={styles.linkButton}
                      onClick={() => {
                        forEachEvent.setLimit('1');
                        this.props.onUpdate();
                        this.forceUpdate();
                      }}
                    >
                      <Trans>Add a limit</Trans>
                    </button>
                  )}
                </div>
              </React.Fragment>
            )}
          </div>
        </InlinePopover>
      </div>
    );
  }
}
