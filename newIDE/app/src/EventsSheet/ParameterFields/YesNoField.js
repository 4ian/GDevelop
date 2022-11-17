// @flow
import { Trans } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import React, { Component } from 'react';
import { Line, Column } from '../../UI/Grid';
import {
  type ParameterFieldProps,
  getParameterValueOrDefault,
} from './ParameterFieldCommons';
import { focusButton } from '../../UI/Button';
import Text from '../../UI/Text';
import FormHelperText from '@material-ui/core/FormHelperText';
import { MarkdownText } from '../../UI/MarkdownText';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';

const styles = {
  description: {
    marginRight: 5,
  },
};

export default class YesNoField extends Component<ParameterFieldProps, void> {
  _yesButton = React.createRef<Button>();

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
        <Line alignItems="center" justifyContent="space-between">
          <Text style={styles.description} displayInlineAsSpan>
            {description}
          </Text>
          <ButtonGroup>
            <Button
              id="yes-button"
              data-effective={effectiveValue === 'yes' ? 'true' : undefined}
              variant={effectiveValue === 'yes' ? 'contained' : 'outlined'}
              color={effectiveValue === 'yes' ? 'secondary' : 'default'}
              onClick={() => this.props.onChange('yes')}
              ref={this._yesButton}
            >
              <Trans>Yes</Trans>
            </Button>
            <Button
              id="no-button"
              data-effective={effectiveValue !== 'yes' ? 'true' : undefined}
              variant={effectiveValue !== 'yes' ? 'contained' : 'outlined'}
              color={effectiveValue !== 'yes' ? 'secondary' : 'default'}
              onClick={() => this.props.onChange('no')}
            >
              <Trans>No</Trans>
            </Button>
          </ButtonGroup>
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
