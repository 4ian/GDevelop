// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import { Column, Line, Spacer } from '../../UI/Grid';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { mapVector } from '../../Utils/MapFor';
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
  helpPagePath?: string,
  onConfigurationUpdated?: (whatChanged?: 'type') => void,
  renderConfigurationHeader?: () => React.Node,
  freezeEventsFunctionType?: boolean,
  getFunctionGroupNames?: () => string[],
|};

type State = {||};

const getSentenceErrorText = (
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

  const missingParameters = mapVector(
    eventsFunction.getParameters(),
    (parameter, index) => {
      if (gd.ParameterMetadata.isBehavior(parameter.getType())) {
        return null; // Behaviors are usually not shown in sentences.
      }

      const expectedString = `_PARAM${index + parametersIndexOffset}_`;
      if (sentence.indexOf(expectedString) === -1) return expectedString;

      return null;
    }
  ).filter(Boolean);

  if (missingParameters.length) {
    return (
      i18n._(t`The sentence is probably missing this/these parameter(s):`) +
      missingParameters.join(', ')
    );
  }

  return undefined;
};

const getFullNameHintText = (type: any): MessageDescriptor => {
  if (type === gd.EventsFunction.Condition) {
    return t`Example: Is flashing?`;
  } else if (type === gd.EventsFunction.Expression) {
    return t`Example: Life remaining`;
  } else if (type === gd.EventsFunction.StringExpression) {
    return t`Example: Equipped shield name`;
  }

  return t`Example: Flash the object`;
};

const getDescriptionHintText = (type: any): MessageDescriptor => {
  if (type === gd.EventsFunction.Condition) {
    return t`Example: Check if the object is flashing.`;
  } else if (type === gd.EventsFunction.Expression) {
    return t`Example: Life remaining for the player.`;
  } else if (type === gd.EventsFunction.StringExpression) {
    return t`Example: Name of the shield equipped by the player.`;
  }

  return t`Example: Make the object flash for 5 seconds.`;
};

export default class EventsFunctionPropertiesEditor extends React.Component<
  Props,
  State
> {
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

    return (
      <I18n>
        {({ i18n }) => (
          <ColumnStackLayout expand>
            {renderConfigurationHeader ? renderConfigurationHeader() : null}
            <ResponsiveLineStackLayout alignItems="center" noMargin>
              <Line alignItems="center" noMargin>
                <SelectField
                  value={type}
                  floatingLabelText={<Trans>Function type</Trans>}
                  fullWidth
                  disabled={!!freezeEventsFunctionType}
                  onChange={(e, i, value: string) => {
                    // $FlowFixMe
                    eventsFunction.setFunctionType(value);
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
                    value={gd.EventsFunction.StringExpression}
                    primaryText={t`String Expression`}
                  />
                </SelectField>
              </Line>
              <SemiControlledTextField
                commitOnBlur
                floatingLabelText={<Trans>Full name displayed in editor</Trans>}
                translatableHintText={getFullNameHintText(type)}
                value={eventsFunction.getFullName()}
                onChange={text => {
                  eventsFunction.setFullName(text);
                  if (onConfigurationUpdated) onConfigurationUpdated();
                  this.forceUpdate();
                }}
                fullWidth
              />
            </ResponsiveLineStackLayout>
            <Line noMargin>
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
            </Line>
            <Line noMargin>
              <SemiControlledTextField
                commitOnBlur
                floatingLabelText={
                  <Trans>Description, displayed in editor</Trans>
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
            </Line>
            <Line noMargin>
              {type === gd.EventsFunction.Action ||
              type === gd.EventsFunction.Condition ? (
                <SemiControlledTextField
                  commitOnBlur
                  floatingLabelText={<Trans>Sentence in Events Sheet</Trans>}
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
