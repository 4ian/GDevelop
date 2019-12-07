// @flow
import React, { Component } from 'react';
import { mapFor } from '../../Utils/MapFor';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';

export default class LayerField extends Component<ParameterFieldProps, {||}> {
  _field: ?SemiControlledAutoComplete;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const { value, onChange, isInline, scope, parameterMetadata } = this.props;
    const { layout } = scope;
    const layerNames = layout
      ? mapFor(0, layout.getLayersCount(), i => {
          const layer = layout.getLayerAt(i);
          return layer.getName();
        })
      : [];

    return (
      <SemiControlledAutoComplete
        margin={this.props.isInline ? 'none' : 'dense'}
        floatingLabelText={
          parameterMetadata ? parameterMetadata.getDescription() : undefined
        }
        fullWidth
        value={value}
        onChange={onChange}
        openOnFocus={isInline}
        dataSource={layerNames.map(layerName => ({
          text: layerName ? `"${layerName}"` : '"" (Base layer)',
          value: `"${layerName}"`,
        }))}
        hintText={'""'}
        ref={field => (this._field = field)}
      />
    );
  }
}
