// @flow
import React from 'react';
import GenericExpressionField from './GenericExpressionField';
import { enumerateExternalLayouts } from '../../ProjectManager/EnumerateProjectItems';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ExternalLayoutNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const externalLayoutNames: Array<ExpressionAutocompletion> = props.project
      ? enumerateExternalLayouts(props.project).map(externalLayout => ({
          kind: 'Text',
          completion: `"${externalLayout.getName()}"`,
        }))
      : [];

    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          externalLayoutNames.filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field}
        {...props}
      />
    );
  }
);
