// @flow
import * as React from 'react';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { getParameterChoices } from './ParameterMetadataTools';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function StringWithSelectorField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          getParameterChoices(props.parameterMetadata).filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field}
        id={
          props.parameterIndex !== undefined
            ? `parameter-${props.parameterIndex}-string-with-selector`
            : undefined
        }
        {...props}
      />
    );
  }
);
