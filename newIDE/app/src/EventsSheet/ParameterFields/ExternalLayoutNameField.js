// @flow
import React from 'react';
import GenericExpressionField from './GenericExpressionField';
import { enumerateExternalLayouts } from '../../ProjectManager/EnumerateProjectItems';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ExternalLayoutNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    React.useImperativeHandle(ref, () => ({
      focus: ({ selectAll = false }: { selectAll?: boolean }) => {
        if (field.current) field.current.focus({ selectAll });
      },
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
