// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
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
  function AudioResourceField(props, ref) {
    const field = React.useRef<?ResourceSelectorInterface>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
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
        ref={field}
        id={
          props.parameterIndex !== undefined
            ? `parameter-${props.parameterIndex}-audio-field`
            : undefined
        }
      />
    );
  }
);
