// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function JsonResourceField(props, ref) {
    const fieldRef = React.useRef<?ResourceSelector>(null);

    React.useImperativeHandle(ref, () => ({
      focus: ({ selectAll = false }: {| selectAll?: boolean |}) => {
        if (fieldRef.current) fieldRef.current.focus({ selectAll });
      },
    }));

    if (!props.resourceManagementProps || !props.project) {
      console.error(
        'Missing project or resourceManagementProps for JsonResourceField'
      );
      return null;
    }

    return (
      <ResourceSelector
        margin={props.isInline ? 'none' : 'dense'}
        project={props.project}
        resourceManagementProps={props.resourceManagementProps}
        resourcesLoader={ResourcesLoader}
        resourceKind="json"
        fullWidth
        initialResourceName={props.value}
        onChange={props.onChange}
        floatingLabelText={<Trans>Choose the json file to use</Trans>}
        onRequestClose={props.onRequestClose}
        onApply={props.onApply}
        ref={fieldRef}
      />
    );
  }
);
