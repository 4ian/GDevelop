// @flow
import React from 'react';
import { mapFor } from '../../Utils/MapFor';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';

import GenericExpressionField from './GenericExpressionField';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function LayerField(props, ref) {
    const inputFieldRef = React.useRef<?(
      | GenericExpressionField
      | SelectFieldInterface
    )>(null);

    React.useImperativeHandle(ref, () => ({
      focus: ({ selectAll = false }: { selectAll?: boolean }) => {
        if (inputFieldRef.current) inputFieldRef.current.focus({ selectAll });
      },
    }));

    const { layout } = props.scope;
    const layerNames: Array<ExpressionAutocompletion> = layout
      ? mapFor(0, layout.getLayersCount(), i => {
          const layer = layout.getLayerAt(i);
          return { kind: 'Text', completion: `"${layer.getName()}"` };
        })
      : [];

    return (
      <GenericExpressionField
        id={
          props.parameterIndex !== undefined
            ? `parameter-${props.parameterIndex}-layer-field`
            : undefined
        }
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          layerNames.filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={inputFieldRef}
        {...props}
      />
    );
  }
);
