// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import { type ParameterFieldProps } from './ParameterFieldCommons';

const ImageResourceField = (props: ParameterFieldProps) => {
  const fieldRef = React.useRef<?ResourceSelector>(null);

  const focus = (selectAll: boolean = false) => {
    if (fieldRef.current) fieldRef.current.focus(selectAll);
  };

  if (
    !props.resourceSources ||
    !props.onChooseResource ||
    !props.resourceExternalEditors ||
    !props.project
  ) {
    console.error(
      'Missing project, resourceSources, onChooseResource or resourceExternalEditors for ImageResourceField'
    );
    return null;
  }

  return (
    <ResourceSelector
      margin={props.isInline ? 'none' : 'dense'}
      project={props.project}
      resourceSources={props.resourceSources}
      onChooseResource={props.onChooseResource}
      resourceExternalEditors={props.resourceExternalEditors}
      resourcesLoader={ResourcesLoader}
      resourceKind="image"
      fullWidth
      initialResourceName={props.value}
      onChange={props.onChange}
      floatingLabelText={<Trans>Choose the image file to use</Trans>}
      onRequestClose={props.onRequestClose}
      onApply={props.onApply}
      ref={fieldRef}
    />
  );
};

export default ImageResourceField;
