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
  function FontResourceField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?ResourceSelector>(null);
    React.useImperativeHandle(ref, () => ({
      focus: ({ selectAll = false }: {| selectAll?: boolean |}) => {
        if (field.current) field.current.focus({ selectAll });
      },
    }));

    if (!props.resourceManagementProps || !props.project) {
      console.error(
        'Missing project or resourceManagementProps for BitmapFontResourceField'
      );
      return null;
    }

    return (
      <ResourceSelector
        margin={props.isInline ? 'none' : 'dense'}
        project={props.project}
        resourceManagementProps={props.resourceManagementProps}
        resourcesLoader={ResourcesLoader}
        resourceKind="bitmapFont"
        fullWidth
        initialResourceName={props.value}
        onChange={props.onChange}
        floatingLabelText={
          <Trans>Choose the bitmap font file (.fnt, .xml) to use</Trans>
        }
        onRequestClose={props.onRequestClose}
        onApply={props.onApply}
        ref={field}
      />
    );
  }
);
