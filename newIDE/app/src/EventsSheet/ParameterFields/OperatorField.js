// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

const operatorLabels = {
  '=': t`= (set to)`,
  '+': t`+ (add)`,
  '-': t`- (subtract)`,
  '*': t`* (multiply by)`,
  '/': t`/ (divide by)`,
};

const mapTypeToOperators: { [string]: Array<string> } = {
  unknown: Object.keys(operatorLabels),
  number: ['=', '+', '-', '*', '/'],
  string: ['=', '+'],
  color: ['=', '+'],
};

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function OperatorField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?SelectFieldInterface>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const { parameterMetadata, value, onChange } = props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const comparedValueType = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : 'unknown';
    const operators =
      mapTypeToOperators[comparedValueType] || mapTypeToOperators.unknown;

    React.useEffect(
      () => {
        if (!value && comparedValueType !== 'unknown') {
          onChange('=');
        }
      },
      [value, onChange, comparedValueType]
    );

    return (
      <SelectField
        margin={props.isInline ? 'none' : 'dense'}
        fullWidth
        floatingLabelText={description}
        helperMarkdownText={
          parameterMetadata ? parameterMetadata.getLongDescription() : undefined
        }
        value={value}
        onChange={(e, i, value: string) => onChange(value)}
        ref={field}
        translatableHintText={t`Choose an operator`}
        id={
          props.parameterIndex !== undefined
            ? `parameter-${props.parameterIndex}-operator-field`
            : undefined
        }
      >
        {operators.map(operator => (
          <SelectOption
            key={operator}
            value={operator}
            label={operatorLabels[operator]}
          />
        ))}
      </SelectField>
    );
  }
);

export const renderInlineOperator = ({
  value,
  InvalidParameterValue,
  useAssignmentOperators,
}: ParameterInlineRendererProps) => {
  if (!value) {
    return (
      <InvalidParameterValue isEmpty>
        <Trans>Choose an operator</Trans>
      </InvalidParameterValue>
    );
  }

  if (useAssignmentOperators) {
    if (value === '=') return '=';
    else if (value === '+') return '+=';
    else if (value === '-') return '-=';
    else if (value === '/') return '/=';
    else if (value === '*') return '*=';
  } else {
    if (value === '=') return <Trans>set to</Trans>;
    else if (value === '+') return <Trans>add</Trans>;
    else if (value === '-') return <Trans>subtract</Trans>;
    else if (value === '/') return <Trans>divide by</Trans>;
    else if (value === '*') return <Trans>multiply by</Trans>;
  }

  return <InvalidParameterValue>{value}</InvalidParameterValue>;
};
