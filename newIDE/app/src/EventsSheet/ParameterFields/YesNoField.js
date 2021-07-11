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
import FormHelperText from '@material-ui/core/FormHelperText';
import { MarkdownText } from '../../UI/MarkdownText';

const styles = {
  button: {
    margin: 5,
  },
  description: {
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
      : null;
    const longDescription = parameterMetadata
      ? parameterMetadata.getLongDescription()
      : null;
    const effectiveValue = getParameterValueOrDefault(value, parameterMetadata);

    return (
      <Column noMargin>
        <Line>
          <Text style={styles.description} displayInlineAsSpan>
            {description}
          </Text>
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
        {longDescription ? (
          <FormHelperText variant="filled" margin="dense">
            <MarkdownText source={longDescription} />
          </FormHelperText>
        ) : null}
      </Column>
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
