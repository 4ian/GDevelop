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
import Cross from '../../../UI/CustomSvgIcons/Cross';
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
  inlineSelect: {
    // Styled to look like inline text with a subtle grey arrow hint.
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    background: 'none',
    border: 'none',
    borderBottom: '1px dashed currentColor',
    cursor: 'pointer',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    color: 'inherit',
    padding: '0 14px 0 0',
    margin: '0 2px',
    // Grey chevron as background image on the right
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 2px center',
    backgroundSize: '8px 5px',
  },
  limitPopoverContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0 4px',
    minWidth: '200px',
  },
  removeLimitButton: {
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
    opacity: 0.6,
    flexShrink: 0,
  },
  removeLimitIcon: {
    width: 16,
    height: 16,
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
    editingOrderBy: false,
    orderByAnchorEl: null,
    editingLimit: false,
    limitAnchorEl: null,
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

  editOrderBy = (domEvent: any) => {
    const anchorEl = domEvent.currentTarget;
    setTimeout(
      () =>
        this.setState(
          {
            editingOrderBy: true,
            orderByAnchorEl: anchorEl,
          },
          () => {
            setTimeout(() => {
              if (this._orderByField) this._orderByField.focus();
            }, 10);
          }
        ),
      10
    );
  };

  endEditingOrderBy = () => {
    const { orderByAnchorEl } = this.state;
    // $FlowFixMe[incompatible-type]
    if (orderByAnchorEl) orderByAnchorEl.focus();

    this.setState({
      editingOrderBy: false,
      orderByAnchorEl: null,
    });
  };

  editLimit = (domEvent: any) => {
    const anchorEl = domEvent.currentTarget;
    setTimeout(
      () =>
        this.setState(
          {
            editingLimit: true,
            limitAnchorEl: anchorEl,
          },
          () => {
            setTimeout(() => {
              if (this._limitField) this._limitField.focus();
            }, 10);
          }
        ),
      10
    );
  };

  endEditingLimit = () => {
    const { limitAnchorEl } = this.state;
    // $FlowFixMe[incompatible-type]
    if (limitAnchorEl) limitAnchorEl.focus();

    this.setState({
      editingLimit: false,
      limitAnchorEl: null,
    });
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
          {' '}
          {/* Inline select for "ordered by" vs "(any order)" */}
          <select
            style={styles.inlineSelect}
            value={hasOrderBy ? 'orderBy' : 'any'}
            onChange={e => {
              if (e.target.value === 'any') {
                forEachEvent.setOrderBy('');
                forEachEvent.setLimit('');
                this.props.onUpdate();
                this.forceUpdate();
              } else {
                forEachEvent.setOrderBy('0');
                forEachEvent.setOrder('asc');
                this.props.onUpdate();
                this.forceUpdate();
              }
            }}
            tabIndex={0}
          >
            <option value="any">
              {'(any order)'}
            </option>
            <option value="orderBy">
              {'ordered by'}
            </option>
          </select>
          {hasOrderBy && (
            <span>
              {/* Clickable orderBy expression */}
              <span
                className={classNames({
                  [selectableArea]: true,
                  [instructionParameter]: true,
                  number: true,
                })}
                style={styles.orderByContainer}
                onClick={this.editOrderBy}
                onKeyPress={event => {
                  if (shouldActivate(event)) {
                    this.editOrderBy(event);
                  }
                }}
                tabIndex={0}
              >
                {orderBy}
              </span>
              {' ('}
              {/* Inline select for ascending/descending */}
              <select
                style={styles.inlineSelect}
                value={order}
                onChange={e => {
                  forEachEvent.setOrder(e.target.value);
                  this.props.onUpdate();
                  this.forceUpdate();
                }}
                tabIndex={0}
              >
                <option value="asc">
                  {'ascending'}
                </option>
                <option value="desc">
                  {'descending'}
                </option>
              </select>
              {', '}
              {limit ? (
                <span>
                  <Trans>{'limit: '}</Trans>
                  <span
                    className={classNames({
                      [selectableArea]: true,
                      [instructionParameter]: true,
                      number: true,
                    })}
                    onClick={this.editLimit}
                    onKeyPress={event => {
                      if (shouldActivate(event)) {
                        this.editLimit(event);
                      }
                    }}
                    tabIndex={0}
                  >
                    {limit}
                  </span>
                </span>
              ) : (
                <span
                  className={classNames({
                    [selectableArea]: true,
                    [disabledText]: this.props.disabled,
                  })}
                  onClick={this.editLimit}
                  onKeyPress={event => {
                    if (shouldActivate(event)) {
                      this.editLimit(event);
                    }
                  }}
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <Trans>no limit</Trans>
                </span>
              )}
              {')'}
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
        {/* Popover for editing the object */}
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
        {/* Popover for editing the orderBy expression */}
        <InlinePopover
          open={this.state.editingOrderBy}
          anchorEl={this.state.orderByAnchorEl}
          onRequestClose={this.endEditingOrderBy}
          onApply={this.endEditingOrderBy}
        >
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
        </InlinePopover>
        {/* Popover for editing the limit expression */}
        <InlinePopover
          open={this.state.editingLimit}
          anchorEl={this.state.limitAnchorEl}
          onRequestClose={this.endEditingLimit}
          onApply={this.endEditingLimit}
        >
          <div style={styles.limitPopoverContainer}>
            <ExpressionField
              project={this.props.project}
              scope={this.props.scope}
              globalObjectsContainer={this.props.globalObjectsContainer}
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
              style={styles.removeLimitButton}
              onClick={() => {
                forEachEvent.setLimit('');
                this.props.onUpdate();
                this.endEditingLimit();
                this.forceUpdate();
              }}
              title="Remove limit"
            >
              <Cross style={styles.removeLimitIcon} />
            </button>
          </div>
        </InlinePopover>
      </div>
    );
  }
}
