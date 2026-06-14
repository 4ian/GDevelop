// @flow
import { intersectionBy } from 'lodash';
import getObjectByName from '../../Utils/GetObjectByName';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import {
  enumerateVariables,
  enumerateVariablesOrPropertiesOrParametersOfContainersList,
  type EnumeratedVariable,
} from './EnumerateVariables';

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
  'StringObjectVariable',
  'SetStringObjectVariable',
  'VarObjetTxt',
  'ModVarObjetTxt',
]);

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

export const getEnumVariableForEditedValue = (
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
