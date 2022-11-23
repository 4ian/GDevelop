// @flow
import React, { Component } from 'react';
import { mapFor } from '../../Utils/MapFor';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import GenericExpressionField from './GenericExpressionField';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';

export default class LayerField extends Component<ParameterFieldProps, {||}> {
  _field: ?GenericExpressionField;

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  render() {
    const { layout } = this.props.scope;
    const layerNames: Array<ExpressionAutocompletion> = layout
      ? mapFor(0, layout.getLayersCount(), i => {
          const layer = layout.getLayerAt(i);
          return { kind: 'Text', completion: `"${layer.getName()}"` };
        })
      : [];

    return (
      <GenericExpressionField
        id={
          this.props.parameterIndex !== undefined
            ? `parameter-${this.props.parameterIndex}-layer-field`
            : undefined
        }
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          layerNames.filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
