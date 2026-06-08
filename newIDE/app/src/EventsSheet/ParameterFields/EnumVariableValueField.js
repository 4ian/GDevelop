// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { intersectionBy } from 'lodash';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import getObjectByName from '../../Utils/GetObjectByName';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import {
  enumerateVariables,
  enumerateVariablesOrPropertiesOrParametersOfContainersList,
  type EnumeratedVariable,
} from './EnumerateVariables';
import {
  tryExtractStringLiteralContent,
} from './ParameterMetadataTools';
import StringField from './StringField';

const gd: libGDevelop = global.gd;

const sceneOrGlobalVariableValueInstructions = new Set([
  'StringVariable',
  'SetStringVariable',
  'VarSceneTxt',
  'VarGlobalTxt',
  'ModVarSceneTxt',
  'ModVarGlobalTxt',
]);

const objectVariableValueInstructions = new Set([
  'VarObjetTxt',
  'ModVarObjetTxt',
]);

const toStringLiteral = (value: string) => JSON.stringify(value);

const getObjectOrGroupVariablesContainers = (
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  objectName: string
): Array<gdVariablesContainer> => {
  const object = getObjectByName(
    globalObjectsContainer,
    objectsContainer,
    objectName
  );
  if (object) return [object.getVariables()];

  const group = getObjectGroupByName(
    globalObjectsContainer,
    objectsContainer,
    objectName
  );
  if (!group) return [];

  const variablesContainers = [];
  for (const subObjectName of group.getAllObjectsNames().toJSArray()) {
    const subObject = getObjectByName(
      globalObjectsContainer,
      objectsContainer,
      subObjectName
    );
    if (subObject) {
      variablesContainers.push(subObject.getVariables());
    }
  }
  return variablesContainers;
};

const findEnumVariable = (
  variables: Array<EnumeratedVariable>,
  variableName: string
): ?EnumeratedVariable => {
  const variable = variables.find(variable => variable.name === variableName);
  return variable && variable.type === gd.Variable.Enum ? variable : null;
};

const findObjectEnumVariable = (
  props: ParameterFieldProps,
  objectName: string,
  variableName: string
): ?EnumeratedVariable => {
  const variablesContainers = getObjectOrGroupVariablesContainers(
    props.globalObjectsContainer,
    props.objectsContainer,
    objectName
  );
  if (variablesContainers.length === 0) return null;

  const commonVariables = variablesContainers
    .map(variablesContainer => enumerateVariables(variablesContainer))
    .reduce((a, b) => intersectionBy(a, b, 'name'));
  const enumVariable = findEnumVariable(commonVariables, variableName);
  if (!enumVariable) return null;

  const sameEnumValuesForEveryObject = variablesContainers.every(
    variablesContainer => {
      const objectVariable = findEnumVariable(
        enumerateVariables(variablesContainer),
        variableName
      );
      return (
        objectVariable &&
        JSON.stringify(objectVariable.enumValues) ===
          JSON.stringify(enumVariable.enumValues)
      );
    }
  );

  return sameEnumValuesForEveryObject ? enumVariable : null;
};

const getEnumVariableForEditedValue = (
  props: ParameterFieldProps
): ?EnumeratedVariable => {
  const { instruction, parameterIndex } = props;
  if (!instruction || parameterIndex === undefined) return null;

  const instructionType = instruction.getType();
  if (
    sceneOrGlobalVariableValueInstructions.has(instructionType) &&
    parameterIndex === 2
  ) {
    const variableName = instruction.getParameter(0).getPlainString();
    return findEnumVariable(
      enumerateVariablesOrPropertiesOrParametersOfContainersList(
        props.projectScopedContainersAccessor.get().getVariablesContainersList()
      ),
      variableName
    );
  }

  if (
    objectVariableValueInstructions.has(instructionType) &&
    parameterIndex === 3
  ) {
    const objectName = instruction.getParameter(0).getPlainString();
    const variableName = instruction.getParameter(1).getPlainString();
    return findObjectEnumVariable(props, objectName, variableName);
  }

  return null;
};

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
          props.value && !isCurrentValueAllowed
            ? currentLiteralValue !== null
              ? <Trans>Choose one of the enum values.</Trans>
              : <Trans>
                  Enum values must be selected from the enum definition.
                </Trans>
            : null
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
  }
);

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
