// @flow
import * as React from 'react';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import {
  getPreviousParameterValue,
  tryExtractStringLiteralContent,
} from './ParameterMetadataTools';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import { Trans, t } from '@lingui/macro';
import FlatButton from '../../UI/FlatButton';
import TypeCursorSelect from '../../UI/CustomSvgIcons/TypeCursorSelect';
import RaisedButton from '../../UI/RaisedButton';
import Functions from '@material-ui/icons/Functions';

const gd: libGDevelop = global.gd;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function LayerEffectParameterNameField(props: ParameterFieldProps, ref) {
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

    const { project, scope, instruction, expression, parameterIndex } = props;

    // We don't memo/callback this, as we want to recompute it every time something changes.
    // Because of the function getPreviousParameterValue.
    const getEffectParameterNames = () => {
      const { layout } = scope;
      if (!layout || !project) return [];

      const layerName =
        tryExtractStringLiteralContent(
          getPreviousParameterValue({
            instruction,
            expression,
            parameterIndex: parameterIndex ? parameterIndex - 1 : null,
          })
        ) || ''; // If no layer name is provided, this is the Base layer.
      if (!layout.hasLayerNamed(layerName)) return [];
      const layer = layout.getLayer(layerName);

      const effectName = tryExtractStringLiteralContent(
        getPreviousParameterValue({
          instruction,
          expression,
          parameterIndex,
        })
      );
      if (!effectName || !layer.getEffects().hasEffectNamed(effectName)) {
        return [];
      }
      const effect = layer.getEffects().getEffect(effectName);

      const effectType = effect.getEffectType();
      const effectMetadata = gd.MetadataProvider.getEffectMetadata(
        project.getCurrentPlatform(),
        effectType
      );
      const properties = effectMetadata.getProperties();
      const parameterNames = properties.keys().toJSArray();

      return parameterNames.sort();
    };

    const effectParameterNames = getEffectParameterNames();

    const isCurrentValueInEffectParameterNamesList = !!effectParameterNames.find(
      effectParameterName => `"${effectParameterName}"` === props.value
    );

    // If the current value is not in the list, display an expression field.
    const [isExpressionField, setIsExpressionField] = React.useState(
      (!!props.value && !isCurrentValueInEffectParameterNamesList) ||
        props.scope.eventsFunctionsExtension
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

    const selectOptions = effectParameterNames.map(effectParameterName => {
      return (
        <SelectOption
          key={effectParameterName}
          value={`"${effectParameterName}"`}
          label={effectParameterName}
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
                  ? `parameter-${
                      props.parameterIndex
                    }-layer-effect-parameter-name-field`
                  : undefined
              }
              value={props.value}
              onChange={onChangeSelectValue}
              margin={props.isInline ? 'none' : 'dense'}
              fullWidth
              floatingLabelText={fieldLabel}
              translatableHintText={t`Choose a parameter`}
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
                  ? `parameter-${
                      props.parameterIndex
                    }-layer-effect-parameter-name-field`
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
              label={<Trans>Select an effect property</Trans>}
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
