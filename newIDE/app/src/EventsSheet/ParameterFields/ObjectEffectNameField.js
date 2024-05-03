// @flow
import * as React from 'react';
import intersection from 'lodash/intersection';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import getObjectByName from '../../Utils/GetObjectByName';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import { enumerateEffectNames } from '../../EffectsList/EnumerateEffects';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import { mapVector } from '../../Utils/MapFor';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import TypeCursorSelect from '../../UI/CustomSvgIcons/TypeCursorSelect';
import Functions from '@material-ui/icons/Functions';
import { Trans, t } from '@lingui/macro';
import { TextFieldWithButtonLayout } from '../../UI/Layout';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectEffectNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField | SelectFieldInterface>(
      null
    );
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const {
      project,
      scope,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    } = props;

    // We don't memo/callback this, as we want to recompute it every time something changes.
    // Because of the function getLastObjectParameterValue.
    const getEffectNames = (): Array<string> => {
      const objectOrGroupName = getLastObjectParameterValue({
        instructionMetadata,
        instruction,
        expressionMetadata,
        expression,
        parameterIndex,
      });
      if (!objectOrGroupName || !project) {
        return [];
      }

      const object = getObjectByName(project, scope.layout, objectOrGroupName);
      if (object) {
        return enumerateEffectNames(object.getEffects()).sort();
      }
      const group = getObjectGroupByName(
        project,
        scope.layout,
        objectOrGroupName
      );
      if (group) {
        const effectsNamesByObject: string[][] = mapVector(
          group.getAllObjectsNames(),
          objectName => {
            const object = getObjectByName(project, scope.layout, objectName);
            if (!object) {
              return null;
            }
            return enumerateEffectNames(object.getEffects());
          }
        ).filter(Boolean);
        return intersection(...effectsNamesByObject).sort();
      }

      return [];
    };

    const effectNames = getEffectNames();

    const isCurrentValueInEffectNamesList = !!effectNames.find(
      effectName => `"${effectName}"` === props.value
    );

    // If the current value is not in the list, display an expression field.
    const [isExpressionField, setIsExpressionField] = React.useState(
      (!!props.value && !isCurrentValueInEffectNamesList) ||
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

    const selectOptions = effectNames.map(effectName => {
      return (
        <SelectOption
          key={effectName}
          value={`"${effectName}"`}
          label={effectName}
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
                  ? `parameter-${props.parameterIndex}-object-effect-name-field`
                  : undefined
              }
              value={props.value}
              onChange={onChangeSelectValue}
              margin={props.isInline ? 'none' : 'dense'}
              fullWidth
              floatingLabelText={fieldLabel}
              translatableHintText={t`Choose an effect`}
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
                  ? `parameter-${props.parameterIndex}-object-effect-name-field`
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
              label={<Trans>Select an effect</Trans>}
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
