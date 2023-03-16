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
  function AudioResourceField(props, ref) {
    const fieldRef = React.useRef<?ResourceSelector>(null);
    React.useImperativeHandle(ref, () => ({
      focus: ({ selectAll = false }: { selectAll?: boolean }) => {
        if (fieldRef.current) fieldRef.current.focus({ selectAll });
      },
    }));

    if (!props.resourceManagementProps || !props.project) {
      console.error(
        'Missing project or resourceManagementProps for AudioResourceField'
      );
      return null;
    }

    return (
      <ResourceSelector
        margin={props.isInline ? 'none' : 'dense'}
        project={props.project}
        resourceManagementProps={props.resourceManagementProps}
        resourcesLoader={ResourcesLoader}
        resourceKind="audio"
        fullWidth
        initialResourceName={props.value}
        onChange={props.onChange}
        floatingLabelText={<Trans>Choose the audio file to use</Trans>}
        onRequestClose={props.onRequestClose}
        onApply={props.onApply}
        ref={fieldRef}
        id={
          props.parameterIndex !== undefined
            ? `parameter-${props.parameterIndex}-audio-field`
            : undefined
        }
      />
    );
  }
);
