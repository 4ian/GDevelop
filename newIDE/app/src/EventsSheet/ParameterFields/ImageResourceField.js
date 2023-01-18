// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';

const ImageResourceField = React.forwardRef<
  ParameterFieldProps,
  ParameterFieldInterface
>((props, ref) => {
  const fieldRef = React.useRef<?ResourceSelector>(null);

  const focus = (selectAll: boolean = false) => {
    if (fieldRef.current) fieldRef.current.focus(selectAll);
  };

  React.useImperativeHandle(ref, () => ({
    focus,
  }));

  if (!props.resourceManagementProps || !props.project) {
    console.error(
      'Missing project or resourceManagementProps for ImageResourceField'
    );
    return null;
  }

  return (
    <ResourceSelector
      margin={props.isInline ? 'none' : 'dense'}
      project={props.project}
      resourceManagementProps={props.resourceManagementProps}
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
});

export default ImageResourceField;
