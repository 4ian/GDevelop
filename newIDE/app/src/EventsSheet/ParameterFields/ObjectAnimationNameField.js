// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import Functions from '@material-ui/icons/Functions';
import TypeCursorSelect from '../../UI/CustomSvgIcons/TypeCursorSelect';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectAnimationNameField(props: ParameterFieldProps, ref) {
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

    const {
      projectScopedContainersAccessor,
      scope,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    } = props;

    const { eventsFunctionsExtension, eventsBasedObject } = scope;

    // We don't memo/callback this, as we want to recompute it every time something changes.
    // Because of the function getLastObjectParameterValue.
    const getAnimationNames = () => {
      const objectName = getLastObjectParameterValue({
        instructionMetadata,
        instruction,
        expressionMetadata,
        expression,
        parameterIndex,
      });
      return objectName
        ? projectScopedContainersAccessor
            .get()
            .getObjectsContainersList()
            .getAnimationNamesOfObject(objectName)
            .toJSArray()
        : [];
    };
    const canAutocomplete = !eventsFunctionsExtension || eventsBasedObject;
    const animationNames = canAutocomplete ? getAnimationNames() : [];

    const isCurrentValueInAnimationNamesList = !!animationNames.find(
      animationName => `"${animationName}"` === props.value
    );

    // If the current value is not in the list of animation names, display an expression field.
    const [isExpressionField, setIsExpressionField] = React.useState(
      (!!props.value && !isCurrentValueInAnimationNamesList) || !canAutocomplete
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

    const selectOptions = animationNames.map(animationName => {
      return (
        <SelectOption
          key={animationName}
          value={`"${animationName}"`}
          label={animationName}
          shouldNotTranslate
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
                  ? `parameter-${props.parameterIndex}-animation-name-field`
                  : undefined
              }
              value={props.value}
              onChange={onChangeSelectValue}
              margin={props.isInline ? 'none' : 'dense'}
              fullWidth
              floatingLabelText={fieldLabel}
              translatableHintText={t`Choose an animation`}
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
                  ? `parameter-${props.parameterIndex}-animation-name-field`
                  : undefined
              }
              expressionType="string"
              {...props}
              onChange={onChangeTextValue}
            />
          )
        }
        renderButton={style =>
          canAutocomplete ? (
            isExpressionField ? (
              <FlatButton
                id="switch-expression-select"
                leftIcon={<TypeCursorSelect />}
                style={style}
                primary
                label={<Trans>Select an animation</Trans>}
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
          ) : null
        }
      />
    );
  }
);
