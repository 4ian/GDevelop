// @flow
import { Trans } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import * as React from 'react';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import SemiControlledAutoComplete, {
  type SemiControlledAutoCompleteInterface,
} from '../../UI/SemiControlledAutoComplete';
import { keyNames } from './KeyboardKeyField';

const isKeyValid = (key: string) => keyNames.indexOf(key) !== -1;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function KeyField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?SemiControlledAutoCompleteInterface>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const {
      value,
      onChange,
      isInline,
      parameterMetadata,
      onRequestClose,
      onApply,
    } = props;

    return (
      <SemiControlledAutoComplete
        margin={props.isInline ? 'none' : 'dense'}
        floatingLabelText={
          parameterMetadata ? parameterMetadata.getDescription() : undefined
        }
        helperMarkdownText={
          parameterMetadata ? parameterMetadata.getLongDescription() : undefined
        }
        fullWidth
        value={value}
        onChange={onChange}
        dataSource={keyNames.map(keyName => ({
          text: keyName,
          value: keyName,
        }))}
        openOnFocus={!isInline}
        onRequestClose={onRequestClose}
        onApply={onApply}
        ref={field}
        errorText={
          !value ? (
            <Trans>You must select a key.</Trans>
          ) : !isKeyValid(value) ? (
            <Trans>You must select a valid key. "{value}" is not valid.</Trans>
          ) : (
            undefined
          )
        }
      />
    );
  }
);

export const renderInlineKey = ({
  value,
  InvalidParameterValue,
}: ParameterInlineRendererProps) => {
  if (!value) {
    return (
      <InvalidParameterValue isEmpty>
        <Trans>Choose a key</Trans>
      </InvalidParameterValue>
    );
  }

  return isKeyValid(value) ? (
    value
  ) : (
    <InvalidParameterValue>{value}</InvalidParameterValue>
  );
};
