// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { tryExtractStringLiteralContent } from './ParameterMetadataTools';
import StringField from './StringField';
import { getEnumVariableForEditedValue } from './EnumVariableValueResolver';

const toStringLiteral = (value: string) => JSON.stringify(value);

const EnumVariableSelectValueField = React.forwardRef<
  {|
    ...ParameterFieldProps,
    enumValues: Array<string>,
  |},
  ParameterFieldInterface
>(function EnumVariableSelectValueField({ enumValues, ...props }, ref) {
  const field = React.useRef<?SelectFieldInterface>(null);
  const focus: FieldFocusFunction = options => {
    if (field.current) field.current.focus(options);
  };
  React.useImperativeHandle(ref, () => ({
    focus,
  }));

  const currentLiteralValue = tryExtractStringLiteralContent(props.value);
  const isCurrentValueAllowed =
    !!props.value &&
    enumValues.some(value => toStringLiteral(value) === props.value);
  const { onChange, value } = props;

  React.useEffect(
    () => {
      if (!value && enumValues.length > 0) {
        onChange(toStringLiteral(enumValues[0]));
      }
    },
    [enumValues, onChange, value]
  );

  return (
    <SelectField
      ref={field}
      id={
        props.parameterIndex !== undefined
          ? `parameter-${props.parameterIndex}-enum-value-field`
          : undefined
      }
      value={props.value}
      onChange={event => props.onChange(event.target.value)}
      margin={props.isInline ? 'none' : 'dense'}
      fullWidth
      floatingLabelText={
        props.parameterMetadata
          ? props.parameterMetadata.getDescription()
          : undefined
      }
      helperMarkdownText={
        (props.parameterMetadata &&
          props.parameterMetadata.getLongDescription()) ||
        null
      }
      translatableHintText={t`Choose a value`}
      errorText={
        props.value && !isCurrentValueAllowed ? (
          currentLiteralValue !== null ? (
            <Trans>Choose one of the enum values.</Trans>
          ) : (
            <Trans>
              Enum values must be selected from the enum definition.
            </Trans>
          )
        ) : null
      }
    >
      {enumValues.map(enumValue => (
        <SelectOption
          key={enumValue}
          value={toStringLiteral(enumValue)}
          label={enumValue}
          shouldNotTranslate
        />
      ))}
    </SelectField>
  );
});

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function EnumVariableValueField(props: ParameterFieldProps, ref) {
    const enumVariable = getEnumVariableForEditedValue(props);
    const enumValues = enumVariable ? enumVariable.enumValues : [];

    if (!enumVariable || enumValues.length === 0) {
      return <StringField {...props} ref={ref} />;
    }

    return (
      <EnumVariableSelectValueField
        {...props}
        enumValues={enumValues}
        ref={ref}
      />
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);
