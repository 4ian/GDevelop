// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import { Column, Line, Spacer } from '../../UI/Grid';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { mapVector, mapFor } from '../../Utils/MapFor';
import HelpButton from '../../UI/HelpButton';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import {
  isBehaviorLifecycleEventsFunction,
  isObjectLifecycleEventsFunction,
  isExtensionLifecycleEventsFunction,
} from '../../EventsFunctionsExtensionsLoader/MetadataDeclarationHelpers';
import EmptyMessage from '../../UI/EmptyMessage';
import { ParametersIndexOffsets } from '../../EventsFunctionsExtensionsLoader';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../../UI/Layout';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';

const gd: libGDevelop = global.gd;

type Props = {|
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  eventsFunctionsContainer: ?gdEventsFunctionsContainer,
  helpPagePath?: string,
  onConfigurationUpdated?: (whatChanged?: 'type') => void,
  renderConfigurationHeader?: () => React.Node,
  freezeEventsFunctionType?: boolean,
  getFunctionGroupNames?: () => string[],
|};

type State = {|
  isStringExpression: boolean,
|};

export const getSentenceErrorText = (
  i18n: I18nType,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  eventsFunction: gdEventsFunction
) => {
  const sentence = eventsFunction.getSentence();
  if (!sentence)
    return i18n._(
      t`Enter the sentence that will be displayed in the events sheet`
    );

  const parametersIndexOffset = eventsBasedBehavior
    ? ParametersIndexOffsets.BehaviorFunction
    : eventsBasedObject
    ? ParametersIndexOffsets.ObjectFunction
    : ParametersIndexOffsets.FreeFunction;

  const type = eventsFunction.getFunctionType();
  const param0isImplicit =
    (eventsBasedBehavior || eventsBasedObject) &&
    (type === gd.EventsFunction.ExpressionAndCondition ||
      type === gd.EventsFunction.StringExpressionAndCondition);
  const missingParameters = mapVector(
    eventsFunction.getParameters(),
    (parameter, index) => {
      if (gd.ParameterMetadata.isBehavior(parameter.getType())) {
        // Behaviors are usually not shown in sentences.
        return null;
      }
      if (index === 0 && param0isImplicit) {
        return null;
      }

      const expectedString = `_PARAM${index + parametersIndexOffset}_`;
      if (sentence.indexOf(expectedString) === -1) return expectedString;

      return null;
    }
  ).filter(Boolean);

  const parametersLength = eventsFunction.getParameters().size();
  const paramsMatches = sentence.matchAll(/_PARAM(\d+)_/g);
  const nonExpectedParameters = [];
  for (const paramsMatch of paramsMatches) {
    const paramIndex = parseInt(paramsMatch[1], 10);
    if (
      paramIndex - parametersIndexOffset >= parametersLength ||
      paramIndex - parametersIndexOffset < 0
    ) {
      nonExpectedParameters.push(paramsMatch[0]);
    }
  }

  if (missingParameters.length || nonExpectedParameters.length) {
    return [
      missingParameters.length
        ? i18n._(t`The sentence is probably missing this/these parameter(s):`) +
          ' ' +
          missingParameters.join(', ')
        : null,
      nonExpectedParameters.length
        ? i18n._(t`The sentence displays one or more wrongs parameters:`) +
          ' ' +
          nonExpectedParameters.join(', ')
        : null,
    ]
      .filter(Boolean)
      .join(' - ');
  }

  return undefined;
};

const getFullNameHintText = (type: any): MessageDescriptor => {
  if (type === gd.EventsFunction.Condition) {
    return t`Example: Is flashing`;
  } else if (type === gd.EventsFunction.Expression) {
    return t`Example: Remaining life`;
  } else if (type === gd.EventsFunction.StringExpression) {
    return t`Example: Equipped shield name`;
  }

  return t`Example: Flash the object`;
};

const getDescriptionHintText = (type: any): MessageDescriptor => {
  if (type === gd.EventsFunction.Condition) {
    return t`Example: Check if the object is flashing.`;
  } else if (type === gd.EventsFunction.Expression) {
    return t`Example: Return the number of remaining lives for the player.`;
  } else if (type === gd.EventsFunction.StringExpression) {
    return t`Example: Return the name of the shield equipped by the player.`;
  }

  return t`Example: Make the object flash for 5 seconds.`;
};

export default class EventsFunctionPropertiesEditor extends React.Component<
  Props,
  State
> {
  state = {
    isStringExpression: false,
  };

  render() {
    const {
      eventsFunction,
      freezeEventsFunctionType,
      onConfigurationUpdated,
      helpPagePath,
      renderConfigurationHeader,
      eventsBasedBehavior,
      eventsBasedObject,
      getFunctionGroupNames,
      eventsFunctionsContainer,
    } = this.props;

    const type = eventsFunction.getFunctionType();
    const isABehaviorLifecycleEventsFunction =
      !!eventsBasedBehavior &&
      !eventsBasedObject &&
      isBehaviorLifecycleEventsFunction(eventsFunction.getName());
    if (isABehaviorLifecycleEventsFunction) {
      return (
        <EmptyMessage>
          <Trans>
            This is a "lifecycle method". It will be called automatically by the
            game engine for each instance living on the scene having the
            behavior.
          </Trans>
        </EmptyMessage>
      );
    }

    const isAnObjectLifecycleEventsFunction =
      !!eventsBasedObject &&
      !eventsBasedBehavior &&
      isObjectLifecycleEventsFunction(eventsFunction.getName());
    if (isAnObjectLifecycleEventsFunction) {
      return (
        <EmptyMessage>
          <Trans>
            This is a "lifecycle method". It will be called automatically by the
            game engine for each instance living on the scene.
          </Trans>
        </EmptyMessage>
      );
    }

    const isAnExtensionLifecycleEventsFunction =
      !eventsBasedBehavior &&
      !eventsBasedObject &&
      isExtensionLifecycleEventsFunction(eventsFunction.getName());
    if (isAnExtensionLifecycleEventsFunction) {
      return (
        <Column>
          <DismissableAlertMessage
            kind="info"
            identifier="lifecycle-events-function-included-only-if-extension-used"
          >
            <Trans>
              For the lifecycle functions to be executed, you need the extension
              to be used in the game, either by having at least one action,
              condition or expression used, or a behavior of the extension added
              to an object. Otherwise, the extension won't be included in the
              game.
            </Trans>
          </DismissableAlertMessage>
          <EmptyMessage>
            <Trans>
              This is a "lifecycle function". It will be called automatically by
              the game engine. It has no parameters. Only global objects can be
              used as the events will be run for all scenes in your game.
            </Trans>
          </EmptyMessage>
        </Column>
      );
    }

    const getterFunction =
      eventsFunctionsContainer &&
      type === gd.EventsFunction.ActionWithOperator &&
      eventsFunctionsContainer.hasEventsFunctionNamed(
        eventsFunction.getGetterName()
      )
        ? eventsFunctionsContainer.getEventsFunction(
            eventsFunction.getGetterName()
          )
        : null;

    return (
      <I18n>
        {({ i18n }) => (
          <ColumnStackLayout expand>
            {renderConfigurationHeader ? renderConfigurationHeader() : null}
            <ResponsiveLineStackLayout alignItems="center" noMargin>
              <Line alignItems="center" noMargin>
                <SelectField
                  value={
                    type === gd.EventsFunction.StringExpression
                      ? gd.EventsFunction.Expression
                      : type === gd.EventsFunction.StringExpressionAndCondition
                      ? gd.EventsFunction.ExpressionAndCondition
                      : type
                  }
                  floatingLabelText={<Trans>Function type</Trans>}
                  fullWidth
                  disabled={!!freezeEventsFunctionType}
                  onChange={(e, i, valueSting: string) => {
                    // $FlowFixMe
                    const value: EventsFunction_FunctionType = valueSting;
                    eventsFunction.setFunctionType(
                      this.state.isStringExpression
                        ? type === gd.EventsFunction.Expression
                          ? gd.EventsFunction.StringExpression
                          : type === gd.EventsFunction.ExpressionAndCondition
                          ? gd.EventsFunction.StringExpressionAndCondition
                          : value
                        : value
                    );
                    if (onConfigurationUpdated) onConfigurationUpdated('type');
                    this.forceUpdate();
                  }}
                >
                  <SelectOption
                    value={gd.EventsFunction.Action}
                    primaryText={t`Action`}
                  />
                  <SelectOption
                    value={gd.EventsFunction.Condition}
                    primaryText={t`Condition`}
                  />
                  <SelectOption
                    value={gd.EventsFunction.Expression}
                    primaryText={t`Expression`}
                  />
                  <SelectOption
                    value={gd.EventsFunction.ExpressionAndCondition}
                    primaryText={t`Expression and condition`}
                  />
                  <SelectOption
                    value={gd.EventsFunction.ActionWithOperator}
                    primaryText={t`Action with operator`}
                  />
                </SelectField>
              </Line>
              {eventsFunction.isExpression() && (
                <Line alignItems="center" noMargin>
                  <SelectField
                    value={
                      eventsFunction.isStringExpression() ? 'string' : 'number'
                    }
                    floatingLabelText={<Trans>Type</Trans>}
                    fullWidth
                    disabled={!!freezeEventsFunctionType}
                    onChange={(e, i, value: string) => {
                      // $FlowFixMe
                      const isStringExpression = value === 'string';
                      this.setState({
                        isStringExpression,
                      });
                      const isExpressionAndCondition =
                        type === gd.EventsFunction.ExpressionAndCondition ||
                        type === gd.EventsFunction.StringExpressionAndCondition;
                      eventsFunction.setFunctionType(
                        isExpressionAndCondition
                          ? isStringExpression
                            ? gd.EventsFunction.StringExpressionAndCondition
                            : gd.EventsFunction.ExpressionAndCondition
                          : isStringExpression
                          ? gd.EventsFunction.StringExpression
                          : gd.EventsFunction.Expression
                      );
                      if (onConfigurationUpdated)
                        onConfigurationUpdated('type');
                      this.forceUpdate();
                    }}
                  >
                    <SelectOption value={'number'} primaryText={t`Number`} />
                    <SelectOption value={'string'} primaryText={t`String`} />
                  </SelectField>
                </Line>
              )}
              <Column expand noMargin>
                {type === gd.EventsFunction.ActionWithOperator ? (
                  <SelectField
                    value={(getterFunction && getterFunction.getName()) || ''}
                    floatingLabelText={
                      <Trans>Related action and expression</Trans>
                    }
                    fullWidth
                    onChange={(e, i, value: string) => {
                      eventsFunction.setGetterName(value);
                      if (onConfigurationUpdated) onConfigurationUpdated();
                      this.forceUpdate();
                    }}
                  >
                    {eventsFunctionsContainer
                      ? mapFor(
                          0,
                          eventsFunctionsContainer.getEventsFunctionsCount(),
                          i => {
                            const eventsFunction = eventsFunctionsContainer.getEventsFunctionAt(
                              i
                            );

                            return (
                              (eventsFunction.getFunctionType() ===
                                gd.EventsFunction.ExpressionAndCondition ||
                                eventsFunction.getFunctionType() ===
                                  gd.EventsFunction
                                    .StringExpressionAndCondition) && (
                                <SelectOption
                                  key={eventsFunction.getName()}
                                  value={eventsFunction.getName()}
                                  primaryText={
                                    eventsFunction.getFullName() ||
                                    eventsFunction.getName()
                                  }
                                />
                              )
                            );
                          }
                        )
                      : []}
                  </SelectField>
                ) : (
                  <SemiControlledTextField
                    commitOnBlur
                    floatingLabelText={
                      <Trans>Full name displayed in editor</Trans>
                    }
                    translatableHintText={getFullNameHintText(type)}
                    value={eventsFunction.getFullName()}
                    onChange={text => {
                      eventsFunction.setFullName(text);
                      if (onConfigurationUpdated) onConfigurationUpdated();
                      this.forceUpdate();
                    }}
                    fullWidth
                  />
                )}
              </Column>
              <Column expand noMargin>
                {type === gd.EventsFunction.ActionWithOperator ? (
                  <SemiControlledTextField
                    disabled
                    floatingLabelText={<Trans>Group name</Trans>}
                    fullWidth
                    value={getterFunction ? getterFunction.getGroup() : ''}
                    onChange={text => {}}
                  />
                ) : (
                  <SemiControlledAutoComplete
                    floatingLabelText={<Trans>Group name</Trans>}
                    hintText={t`Leave it empty to use the default group for this extension.`}
                    fullWidth
                    value={eventsFunction.getGroup()}
                    onChange={text => {
                      eventsFunction.setGroup(text);
                      if (onConfigurationUpdated) onConfigurationUpdated();
                      this.forceUpdate();
                    }}
                    dataSource={
                      getFunctionGroupNames
                        ? getFunctionGroupNames().map(name => ({
                            text: name,
                            value: name,
                          }))
                        : []
                    }
                    openOnFocus={true}
                  />
                )}
              </Column>
            </ResponsiveLineStackLayout>
            <Line noMargin>
              {type === gd.EventsFunction.ActionWithOperator ? (
                <SemiControlledTextField
                  disabled
                  commitOnBlur
                  floatingLabelText={
                    <Trans>Description, displayed in editor</Trans>
                  }
                  fullWidth
                  multiline
                  value={
                    getterFunction
                      ? 'Change ' + getterFunction.getDescription()
                      : ''
                  }
                  onChange={text => {}}
                />
              ) : (
                <SemiControlledTextField
                  commitOnBlur
                  floatingLabelText={
                    type === gd.EventsFunction.ExpressionAndCondition ||
                    type === gd.EventsFunction.StringExpressionAndCondition ? (
                      <Trans>
                        Description, displayed in editor (automatically prefixed
                        by "Compare" or "Return")
                      </Trans>
                    ) : (
                      <Trans>Description, displayed in editor</Trans>
                    )
                  }
                  translatableHintText={getDescriptionHintText(type)}
                  fullWidth
                  multiline
                  value={eventsFunction.getDescription()}
                  onChange={text => {
                    eventsFunction.setDescription(text);
                    if (onConfigurationUpdated) onConfigurationUpdated();
                    this.forceUpdate();
                  }}
                />
              )}
            </Line>
            <Line noMargin>
              {type === gd.EventsFunction.ActionWithOperator ? (
                <SemiControlledTextField
                  disabled
                  commitOnBlur
                  floatingLabelText={<Trans>Sentence in Events Sheet</Trans>}
                  fullWidth
                  value={
                    getterFunction
                      ? 'Change ' +
                        getterFunction.getSentence() +
                        ' of _PARAM0_'
                      : ''
                  }
                  onChange={text => {}}
                />
              ) : type === gd.EventsFunction.Action ||
                type === gd.EventsFunction.Condition ||
                type === gd.EventsFunction.ExpressionAndCondition ||
                type === gd.EventsFunction.StringExpressionAndCondition ? (
                <SemiControlledTextField
                  commitOnBlur
                  floatingLabelText={
                    eventsBasedBehavior &&
                    (type === gd.EventsFunction.ExpressionAndCondition ||
                      type ===
                        gd.EventsFunction.StringExpressionAndCondition) ? (
                      <Trans>
                        Sentence in Events Sheet (automatically suffixed by "of
                        _PARAM0_")
                      </Trans>
                    ) : (
                      <Trans>Sentence in Events Sheet</Trans>
                    )
                  }
                  translatableHintText={t`Note: write _PARAMx_ for parameters, e.g: Flash _PARAM1_ for 5 seconds`}
                  fullWidth
                  value={eventsFunction.getSentence()}
                  onChange={text => {
                    eventsFunction.setSentence(text);
                    if (onConfigurationUpdated) onConfigurationUpdated();
                    this.forceUpdate();
                  }}
                  errorText={getSentenceErrorText(
                    i18n,
                    eventsBasedBehavior,
                    eventsBasedObject,
                    eventsFunction
                  )}
                />
              ) : null}
            </Line>
            {helpPagePath ? (
              <Line noMargin>
                <HelpButton helpPagePath={helpPagePath} />
              </Line>
            ) : (
              <Spacer />
            )}
          </ColumnStackLayout>
        )}
      </I18n>
    );
  }
}
