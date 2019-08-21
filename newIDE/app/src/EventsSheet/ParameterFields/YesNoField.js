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

const styles = {
  button: {
    margin: 5,
  },
  description: {
    display: 'inline-block',
    marginRight: 5,
  },
};

export default class YesNoField extends Component<ParameterFieldProps, void> {
  _yesButton = React.createRef<RaisedButton>();

  focus() {
    focusButton(this._yesButton);
  }

  render() {
    const { parameterMetadata, value } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;
    const effectiveValue = getParameterValueOrDefault(value, parameterMetadata);

    return (
      <Line>
        <p style={styles.description}>{description}</p>
        <Column noMargin>
          <RaisedButton
            style={styles.button}
            label={<Trans>Yes</Trans>}
            primary={effectiveValue === 'yes'}
            onClick={() => this.props.onChange('yes')}
            ref={this._yesButton}
          />
        </Column>
        <Column noMargin>
          <RaisedButton
            style={styles.button}
            label={<Trans>No</Trans>}
            primary={effectiveValue !== 'yes'}
            onClick={() => this.props.onChange('no')}
          />
        </Column>
      </Line>
    );
  }
}

export const renderInlineYesNo = ({
  value,
  parameterMetadata,
}: ParameterInlineRendererProps) => {
  if (getParameterValueOrDefault(value, parameterMetadata) === 'yes') {
    return <Trans>yes</Trans>;
  } else {
    return <Trans>no</Trans>;
  }
};
