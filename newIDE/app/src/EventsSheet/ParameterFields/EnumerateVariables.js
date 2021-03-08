// @flow
import flatten from 'lodash/flatten';
import { mapFor } from '../../Utils/MapFor';
import flatMap from 'lodash/flatMap';
const gd: libGDevelop = global.gd;

export const enumerateVariables = (
  variablesContainer: ?gdVariablesContainer
): Array<string> => {
  if (!variablesContainer) {
    return [];
  }

  const enumerateVariableAndChildrenNames = (
    fullName: string,
    variable: gdVariable
  ): Array<string> => {
    if (variable.getType() === gd.Variable.Structure) {
      return [
        fullName,
        ...flatMap(variable.getAllChildrenNames().toJSArray(), childName =>
          enumerateVariableAndChildrenNames(
            `${fullName}.${childName}`,
            variable.getChild(childName)
          )
        ),
      ];
    } else if (variable.getType() === gd.Variable.Array) {
      return [
        fullName,
        ...flatMap(
          new Array(variable.getChildrenCount()).fill(''),
          (_, index) =>
            enumerateVariableAndChildrenNames(
              `${fullName}[${index}]`,
              variable.getAtIndex(index)
            )
        ),
      ];
    } else {
      // Variable of primitive type
      return [fullName];
    }
  };

  return flatten(
    mapFor(0, variablesContainer.count(), i => {
      if (!variablesContainer) return [];

      return enumerateVariableAndChildrenNames(
        variablesContainer.getNameAt(i),
        variablesContainer.getAt(i)
      );
    })
  );
};
