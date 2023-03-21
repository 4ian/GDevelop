// @flow
import React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
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
import Layers from '../../UI/CustomSvgIcons/Layers';

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
      !!props.value && !isCurrentValueInLayersList
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

    const selectOptions = layerNames.map(layerName => (
      <SelectOption
        key={layerName === '' ? 'Base layer' : layerName}
        value={layerName === '' ? '' : `"${layerName}"`}
        primaryText={layerName === '' ? t`Base layer` : layerName}
      />
    ));

    return (
      <I18n>
        {({ i18n }) => (
          <>
            <TextFieldWithButtonLayout
              renderTextField={() =>
                !isExpressionField ? (
                  <SelectField
                    ref={field}
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
                isExpressionField ? (
                  <FlatButton
                    id="switch-expression-select"
                    leftIcon={<Layers />}
                    style={style}
                    primary
                    label={i18n._(t`Select a Layer`)}
                    onClick={switchFieldType}
                  />
                ) : (
                  <RaisedButton
                    id="switch-expression-select"
                    icon={<Functions />}
                    style={style}
                    primary
                    label={i18n._(t`Use an Expression`)}
                    onClick={switchFieldType}
                  />
                )
              }
            />
          </>
        )}
      </I18n>
    );
  }
);
