// @flow
import flatten from 'lodash/flatten';
import { mapFor } from '../../Utils/MapFor';
import flatMap from 'lodash/flatMap';
const gd: libGDevelop = global.gd;

// Note that in theory we could have this function inside gd.ExpressionParser2,
// to be sure it's following perfectly the grammar of the expression parser. In
// practice, the disallowed characters are not changing often, so it's fine to have
// them here.
const isValidIdentifier = (variableName: string) => {
  const identifierDisallowedCharacters = ',."()[]{}()[],+-<>?^=:!+-/* \'';

  for (let i = 0; i < variableName.length; ++i) {
    if (identifierDisallowedCharacters.indexOf(variableName[i]) !== -1)
      return false;
  }

  return true;
};

const convertToStringLiteral = (variableName: string) => {
  return '"' + variableName.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
};

export type EnumeratedVariable = {|
  name: string,
  isValidName: boolean,
  type: Variable_Type,
|};

export const enumerateVariables = (
  variablesContainer: ?gdVariablesContainer
): Array<EnumeratedVariable> => {
  if (!variablesContainer) {
    return [];
  }

  const enumerateVariableAndChildrenNames = (
    fullName: string,
    variable: gdVariable,
    isTopLevel: boolean,
    isFullNameValid: boolean
  ): Array<EnumeratedVariable> => {
    // When a variable is top level, it should in theory not contain
    // any special character making it unusable in an expression.
    const isValidName = isTopLevel
      ? isValidIdentifier(fullName)
      : isFullNameValid;
    const type = variable.getType();
    const enumeratedVariable = { name: fullName, isValidName, type };

    if (type === gd.Variable.Structure) {
      return [
        enumeratedVariable,
        ...flatMap(variable.getAllChildrenNames().toJSArray(), childName =>
          enumerateVariableAndChildrenNames(
            isValidIdentifier(childName)
              ? `${fullName}.${childName}`
              : `${fullName}[${convertToStringLiteral(childName)}]`,
            variable.getChild(childName),
            false,
            isValidName
          )
        ),
      ];
    } else if (type === gd.Variable.Array) {
      return [
        enumeratedVariable,
        ...flatMap(
          new Array(variable.getChildrenCount()).fill(''),
          (_, index) =>
            enumerateVariableAndChildrenNames(
              `${fullName}[${index}]`,
              variable.getAtIndex(index),
              false,
              isValidName
            )
        ),
      ];
    } else {
      // Variable of primitive type
      return [enumeratedVariable];
    }
  };

  return flatten(
    mapFor(0, variablesContainer.count(), i => {
      return enumerateVariableAndChildrenNames(
        variablesContainer.getNameAt(i),
        variablesContainer.getAt(i),
        true,
        true
      );
    })
  );
};
