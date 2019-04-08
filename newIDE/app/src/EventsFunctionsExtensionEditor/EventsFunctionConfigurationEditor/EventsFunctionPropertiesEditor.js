// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import { Column, Line, Spacer } from '../../UI/Grid';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { mapVector } from '../../Utils/MapFor';
import HelpButton from '../../UI/HelpButton';
import SemiControlledTextField from '../../UI/SemiControlledTextField';

const gd = global.gd;

type Props = {|
  eventsFunction: gdEventsFunction,
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
  eventsFunction: gdEventsFunction
) => {
  const sentence = eventsFunction.getSentence();
  if (!sentence)
    return i18n._(
      t`Enter the sentence that will be displayed in the events sheet`
    );

  const missingParameters = mapVector(
    eventsFunction.getParameters(),
    (_, index) => {
      const expectedString = `_PARAM${index + 1}_`;
      if (sentence.indexOf(expectedString) === -1) return expectedString;

      return null;
    }
  ).filter(Boolean);

  if (missingParameters.length) {
    return (
      i18n._(t`The sentence is missing this/these parameter(s):`) +
      missingParameters.join(', ')
    );
  }

  return undefined;
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
    } = this.props;

    const type = eventsFunction.getFunctionType();

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
                  fullWidth
                  disabled={!!freezeEventsFunctionType}
                  onChange={(e, i, value) => {
                    eventsFunction.setFunctionType(value);
                    if (onConfigurationUpdated) onConfigurationUpdated();
                    this.forceUpdate();
                  }}
                >
                  <MenuItem
                    value={gd.EventsFunction.Action}
                    primaryText={<Trans>Action</Trans>}
                  />
                  <MenuItem
                    value={gd.EventsFunction.Condition}
                    primaryText={<Trans>Condition</Trans>}
                  />
                  <MenuItem
                    value={gd.EventsFunction.Expression}
                    primaryText={<Trans>Expression</Trans>}
                  />
                  <MenuItem
                    value={gd.EventsFunction.StringExpression}
                    primaryText={<Trans>String Expression</Trans>}
                  />
                </SelectField>
              </Column>
              <Column expand>
                <SemiControlledTextField
                  commitOnBlur
                  hintText={<Trans>Full name displayed in editor</Trans>}
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
                hintText={<Trans>Description, displayed in editor</Trans>}
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
                  hintText={
                    <Trans>
                      Sentence in Events Sheet (write _PARAMx_ for parameters,
                      e.g: _PARAM1_)
                    </Trans>
                  }
                  fullWidth
                  value={eventsFunction.getSentence()}
                  onChange={text => {
                    eventsFunction.setSentence(text);
                    if (onConfigurationUpdated) onConfigurationUpdated();
                    this.forceUpdate();
                  }}
                  errorText={getSentenceErrorText(i18n, eventsFunction)}
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
