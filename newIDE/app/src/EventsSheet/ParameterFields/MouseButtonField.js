// @flow
import React from 'react';
import { Trans, t } from '@lingui/macro';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';

import GenericExpressionField from './GenericExpressionField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import Functions from '@material-ui/icons/Functions';
import FlatButton from '../../UI/FlatButton';
import TypeCursorSelect from '../../UI/CustomSvgIcons/TypeCursorSelect';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';

const mouseButtons = [
  { value: 'Left', label: t`Left (primary)` },
  { value: 'Right', label: t`Right (secondary)` },
  {
    value: 'Middle',
    label: t`Middle (Auxiliary button, usually the wheel button)`,
  },
  {
    value: 'Back',
    label: t`Back (Additional button, typically the Browser Back button)`,
  },
  {
    value: 'Forward',
    label: t`Forward (Additional button, typically the Browser Forward button)`,
  },
];
const mouseButtonsSet = new Set(mouseButtons.map(button => button.value));

const stringRegex = /^"(\w*)"$/;

const isValidLiteralMouseButton = (expression: string): boolean => {
  const matches = expression.match(stringRegex);
  return matches && matches[1] !== undefined
    ? mouseButtonsSet.has(matches[1])
    : // the expression is not a literal value
      false;
};

// This is not the negation of the function above as both return false for
// non-literal expressions.
const isInvalidLiteralMouseButton = (expression: string): boolean => {
  const matches = expression.match(stringRegex);
  // Return true by default as it could be an expression.
  return matches && matches[1] !== undefined
    ? !mouseButtonsSet.has(matches[1])
    : // the expression is not a literal value
      false;
};

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function MouseButtonField(props, ref) {
    const field = React.useRef<?(
      | GenericExpressionField
      | SelectFieldInterface
    )>(null);

    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    // If the current value is not in the list, display an expression field.
    const [isExpressionField, setIsExpressionField] = React.useState(
      !!props.value && !isValidLiteralMouseButton(props.value)
    );

    const switchFieldType = () => {
      setIsExpressionField(!isExpressionField);
    };

    const onChangeSelectValue = (event, value) => {
      props.onChange(event.target.value);
    };

    const onChangeTextValue = (value: string) => {
      props.onChange(value);
    };

    const fieldLabel = props.parameterMetadata
      ? props.parameterMetadata.getDescription()
      : undefined;

    const selectOptions = mouseButtons.map(({ value, label }) => {
      return <SelectOption key={value} value={`"${value}"`} label={label} />;
    });

    return (
      <TextFieldWithButtonLayout
        renderTextField={() =>
          !isExpressionField ? (
            <SelectField
              ref={field}
              id={
                props.parameterIndex !== undefined
                  ? `parameter-${props.parameterIndex}-mouse-button-field`
                  : undefined
              }
              value={props.value}
              onChange={onChangeSelectValue}
              margin={props.isInline ? 'none' : 'dense'}
              fullWidth
              floatingLabelText={fieldLabel}
              translatableHintText={t`Choose a mouse button`}
              helperMarkdownText={
                (props.parameterMetadata &&
                  props.parameterMetadata.getLongDescription()) ||
                null
              }
            >
              {selectOptions}
            </SelectField>
          ) : (
            <GenericExpressionField
              ref={field}
              id={
                props.parameterIndex !== undefined
                  ? `parameter-${props.parameterIndex}-mouse-button-field`
                  : undefined
              }
              expressionType="string"
              {...props}
              onChange={onChangeTextValue}
            />
          )
        }
        renderButton={style =>
          isExpressionField ? (
            <FlatButton
              id="switch-expression-select"
              leftIcon={<TypeCursorSelect />}
              style={style}
              primary
              label={<Trans>Select a mouse button</Trans>}
              onClick={switchFieldType}
            />
          ) : (
            <RaisedButton
              id="switch-expression-select"
              icon={<Functions />}
              style={style}
              primary
              label={<Trans>Use an expression</Trans>}
              onClick={switchFieldType}
            />
          )
        }
      />
    );
  }
);

export const renderInlineMouseButton = ({
  value,
  expressionIsValid,
  InvalidParameterValue,
}: ParameterInlineRendererProps) => {
  if (!value) {
    return (
      <InvalidParameterValue isEmpty>
        <Trans>Choose a mouse button</Trans>
      </InvalidParameterValue>
    );
  }

  return expressionIsValid && !isInvalidLiteralMouseButton(value) ? (
    value
  ) : (
    <InvalidParameterValue>{value}</InvalidParameterValue>
  );
};
