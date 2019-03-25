// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Line, Column } from '../../UI/Grid';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';

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
  focus() {}

  render() {
    const { parameterMetadata } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <Line>
        <p style={styles.description}>{description}</p>
        <Column noMargin>
          <RaisedButton
            style={styles.button}
            label={<Trans>Yes</Trans>}
            primary={this.props.value === 'yes'}
            onClick={() => this.props.onChange('yes')}
          />
        </Column>
        <Column noMargin>
          <RaisedButton
            style={styles.button}
            label={<Trans>No</Trans>}
            primary={this.props.value === 'no'}
            onClick={() => this.props.onChange('no')}
          />
        </Column>
      </Line>
    );
  }
}
