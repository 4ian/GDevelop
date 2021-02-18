// @flow
import { Trans } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import React, { Component } from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { Line, Column } from '../../UI/Grid';
import {
  type ParameterFieldProps,
  getParameterValueOrDefault,
} from './ParameterFieldCommons';
import { focusButton } from '../../UI/Button';
import Text from '../../UI/Text';

const styles = {
  button: {
    margin: 5,
  },
  description: {
    marginRight: 5,
  },
};

export default class TrueFalseField extends Component<
  ParameterFieldProps,
  void
> {
  _trueButton = React.createRef<RaisedButton>();

  focus() {
    focusButton(this._trueButton);
  }

  render() {
    const { parameterMetadata, value } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;
    const effectiveValue = getParameterValueOrDefault(value, parameterMetadata);

    return (
      <Line>
        <Text style={styles.description} displayInlineAsSpan>
          {description}
        </Text>
        <Column noMargin>
          <RaisedButton
            style={styles.button}
            label={<Trans>True</Trans>}
            primary={effectiveValue === 'True'}
            onClick={() => this.props.onChange('True')}
            ref={this._trueButton}
          />
        </Column>
        <Column noMargin>
          <RaisedButton
            style={styles.button}
            label={<Trans>False</Trans>}
            primary={effectiveValue !== 'True'}
            onClick={() => this.props.onChange('False')}
          />
        </Column>
      </Line>
    );
  }
}

export const renderInlineTrueFalse = ({
  value,
  parameterMetadata,
}: ParameterInlineRendererProps) => {
  if (getParameterValueOrDefault(value, parameterMetadata) === 'True') {
    return <Trans>true</Trans>;
  } else {
    return <Trans>false</Trans>;
  }
};
