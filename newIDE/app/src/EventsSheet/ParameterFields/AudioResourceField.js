// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import { type ParameterFieldProps } from './ParameterFieldCommons';

export default class AudioResourceField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?ResourceSelector;

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  render() {
    if (!this.props.resourceManagementProps || !this.props.project) {
      console.error(
        'Missing project or resourceManagementProps for AudioResourceField'
      );
      return null;
    }

    return (
      <ResourceSelector
        margin={this.props.isInline ? 'none' : 'dense'}
        project={this.props.project}
        resourceManagementProps={this.props.resourceManagementProps}
        resourcesLoader={ResourcesLoader}
        resourceKind="audio"
        fullWidth
        initialResourceName={this.props.value}
        onChange={this.props.onChange}
        floatingLabelText={<Trans>Choose the audio file to use</Trans>}
        onRequestClose={this.props.onRequestClose}
        onApply={this.props.onApply}
        ref={field => (this._field = field)}
        id={
          this.props.parameterIndex !== undefined
            ? `parameter-${this.props.parameterIndex}-audio-field`
            : undefined
        }
      />
    );
  }
}
