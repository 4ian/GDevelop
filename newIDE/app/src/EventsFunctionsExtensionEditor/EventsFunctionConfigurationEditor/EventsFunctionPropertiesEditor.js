// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import Measure from 'react-measure';

import * as React from 'react';
import { Column, Line, Spacer } from '../../UI/Grid';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { mapVector, mapFor } from '../../Utils/MapFor';
import HelpButton from '../../UI/HelpButton';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import EmptyMessage from '../../UI/EmptyMessage';
import { ParametersIndexOffsets } from '../../EventsFunctionsExtensionsLoader';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../../UI/Layout';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';
import ValueTypeEditor from './ValueTypeEditor';
import AlertMessage from '../../UI/AlertMessage';
import useForceUpdate from '../../Utils/UseForceUpdate';
import Checkbox from '../../UI/Checkbox';
import { type ExtensionItemConfigurationAttribute } from '../../EventsFunctionsExtensionEditor';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  eventsFunctionsContainer: ?gdEventsFunctionsContainer,
  helpPagePath?: string,
  onConfigurationUpdated?: (?ExtensionItemConfigurationAttribute) => void,
  renderConfigurationHeader?: () => React.Node,
  freezeEventsFunctionType?: boolean,
  getFunctionGroupNames?: () => string[],
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
    type === gd.EventsFunction.ExpressionAndCondition;
  const missingParameters = mapVector(
    eventsFunction.getParameters(),
    (parameter, index) => {
      if (parameter.getValueTypeMetadata().isBehavior()) {
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

const getFullNameHintText = (
  type: EventsFunction_FunctionType,
  expressionType: gdValueTypeMetadata
): MessageDescriptor => {
  if (type === gd.EventsFunction.Condition) {
    return t`Example: Is flashing`;
  } else if (type === gd.EventsFunction.Expression) {
    return expressionType.isNumber()
      ? t`Example: Remaining life`
      : t`Example: Equipped shield name`;
  }

  return t`Example: Flash the object`;
};

const getDescriptionHintText = (
  type: EventsFunction_FunctionType,
  expressionType: gdValueTypeMetadata
): MessageDescriptor => {
  if (type === gd.EventsFunction.Condition) {
    return t`Example: Check if the object is flashing.`;
  } else if (type === gd.EventsFunction.Expression) {
    return expressionType.isNumber()
      ? t`Example: Return the number of remaining lives for the player.`
      : t`Example: Return the name of the shield equipped by the player.`;
  }
  return t`Example: Make the object flash for 5 seconds.`;
};

export const EventsFunctionPropertiesEditor = ({
  project,
  eventsFunction,
  freezeEventsFunctionType,
  onConfigurationUpdated,
  helpPagePath,
  renderConfigurationHeader,
  eventsBasedBehavior,
  eventsBasedObject,
  getFunctionGroupNames,
  eventsFunctionsContainer,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const [containerWidth, setContainerWidth] = React.useState<?number>(null);

  const type = eventsFunction.getFunctionType();
  const isABehaviorLifecycleEventsFunction =
    !!eventsBasedBehavior &&
    !eventsBasedObject &&
    gd.MetadataDeclarationHelper.isBehaviorLifecycleEventsFunction(
      eventsFunction.getName()
    );
  if (isABehaviorLifecycleEventsFunction) {
    return (
      <EmptyMessage>
        <Trans>
          This is a "lifecycle method". It will be called automatically by the
          game engine for each instance living on the scene having the behavior.
        </Trans>
      </EmptyMessage>
    );
  }

  const isAnObjectLifecycleEventsFunction =
    !!eventsBasedObject &&
    !eventsBasedBehavior &&
    gd.MetadataDeclarationHelper.isObjectLifecycleEventsFunction(
      eventsFunction.getName()
    );
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
    gd.MetadataDeclarationHelper.isExtensionLifecycleEventsFunction(
      eventsFunction.getName()
    );
  if (isAnExtensionLifecycleEventsFunction) {
    return (
      <Column noMargin>
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
        <ColumnStackLayout expand noMargin>
          {renderConfigurationHeader ? renderConfigurationHeader() : null}
          <Measure
            bounds
            onResize={contentRect => {
              setContainerWidth(contentRect.bounds.width);
            }}
          >
            {({ contentRect, measureRef }) => (
              <div ref={measureRef}>
                <ColumnStackLayout expand noMargin>
                  <ResponsiveLineStackLayout
                    alignItems="center"
                    noMargin
                    forceMobileLayout={!!containerWidth && containerWidth < 650}
                  >
                    <Line alignItems="center" noMargin>
                      <SelectField
                        value={type}
                        floatingLabelText={<Trans>Function type</Trans>}
                        fullWidth
                        disabled={!!freezeEventsFunctionType}
                        onChange={(e, i, valueString: string) => {
                          // $FlowFixMe
                          const value: EventsFunction_FunctionType = valueString;
                          eventsFunction.setFunctionType(value);
                          if (onConfigurationUpdated)
                            onConfigurationUpdated('type');
                          forceUpdate();
                        }}
                      >
                        <SelectOption
                          value={gd.EventsFunction.Action}
                          label={t`Action`}
                        />
                        <SelectOption
                          value={gd.EventsFunction.Condition}
                          label={t`Condition`}
                        />
                        <SelectOption
                          value={gd.EventsFunction.Expression}
                          label={t`Expression`}
                        />
                        <SelectOption
                          value={gd.EventsFunction.ExpressionAndCondition}
                          label={t`Expression and condition`}
                        />
                        <SelectOption
                          value={gd.EventsFunction.ActionWithOperator}
                          label={t`Action with operator`}
                        />
                      </SelectField>
                    </Line>
                    <Column expand noMargin>
                      {type === gd.EventsFunction.ActionWithOperator ? (
                        <SelectField
                          value={
                            (getterFunction && getterFunction.getName()) || ''
                          }
                          floatingLabelText={
                            <Trans>Related expression and condition</Trans>
                          }
                          fullWidth
                          onChange={(e, i, value: string) => {
                            eventsFunction.setGetterName(value);
                            if (onConfigurationUpdated)
                              onConfigurationUpdated();
                            forceUpdate();
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
                                    eventsFunction.getFunctionType() ===
                                      gd.EventsFunction
                                        .ExpressionAndCondition && (
                                      <SelectOption
                                        key={eventsFunction.getName()}
                                        value={eventsFunction.getName()}
                                        label={
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
                          translatableHintText={getFullNameHintText(
                            type,
                            eventsFunction.getExpressionType()
                          )}
                          value={eventsFunction.getFullName()}
                          onChange={text => {
                            eventsFunction.setFullName(text);
                            if (onConfigurationUpdated)
                              onConfigurationUpdated();
                            forceUpdate();
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
                          value={
                            getterFunction ? getterFunction.getGroup() : ''
                          }
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
                            if (onConfigurationUpdated)
                              onConfigurationUpdated();
                            forceUpdate();
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
                          type === gd.EventsFunction.ExpressionAndCondition ? (
                            <Trans>
                              Description, displayed in editor (automatically
                              prefixed by "Compare" or "Return")
                            </Trans>
                          ) : (
                            <Trans>Description, displayed in editor</Trans>
                          )
                        }
                        translatableHintText={getDescriptionHintText(
                          type,
                          eventsFunction.getExpressionType()
                        )}
                        fullWidth
                        multiline
                        value={eventsFunction.getDescription()}
                        onChange={text => {
                          eventsFunction.setDescription(text);
                          if (onConfigurationUpdated) onConfigurationUpdated();
                          forceUpdate();
                        }}
                      />
                    )}
                  </Line>
                  {type === gd.EventsFunction.ActionWithOperator ? (
                    <Line noMargin>
                      <SemiControlledTextField
                        disabled
                        commitOnBlur
                        floatingLabelText={
                          <Trans>Sentence in Events Sheet</Trans>
                        }
                        fullWidth
                        value={
                          getterFunction
                            ? 'Change ' +
                              getterFunction.getSentence() +
                              (eventsBasedBehavior || eventsBasedObject
                                ? ' of _PARAM0_'
                                : '') +
                              ': [...]'
                            : ''
                        }
                        onChange={text => {}}
                      />
                    </Line>
                  ) : (
                    (type === gd.EventsFunction.Action ||
                      type === gd.EventsFunction.Condition ||
                      type === gd.EventsFunction.ExpressionAndCondition) && (
                      <Line noMargin>
                        <SemiControlledTextField
                          commitOnBlur
                          floatingLabelText={
                            eventsBasedBehavior &&
                            type ===
                              gd.EventsFunction.ExpressionAndCondition ? (
                              <Trans>
                                Sentence in Events Sheet (automatically suffixed
                                by "of _PARAM0_")
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
                            if (onConfigurationUpdated)
                              onConfigurationUpdated();
                            forceUpdate();
                          }}
                          errorText={getSentenceErrorText(
                            i18n,
                            eventsBasedBehavior,
                            eventsBasedObject,
                            eventsFunction
                          )}
                        />
                      </Line>
                    )
                  )}
                  {eventsFunction.isExpression() && (
                    <ValueTypeEditor
                      isExpressionType
                      project={project}
                      valueTypeMetadata={eventsFunction.getExpressionType()}
                      isTypeSelectorShown={true}
                      onTypeUpdated={() => {
                        if (onConfigurationUpdated) onConfigurationUpdated();
                      }}
                      getLastObjectParameterObjectType={() => ''}
                    />
                  )}
                  <Checkbox
                    label={<Trans>Private</Trans>}
                    checked={eventsFunction.isPrivate()}
                    onCheck={(e, checked) => {
                      eventsFunction.setPrivate(checked);
                      if (onConfigurationUpdated)
                        onConfigurationUpdated('isPrivate');
                      forceUpdate();
                    }}
                  />
                  <Checkbox
                    label={<Trans>Asynchronous</Trans>}
                    checked={eventsFunction.isAsync()}
                    onCheck={(e, checked) => {
                      eventsFunction.setAsync(checked);
                      if (onConfigurationUpdated)
                        onConfigurationUpdated('isAsync');
                      forceUpdate();
                    }}
                  />
                  {eventsFunction.isAsync() && (
                    <AlertMessage kind="info">
                      <Trans>
                        This is an asynchronous action, meaning that the actions
                        and sub-events following it will wait for it to end.
                        Don't forget to use the action "End asynchronous
                        function" to mark the end of the action.
                      </Trans>
                    </AlertMessage>
                  )}
                  {helpPagePath ? (
                    <Line noMargin>
                      <HelpButton helpPagePath={helpPagePath} />
                    </Line>
                  ) : (
                    <Spacer />
                  )}
                </ColumnStackLayout>
              </div>
            )}
          </Measure>
        </ColumnStackLayout>
      )}
    </I18n>
  );
};
