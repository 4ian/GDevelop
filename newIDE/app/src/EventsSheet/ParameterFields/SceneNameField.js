// @flow
import React, { Component } from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';
import { enumerateLayouts } from '../../ProjectManager/EnumerateProjectItems';

export default class SceneNameField extends Component<
  ParameterFieldProps,
  {||}
> {
  _field: ?SemiControlledAutoComplete;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const {
      value,
      onChange,
      isInline,
      project,
      parameterMetadata,
    } = this.props;
    const layoutNames = project
      ? enumerateLayouts(project).map(layout => layout.getName())
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
        dataSource={layoutNames.map(layoutName => ({
          text: `"${layoutName}"`,
          value: `"${layoutName}"`,
        }))}
        hintText={'""'}
        ref={field => (this._field = field)}
      />
    );
  }
}
