// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import RaisedButton from '../../UI/RaisedButton';
import { type ButtonInterface } from '../../UI/Button';
import { Line, Column } from '../../UI/Grid';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import GenericExpressionField from './GenericExpressionField';
import BackgroundText from '../../UI/BackgroundText';
import { focusButton } from '../../UI/Button';
import Text from '../../UI/Text';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ForceMultiplierField(props: ParameterFieldProps, ref) {
    const button = React.useRef<?ButtonInterface>(null);
    const focus: FieldFocusFunction = options => {
      if (button.current) focusButton(button.current);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));
    const showDeprecatedNumericValue =
      props.value !== '' && props.value !== '1' && props.value !== '0';

    return (
      <Column expand noMargin>
        <Line expand alignItems="center">
          <Column>
            <RaisedButton
              label={<Trans>Instant</Trans>}
              primary={props.value === '' || props.value === '0'}
              onClick={() => props.onChange('0')}
              ref={button}
            />
          </Column>
          <Column>
            <Text>
              <Trans>
                The force will only push the object during the time of one
                frame. Typically used in an event with no conditions or with
                conditions that stay valid for a certain amount of time.
              </Trans>
            </Text>
          </Column>
        </Line>
        <Line expand alignItems="center">
          <Column>
            <RaisedButton
              label={<Trans>Permanent</Trans>}
              primary={props.value === '1'}
              onClick={() => props.onChange('1')}
            />
          </Column>
          <Column>
            <Text>
              <Trans>
                The force will push the object forever, unless you use the
                action "Stop the object". Typically used in an event with
                conditions that are only true once, or with a "Trigger Once"
                condition.
              </Trans>
            </Text>
          </Column>
        </Line>
        {showDeprecatedNumericValue && (
          <React.Fragment>
            <BackgroundText>
              <Trans>or</Trans>
            </BackgroundText>
            <Line expand>
              <Column expand>
                <GenericExpressionField expressionType="number" {...props} />
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
);

export const renderInlineForceMultiplier = ({
  value,
}: ParameterInlineRendererProps) => {
  if (value === '1') return <Trans>{`a permanent`}</Trans>;
  else if (value === '0' || value === '') return <Trans>{`an instant`}</Trans>;

  return 'a (multiplier: ' + value + ')';
};
