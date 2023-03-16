// @flow
import * as React from 'react';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function StringField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    React.useImperativeHandle(ref, () => ({
      focus: ({ selectAll = false }: {| selectAll?: boolean |}) => {
        if (field.current) field.current.focus({ selectAll });
      },
    }));

    return (
      <GenericExpressionField
        expressionType="string"
        ref={field}
        {...props}
        id={
          props.parameterIndex !== undefined
            ? `parameter-${props.parameterIndex}-string-field`
            : undefined
        }
      />
    );
  }
);
