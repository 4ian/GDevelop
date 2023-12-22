// @flow
import React from 'react';
import { Trans, t } from '@lingui/macro';
import { mapFor } from '../../Utils/MapFor';
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

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function LayerField(props, ref) {
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

    const { layout } = props.scope;
    // The list is not kept with a memo because layers could be changed by
    // another component without this one to know.
    const layerNames = layout
      ? mapFor(0, layout.getLayersCount(), i => {
          const layer = layout.getLayerAt(i);
          return layer.getName();
        })
      : [];

    const isCurrentValueInLayersList = !!layerNames.find(
      layerName => `"${layerName}"` === props.value
    );

    // If the current value is not in the list of layers, display an expression field.
    const [isExpressionField, setIsExpressionField] = React.useState(
      (!!props.value && !isCurrentValueInLayersList) ||
        props.scope.eventsFunctionsExtension
    );

    const switchFieldType = () => {
      // If the user had entered `""` (double quotes) we change the value to `` (empty string)
      // so that the dropdown detects it as the base layer.
      if (props.value === '""') props.onChange('');
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

    const selectOptions = layerNames.map(layerName => {
      const isBaseLayer = layerName === '';
      return (
        <SelectOption
          key={isBaseLayer ? 'Base layer' : layerName}
          value={isBaseLayer ? '' : `"${layerName}"`}
          label={isBaseLayer ? t`Base layer` : layerName}
          shouldNotTranslate={!isBaseLayer}
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
              translatableHintText={t`Choose a layer`}
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
                  ? `parameter-${props.parameterIndex}-layer-field`
                  : undefined
              }
              expressionType="string"
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
              label={<Trans>Select a layer</Trans>}
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
