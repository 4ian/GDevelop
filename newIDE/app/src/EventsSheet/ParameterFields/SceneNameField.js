// @flow
import React from 'react';
import GenericExpressionField from './GenericExpressionField';
import { enumerateLayouts } from '../../ProjectManager/EnumerateProjectItems';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function SceneNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const layoutNames: Array<ExpressionAutocompletion> = props.project
      ? enumerateLayouts(props.project).map(layout => ({
          kind: 'Text',
          completion: `"${layout.getName()}"`,
        }))
      : [];

    return (
      <GenericExpressionField
        id={
          props.parameterIndex !== undefined
            ? `parameter-${props.parameterIndex}-scene-field`
            : undefined
        }
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          layoutNames.filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field}
        {...props}
      />
    );
  }
);
