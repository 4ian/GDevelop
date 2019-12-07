// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import { type ParameterFieldProps } from './ParameterFieldCommons';

export default class VideoResourceField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?ResourceSelector;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    if (
      !this.props.resourceSources ||
      !this.props.onChooseResource ||
      !this.props.resourceExternalEditors ||
      !this.props.project
    ) {
      console.error(
        'Missing project, resourceSources, onChooseResource or resourceExternalEditors for VideoResourceField'
      );
      return null;
    }

    return (
      <ResourceSelector
        margin={this.props.isInline ? 'none' : 'dense'}
        project={this.props.project}
        resourceSources={this.props.resourceSources}
        onChooseResource={this.props.onChooseResource}
        resourceExternalEditors={this.props.resourceExternalEditors}
        resourcesLoader={ResourcesLoader}
        resourceKind="video"
        fullWidth
        initialResourceName={this.props.value}
        onChange={this.props.onChange}
        floatingLabelText={<Trans>Choose the video file to use</Trans>}
        ref={field => (this._field = field)}
      />
    );
  }
}
