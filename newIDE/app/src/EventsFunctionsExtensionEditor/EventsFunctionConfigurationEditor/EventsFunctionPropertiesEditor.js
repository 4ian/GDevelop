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
import { isBehaviorLifecycleFunction } from '../../EventsFunctionsExtensionsLoader/MetadataDeclarationHelpers';
import EmptyMessage from '../../UI/EmptyMessage';
import { getParametersIndexOffset } from '../../EventsFunctionsExtensionsLoader';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

const gd = global.gd;

type Props = {|
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  helpPagePath?: string,
  onConfigurationUpdated?: () => void,
  renderConfigurationHeader?: () => React.Node,
  freezeEventsFunctionType?: boolean,
|};

type State = {||};

const styles = {
  icon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
};

const getSentenceErrorText = (
  i18n: I18nType,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsFunction: gdEventsFunction
) => {
  const sentence = eventsFunction.getSentence();
  if (!sentence)
    return i18n._(
      t`Enter the sentence that will be displayed in the events sheet`
    );

  const parametersIndexOffset = getParametersIndexOffset(!!eventsBasedBehavior);

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
    } = this.props;

    const type = eventsFunction.getFunctionType();
    const isABehaviorLifecycleFunction =
      !!eventsBasedBehavior &&
      isBehaviorLifecycleFunction(eventsFunction.getName());
    if (isABehaviorLifecycleFunction) {
      return (
        <EmptyMessage>
          This is a "lifecycle method". It will be called automatically by the
          game engine.
        </EmptyMessage>
      );
    }

    return (
      <I18n>
        {({ i18n }) => (
          <Column>
            {renderConfigurationHeader ? renderConfigurationHeader() : null}
            <Line alignItems="center">
              <img src="res/function32.png" alt="" style={styles.icon} />
              <Column expand>
                <SelectField
                  value={type}
                  floatingLabelText={<Trans>Function type</Trans>}
                  fullWidth
                  disabled={!!freezeEventsFunctionType}
                  onChange={(e, i, value: string) => {
                    eventsFunction.setFunctionType(value);
                    if (onConfigurationUpdated) onConfigurationUpdated();
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
              </Column>
              <Column expand>
                <SemiControlledTextField
                  commitOnBlur
                  floatingLabelText={
                    <Trans>Full name displayed in editor</Trans>
                  }
                  hintText={getFullNameHintText(type)}
                  value={eventsFunction.getFullName()}
                  onChange={text => {
                    eventsFunction.setFullName(text);
                    if (onConfigurationUpdated) onConfigurationUpdated();
                    this.forceUpdate();
                  }}
                  fullWidth
                />
              </Column>
            </Line>
            <Line noMargin>
              <SemiControlledTextField
                commitOnBlur
                floatingLabelText={
                  <Trans>Description, displayed in editor</Trans>
                }
                hintText={getDescriptionHintText(type)}
                fullWidth
                multiLine
                value={eventsFunction.getDescription()}
                onChange={text => {
                  eventsFunction.setDescription(text);
                  if (onConfigurationUpdated) onConfigurationUpdated();
                  this.forceUpdate();
                }}
              />
            </Line>
            <Line>
              {type === gd.EventsFunction.Action ||
              type === gd.EventsFunction.Condition ? (
                <SemiControlledTextField
                  commitOnBlur
                  floatingLabelText={<Trans>Sentence in Events Sheet</Trans>}
                  hintText={t`Note: write _PARAMx_ for parameters, e.g: Flash _PARAM1_ for 5 seconds`}
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
                    eventsFunction
                  )}
                />
              ) : null}
            </Line>
            {helpPagePath ? (
              <Line>
                <HelpButton helpPagePath={helpPagePath} />
              </Line>
            ) : (
              <Spacer />
            )}
          </Column>
        )}
      </I18n>
    );
  }
}
