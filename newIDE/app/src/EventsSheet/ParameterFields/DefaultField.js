// @flow
import * as React from 'react';
import SemiControlledTextField, {
  type SemiControlledTextFieldInterface,
} from '../../UI/SemiControlledTextField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import { highlightSearchText } from '../../Utils/HighlightSearchText';

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function DefaultField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?SemiControlledTextFieldInterface>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const { parameterMetadata } = props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <SemiControlledTextField
        margin={props.isInline ? 'none' : 'dense'}
        commitOnBlur
        value={props.value}
        floatingLabelText={description}
        helperMarkdownText={
          parameterMetadata ? parameterMetadata.getLongDescription() : undefined
        }
        onChange={(text: string) => props.onChange(text)}
        ref={field}
        fullWidth
      />
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);

export const renderInlineDefaultField = ({
  value,
  expressionIsValid,
  hasDeprecationWarning,
  parameterMetadata,
  InvalidParameterValue,
  DeprecatedParameterValue,
  MissingParameterValue,
  highlightedSearchText,
  highlightedSearchMatchCase,
}: ParameterInlineRendererProps): string | React.Node => {
  if (!value && !parameterMetadata.isOptional()) {
    return <MissingParameterValue />;
  }
  if (!expressionIsValid) {
    return (
      <InvalidParameterValue>
        {highlightSearchText(value, highlightedSearchText, {
          matchCase: highlightedSearchMatchCase,
        })}
      </InvalidParameterValue>
    );
  }
  if (hasDeprecationWarning) {
    return (
      <DeprecatedParameterValue>
        {highlightSearchText(value, highlightedSearchText, {
          matchCase: highlightedSearchMatchCase,
        })}
      </DeprecatedParameterValue>
    );
  }
  return highlightSearchText(value, highlightedSearchText, {
    matchCase: highlightedSearchMatchCase,
  });
};
