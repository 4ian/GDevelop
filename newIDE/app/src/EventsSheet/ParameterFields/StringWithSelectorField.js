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
import { getParameterChoiceValues } from './ParameterMetadataTools';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function StringWithSelectorField(props: ParameterFieldProps, ref) {
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

    const choices = getParameterChoiceValues(props.parameterMetadata);

    const isCurrentValueInList = choices.some(
      choice => `"${choice}"` === props.value
    );

    // If the current value is not in the list, display an expression field.
    const [isExpressionField, setIsExpressionField] = React.useState(
      !!props.value && !isCurrentValueInList
    );

    React.useEffect(
      () => {
        if (!isExpressionField && !props.value && choices.length > 0) {
          props.onChange(`"${choices[0]}"`);
        }
      },
      [choices, isExpressionField, props]
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

    const selectOptions = choices.map(choice => {
      return (
        <SelectOption
          key={choice}
          value={`"${choice}"`}
          label={choice}
          shouldNotTranslate={true}
        />
      );
    });

    return (
      <TextFieldWithButtonLayout
        renderTextField={() =>
          !isExpressionField ? (
            <SelectField
              ref={field}
              id={
                props.parameterIndex !== undefined
                  ? `parameter-${props.parameterIndex}-layer-field`
                  : undefined
              }
              value={props.value}
              onChange={onChangeSelectValue}
              margin={props.isInline ? 'none' : 'dense'}
              fullWidth
              floatingLabelText={fieldLabel}
              translatableHintText={t`Choose a value`}
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
              expressionType="string"
              ref={field}
              id={
                props.parameterIndex !== undefined
                  ? `parameter-${props.parameterIndex}-string-with-selector`
                  : undefined
              }
              {...props}
              onChange={onChangeTextValue}
            />
          )
        }
        renderButton={style =>
          props.scope.eventsFunctionsExtension ? null : isExpressionField ? (
            <FlatButton
              id="switch-expression-select"
              leftIcon={<TypeCursorSelect />}
              style={style}
              primary
              label={<Trans>Select a value</Trans>}
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
