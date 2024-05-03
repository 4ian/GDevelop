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
import Text from '../../UI/Text';
import FormHelperText from '@material-ui/core/FormHelperText';
import { MarkdownText } from '../../UI/MarkdownText';
import TwoStatesButton, {
  type TwoStatesButtonInterface,
} from '../../UI/TwoStatesButton';

const styles = {
  description: {
    marginRight: 5,
  },
};

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function YesNoField(props: ParameterFieldProps, ref) {
    const button = React.useRef<?TwoStatesButtonInterface>(null);
    const focus: FieldFocusFunction = options => {
      if (button.current) button.current.focusLeftButton();
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const { parameterMetadata, value } = props;
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
          <TwoStatesButton
            value={effectiveValue}
            leftButton={{
              label: <Trans>Yes</Trans>,
              value: 'yes',
              id: 'yes-button',
            }}
            rightButton={{
              label: <Trans>No</Trans>,
              value: 'no',
              id: 'no-button',
            }}
            onChange={props.onChange}
            ref={button}
          />
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
