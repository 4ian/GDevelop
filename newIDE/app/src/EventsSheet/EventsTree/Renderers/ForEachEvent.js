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
import forEachClasses from './ForEachEvent.module.css';
import { shouldActivate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { type ParameterFieldInterface } from '../../ParameterFields/ParameterFieldCommons';
import ParameterRenderingService from '../../ParameterRenderingService';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
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
};

const InlineSelect = ({
  value,
  onChange,
  children,
}: {|
  value: string,
  onChange: (value: string) => void,
  children: React.Node,
|}) => {
  const selectRef = React.useRef<?HTMLSelectElement>(null);
  const [displayedText, setDisplayedText] = React.useState('');

  React.useLayoutEffect(
    () => {
      const select = selectRef.current;
      if (select && select.selectedOptions[0]) {
        setDisplayedText(select.selectedOptions[0].text);
      }
    },
    [value]
  );

  return (
    <span className={forEachClasses.inlineSelectContainer}>
      <span className={forEachClasses.inlineSelectSizer} aria-hidden="true">
        {displayedText}
      </span>
      <select
        ref={selectRef}
        className={classNames(selectableArea, forEachClasses.inlineSelect)}
        value={value}
        onChange={e => onChange(e.currentTarget.value)}
        tabIndex={0}
      >
        {children}
      </select>
      <div className={forEachClasses.arrowContainer}>
        <span className={forEachClasses.arrow} />
      </div>
    </span>
  );
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
    const orderByExpression = forEachEvent.getOrderByExpression();
    const orderBy = orderByExpression.getPlainString();
    const order = forEachEvent.getOrder();
    const limitExpression = forEachEvent.getLimitExpression();
    const limit = limitExpression.getPlainString();
    const hasOrderBy = !!orderBy;

    let isOrderByValid = true;
    if (hasOrderBy) {
      const orderByValidator = new gd.ExpressionValidator(
        gd.JsPlatform.get(),
        this.props.projectScopedContainersAccessor.get(),
        'number',
        ''
      );
      orderByExpression.getRootNode().visit(orderByValidator);
      isOrderByValid = orderByValidator.getAllErrors().size() === 0;
      orderByValidator.delete();
    }

    let isLimitValid = true;
    if (limit) {
      const limitValidator = new gd.ExpressionValidator(
        gd.JsPlatform.get(),
        this.props.projectScopedContainersAccessor.get(),
        'number',
        ''
      );
      limitExpression.getRootNode().visit(limitValidator);
      isLimitValid = limitValidator.getAllErrors().size() === 0;
      limitValidator.delete();
    }

    const objectNameIsValid = this.props.projectScopedContainersAccessor
      .get()
      .getObjectsContainersList()
      .hasObjectOrGroupNamed(objectName);

    return (
      <I18n>
        {({ i18n }) => (
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
              </Trans>{' '}
              {(() => {
                const objectPrefix = objectName || '<Object>';
                const objectsContainersList = this.props.projectScopedContainersAccessor
                  .get()
                  .getObjectsContainersList();

                const behaviorExamples = [];
                if (objectNameIsValid) {
                  const behaviorNames = objectsContainersList
                    .getBehaviorsOfObject(objectName, true)
                    .toJSArray();
                  for (const behaviorName of behaviorNames) {
                    const behaviorType = objectsContainersList.getTypeOfBehaviorInObjectOrGroup(
                      objectName,
                      behaviorName,
                      true
                    );
                    if (behaviorType === 'Health::Health') {
                      behaviorExamples.push({
                        label: t`order by highest health`,
                        expression: `${objectPrefix}.${behaviorName}::Health()`,
                      });
                    } else if (behaviorType === 'FireBullet::FireBullet') {
                      behaviorExamples.push({
                        label: t`order by highest ammo`,
                        expression: `${objectPrefix}.${behaviorName}::AmmoQuantity()`,
                      });
                    } else if (behaviorType === 'Physics2::Physics2Behavior') {
                      behaviorExamples.push({
                        label: t`order by physics speed`,
                        expression: `${objectPrefix}.${behaviorName}::LinearVelocity()`,
                      });
                    } else if (
                      behaviorType === 'Physics3D::Physics3DBehavior'
                    ) {
                      behaviorExamples.push({
                        label: t`order by physics speed`,
                        expression: `${objectPrefix}.${behaviorName}::LinearVelocityLength()`,
                      });
                    }
                  }
                }

                return (
                  <InlineSelect
                    value={hasOrderBy ? 'orderBy' : 'any'}
                    onChange={value => {
                      if (value === 'any') {
                        forEachEvent.setOrderBy('');
                        forEachEvent.setLimit('');
                        this.props.onUpdate();
                        this.forceUpdate();
                      } else if (value === 'orderBy') {
                        forEachEvent.setOrderBy(
                          objectNameIsValid ? `${objectName}.XXX` : '0'
                        );
                        forEachEvent.setOrder('asc');
                        this.props.onUpdate();
                        this.forceUpdate();
                      } else {
                        // An example was selected: use its expression.
                        forEachEvent.setOrderBy(value);
                        forEachEvent.setOrder('desc');
                        this.props.onUpdate();
                        this.forceUpdate();
                      }
                    }}
                  >
                    <option value="any">{i18n._(t`(any order)`)}</option>
                    <option value="orderBy">{i18n._(t`ordered by`)}</option>
                    <optgroup label="Examples">
                      <option value={`${objectPrefix}.SomeVariable`}>
                        {i18n._(t`order by highest variable`)}
                      </option>
                      <option value={`${objectPrefix}.Distance(OtherObject)`}>
                        {i18n._(t`order by distance to another object`)}
                      </option>
                      {behaviorExamples.map(({ label, expression }) => (
                        <option key={expression} value={expression}>
                          {i18n._(label)}
                        </option>
                      ))}
                    </optgroup>
                  </InlineSelect>
                );
              })()}
              {hasOrderBy && (
                <span>
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
                    title={i18n._(
                      t`Expression used to sort instances before iterating. It will be evaluated for each instance.`
                    )}
                  >
                    {isOrderByValid ? (
                      orderBy
                    ) : (
                      <span
                        className={classNames({
                          [instructionInvalidParameter]: true,
                        })}
                      >
                        {orderBy}
                      </span>
                    )}
                  </span>
                  (
                  <InlineSelect
                    value={order}
                    onChange={value => {
                      forEachEvent.setOrder(value);
                      this.props.onUpdate();
                      this.forceUpdate();
                    }}
                  >
                    <option value="asc">{i18n._(t`ascending`)}</option>
                    <option value="desc">{i18n._(t`descending`)}</option>
                  </InlineSelect>
                  ,{' '}
                  <span
                    className={classNames({
                      [selectableArea]: true,
                      [instructionParameter]: true,
                      number: true,
                      [disabledText]: this.props.disabled,
                    })}
                    onClick={this.editLimit}
                    onKeyPress={event => {
                      if (shouldActivate(event)) {
                        this.editLimit(event);
                      }
                    }}
                    tabIndex={0}
                    title={
                      limit
                        ? i18n._(
                            t`This event will be repeated only for the first instances, up to this limit.`
                          )
                        : i18n._(
                            t`This event will be repeated for all instances.`
                          )
                    }
                  >
                    {limit ? (
                      <>
                        <Trans>limit:</Trans>{' '}
                        {isLimitValid ? (
                          limit
                        ) : (
                          <span
                            className={classNames({
                              [instructionInvalidParameter]: true,
                            })}
                          >
                            {limit}
                          </span>
                        )}
                      </>
                    ) : (
                      <Trans>no limit</Trans>
                    )}
                  </span>
                  )
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
                parameterRenderingService={ParameterRenderingService}
                isInline
                ref={field => (this._orderByField = field)}
              />
            </InlinePopover>

            <InlinePopover
              open={this.state.editingLimit}
              anchorEl={this.state.limitAnchorEl}
              onRequestClose={this.endEditingLimit}
              onApply={this.endEditingLimit}
            >
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
                parameterRenderingService={ParameterRenderingService}
                isInline
                ref={field => (this._limitField = field)}
              />
            </InlinePopover>
          </div>
        )}
      </I18n>
    );
  }
}
