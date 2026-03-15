// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { Column, Line, Spacer } from '../../UI/Grid';
import CompactSelectField from '../../UI/CompactSelectField';
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
import { CompactTextAreaField } from '../../UI/CompactTextAreaField';
import { CompactToggleField } from '../../UI/CompactToggleField';
import SelectOption from '../../UI/SelectOption';
import { mapFor } from '../../Utils/MapFor';
import HelpButton from '../../UI/HelpButton';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import EmptyMessage from '../../UI/EmptyMessage';
import { ParametersIndexOffsets } from '../../EventsFunctionsExtensionsLoader';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { ColumnStackLayout } from '../../UI/Layout';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import CompactValueTypeEditor from './CompactValueTypeEditor';
import AlertMessage from '../../UI/AlertMessage';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { type ExtensionItemConfigurationAttribute } from '../../EventsFunctionsExtensionEditor';
import {
  isRelativePathToDocumentationRoot,
  isDocumentationAbsoluteUrl,
} from '../../Utils/HelpLink';
import CompactPropertiesEditorRowField from '../../CompactPropertiesEditor/CompactPropertiesEditorRowField';
import { CompactCollapsibleAdvancedSection } from '../../CompactPropertiesEditor/CompactPropertiesEditorByVisibility';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: gdEventsBasedBehavior | null,
  eventsBasedObject: gdEventsBasedObject | null,
  eventsFunctionsContainer: gdEventsFunctionsContainer | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
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
): any | string | void => {
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
  const missingParameters = mapFor(
    0,
    eventsFunction.getParameters().getParametersCount(),
    index => {
      const parameter = eventsFunction.getParameters().getParameterAt(index);

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

  const parametersLength = eventsFunction.getParameters().getParametersCount();
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

export const CompactEventsFunctionPropertiesEditor = ({
  project,
  eventsFunctionsExtension,
  eventsFunction,
  freezeEventsFunctionType,
  onConfigurationUpdated,
  helpPagePath,
  renderConfigurationHeader,
  eventsBasedBehavior,
  eventsBasedObject,
  getFunctionGroupNames,
  eventsFunctionsContainer,
}: Props): React.Node => {
  const forceUpdate = useForceUpdate();

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
      <Line>
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
              the game engine. It has no parameters.
            </Trans>
          </EmptyMessage>
        </Column>
      </Line>
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
          <ColumnStackLayout expand noMargin>
            <CompactPropertiesEditorRowField
              label={i18n._(t`Function type`)}
              field={
                <CompactSelectField
                  value={type.toString()}
                  disabled={!!freezeEventsFunctionType}
                  onChange={valueString => {
                    // $FlowFixMe[incompatible-type]
                    const value: EventsFunction_FunctionType = Number.parseInt(
                      valueString
                    );
                    eventsFunction.setFunctionType(value);
                    if (onConfigurationUpdated) onConfigurationUpdated('type');
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
                </CompactSelectField>
              }
            />
            {type === gd.EventsFunction.ActionWithOperator ? (
              <CompactPropertiesEditorRowField
                label={i18n._(t`Related expression and condition`)}
                field={
                  <CompactSelectField
                    value={(getterFunction && getterFunction.getName()) || ''}
                    onChange={value => {
                      eventsFunction.setGetterName(value);
                      if (onConfigurationUpdated) onConfigurationUpdated();
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
                                gd.EventsFunction.ExpressionAndCondition && (
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
                  </CompactSelectField>
                }
              />
            ) : (
              <CompactPropertiesEditorRowField
                label={i18n._(t`Full name displayed in editor`)}
                field={
                  <CompactSemiControlledTextField
                    commitOnBlur
                    placeholder={i18n._(
                      getFullNameHintText(
                        type,
                        eventsFunction.getExpressionType()
                      )
                    )}
                    value={eventsFunction.getFullName()}
                    onChange={text => {
                      eventsFunction.setFullName(text);
                      if (onConfigurationUpdated) onConfigurationUpdated();
                      forceUpdate();
                    }}
                  />
                }
              />
            )}
            {type === gd.EventsFunction.ActionWithOperator ? (
              <CompactTextAreaField
                disabled
                label={i18n._(t`Description, displayed in editor`)}
                value={
                  getterFunction
                    ? 'Change ' + getterFunction.getDescription()
                    : ''
                }
                onChange={text => {}}
              />
            ) : (
              <CompactTextAreaField
                label={
                  type === gd.EventsFunction.ExpressionAndCondition
                    ? i18n._(
                        t`Description, displayed in editor (automatically prefixed by "Compare" or "Return")`
                      )
                    : i18n._(t`Description, displayed in editor`)
                }
                markdownDescription={getDescriptionHintText(
                  type,
                  eventsFunction.getExpressionType()
                )}
                value={eventsFunction.getDescription()}
                onChange={text => {
                  eventsFunction.setDescription(text);
                  if (onConfigurationUpdated) onConfigurationUpdated();
                  forceUpdate();
                }}
              />
            )}
            {type === gd.EventsFunction.ActionWithOperator ? (
              <CompactTextAreaField
                disabled
                label={i18n._(t`Sentence in Events Sheet`)}
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
            ) : (
              (type === gd.EventsFunction.Action ||
                type === gd.EventsFunction.Condition ||
                type === gd.EventsFunction.ExpressionAndCondition) && (
                <CompactTextAreaField
                  label={
                    eventsBasedBehavior &&
                    type === gd.EventsFunction.ExpressionAndCondition
                      ? i18n._(
                          t`Sentence in Events Sheet (automatically suffixed by "of _PARAM0_")`
                        )
                      : i18n._(t`Sentence in Events Sheet`)
                  }
                  placeholder={t`Note: write _PARAMx_ for parameters, e.g: Flash _PARAM1_ for 5 seconds`}
                  value={eventsFunction.getSentence()}
                  onChange={text => {
                    eventsFunction.setSentence(text.replace(/\n/g, ''));
                    if (onConfigurationUpdated) onConfigurationUpdated();
                    forceUpdate();
                  }}
                  errored={
                    !!getSentenceErrorText(
                      i18n,
                      eventsBasedBehavior,
                      eventsBasedObject,
                      eventsFunction
                    )
                  }
                  errorText={getSentenceErrorText(
                    i18n,
                    eventsBasedBehavior,
                    eventsBasedObject,
                    eventsFunction
                  )}
                />
              )
            )}
            {eventsFunction.isExpression() && (
              <CompactValueTypeEditor
                isExpressionType
                project={project}
                eventsFunctionsExtension={eventsFunctionsExtension}
                valueTypeMetadata={eventsFunction.getExpressionType()}
                isTypeSelectorShown={true}
                onTypeUpdated={() => {
                  if (onConfigurationUpdated) onConfigurationUpdated();
                }}
                getLastObjectParameterObjectType={() => ''}
              />
            )}
            <CompactCollapsibleAdvancedSection>
              <Line noMargin>
                {(() => {
                  const helpUrl = eventsFunction.getHelpUrl();
                  const isValidHelpUrl =
                    !helpUrl ||
                    isDocumentationAbsoluteUrl(helpUrl) ||
                    isRelativePathToDocumentationRoot(helpUrl);
                  return (
                    <CompactPropertiesEditorRowField
                      label={i18n._(t`Help page URL`)}
                      markdownDescription={i18n._(
                        t`Optional. Enter a full URL (starting with https://) to a help page. A help icon will appear next to the action/condition/expression title in the editor, allowing users to quickly access documentation.`
                      )}
                      field={
                        <CompactSemiControlledTextField
                          commitOnBlur
                          errored={!isValidHelpUrl}
                          errorText={
                            isValidHelpUrl
                              ? null
                              : i18n._(
                                  `This is not a URL starting with "http://" or "https://".`
                                )
                          }
                          value={helpUrl}
                          onChange={text => {
                            eventsFunction.setHelpUrl(text);
                            if (onConfigurationUpdated)
                              onConfigurationUpdated();
                            forceUpdate();
                          }}
                        />
                      }
                    />
                  );
                })()}
              </Line>
              <ColumnStackLayout expand noMargin>
                <CompactToggleField
                  label={i18n._(t`Private`)}
                  checked={eventsFunction.isPrivate()}
                  onCheck={checked => {
                    eventsFunction.setPrivate(checked);
                    if (onConfigurationUpdated)
                      onConfigurationUpdated('isPrivate');
                    forceUpdate();
                  }}
                  markdownDescription={
                    eventsFunction.isPrivate()
                      ? i18n._(
                          t`This function won't be visible in the events editor.`
                        )
                      : i18n._(
                          t`This function will be visible in the events editor.`
                        )
                  }
                />
                <CompactToggleField
                  label={i18n._(t`Asynchronous`)}
                  checked={eventsFunction.isAsync()}
                  onCheck={checked => {
                    eventsFunction.setAsync(checked);
                    if (onConfigurationUpdated)
                      onConfigurationUpdated('isAsync');
                    forceUpdate();
                  }}
                />
                <CompactToggleField
                  label={i18n._(t`Deprecated`)}
                  checked={eventsFunction.isDeprecated()}
                  onCheck={checked => {
                    eventsFunction.setDeprecated(checked);
                    if (onConfigurationUpdated)
                      onConfigurationUpdated('isDeprecated');
                    forceUpdate();
                  }}
                  markdownDescription={
                    eventsFunction.isDeprecated()
                      ? i18n._(
                          t`This function is marked as deprecated. It will be displayed with a warning in the events editor.`
                        )
                      : i18n._(t`Mark this function as deprecated to discourage its use.
                        `)
                  }
                />
                {eventsFunction.isDeprecated() && (
                  <SemiControlledTextField
                    commitOnBlur
                    floatingLabelText={<Trans>Deprecation message</Trans>}
                    translatableHintText={t`Example: Use "New Action Name" instead.`}
                    fullWidth
                    multiline
                    value={eventsFunction.getDeprecationMessage()}
                    onChange={text => {
                      eventsFunction.setDeprecationMessage(text);
                      if (onConfigurationUpdated) onConfigurationUpdated();
                      forceUpdate();
                    }}
                  />
                )}
                {eventsFunction.isAsync() && (
                  <AlertMessage
                    kind="info"
                    renderRightButton={() => (
                      <HelpButton
                        helpPagePath={
                          '/events/functions/asynchronous-functions'
                        }
                      />
                    )}
                  >
                    <Trans>
                      This is an asynchronous action, meaning that the actions
                      and sub-events following it will wait for it to end. You
                      should use other async actions like "wait" to schedule
                      your actions and don't forget to use the action "End
                      asynchronous function" to mark the end of the action.
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
            </CompactCollapsibleAdvancedSection>
          </ColumnStackLayout>
        </ColumnStackLayout>
      )}
    </I18n>
  );
};
