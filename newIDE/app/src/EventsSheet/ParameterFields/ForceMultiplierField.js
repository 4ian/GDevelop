// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Line, Column } from '../../UI/Grid';
import { makeNonBreakable } from '../../Utils/StringHelpers';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';
import GenericExpressionField from './GenericExpressionField';
import BackgroundText from '../../UI/BackgroundText';

type State = {|
  showDeprecatedNumericValue: boolean,
|};

export default class ForceMultiplierField extends Component<
  ParameterFieldProps,
  State
> {
  state = {
    showDeprecatedNumericValue:
      this.props.value !== '' &&
      this.props.value !== '1' &&
      this.props.value !== '0',
  };

  focus() {}

  render() {
    const { showDeprecatedNumericValue } = this.state;
    return (
      <Column expand noMargin>
        <Line expand alignItems="center">
          <Column>
            <RaisedButton
              label={makeNonBreakable('Instant')}
              primary={this.props.value === '' || this.props.value === '0'}
              onClick={() => this.props.onChange('0')}
            />
          </Column>
          <Column>
            <p>
              <Trans>
                The force will only push the object during the time of one
                frame. Typically used in an event with no conditions or with
                conditions that stay valid for a certain amount of time.
              </Trans>
            </p>
          </Column>
        </Line>
        <Line expand alignItems="center">
          <Column>
            <RaisedButton
              label={<Trans>Permanent</Trans>}
              primary={this.props.value === '1'}
              onClick={() => this.props.onChange('1')}
            />
          </Column>
          <Column>
            <p>
              <Trans>
                The force will push the object forever, unless you use the
                action "Stop the object". Typically used in an event with
                conditions that are only true once, or with a "Trigger Once"
                condition.
              </Trans>
            </p>
          </Column>
        </Line>
        {showDeprecatedNumericValue && (
          <React.Fragment>
            <BackgroundText>
              <Trans>or</Trans>
            </BackgroundText>
            <Line expand>
              <Column expand>
                <GenericExpressionField
                  expressionType="number"
                  {...this.props}
                />
              </Column>
            </Line>
            <BackgroundText>
              <Trans>
                The usage of a number or expression is deprecated. Please now
                use only "Permanent" or "Instant" for configuring forces.
              </Trans>
            </BackgroundText>
          </React.Fragment>
        )}
      </Column>
    );
  }
}

export const renderForceMultiplierString = (value: string) => {
  if (value === '1') return 'a permanent';
  else if (value === '0' || value === '') return 'an instant';

  return 'a (multiplier: ' + value + ')';
};
