// @flow
import { Trans } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import * as React from 'react';
import { Line, Column } from '../../UI/Grid';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
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

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function TrueFalseField(props: ParameterFieldProps, ref) {
    const button = React.useRef<?Button>(null);
    const focus: FieldFocusFunction = options => {
      if (button.current) focusButton(button.current);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const { parameterMetadata, value } = props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;
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
              variant={effectiveValue === 'True' ? 'contained' : 'outlined'}
              color={effectiveValue === 'True' ? 'secondary' : 'default'}
              onClick={() => props.onChange('True')}
              ref={button}
            >
              <Trans>True</Trans>
            </Button>
            <Button
              variant={effectiveValue !== 'True' ? 'contained' : 'outlined'}
              color={effectiveValue !== 'True' ? 'secondary' : 'default'}
              onClick={() => props.onChange('False')}
            >
              <Trans>False</Trans>
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
);

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
