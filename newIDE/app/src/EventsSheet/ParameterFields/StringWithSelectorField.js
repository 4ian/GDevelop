// @flow
import * as React from 'react';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import { getParameterChoices } from './ParameterMetadataTools';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function StringWithSelectorField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    React.useImperativeHandle(ref, () => ({
      focus: ({ selectAll = false }: {| selectAll?: boolean |}) => {
        if (field.current) field.current.focus({ selectAll });
      },
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
        {...props}
      />
    );
  }
);
