// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ResourceSelector, {
  type ResourceSelectorInterface,
} from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function AtlasResourceField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?ResourceSelectorInterface>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    if (!props.resourceManagementProps || !props.project) {
      console.error(
        'Missing project or resourceManagementProps for AtlasResourceField'
      );
      return null;
    }

    return (
      <ResourceSelector
        margin={props.isInline ? 'none' : 'dense'}
        project={props.project}
        resourceManagementProps={props.resourceManagementProps}
        resourcesLoader={ResourcesLoader}
        resourceKind="atlas"
        fullWidth
        initialResourceName={props.value}
        onChange={props.onChange}
        floatingLabelText={<Trans>Choose the atlas file (.atlas) to use</Trans>}
        onRequestClose={props.onRequestClose}
        onApply={props.onApply}
        ref={field}
      />
    );
  }
);
