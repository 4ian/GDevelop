// @flow
import flatten from 'lodash/flatten';
import { mapFor } from '../../Utils/MapFor';
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
    const names = [fullName];
    if (!variable.getType() === gd.Variable.Structure) return names;

    variable
      .getAllChildrenNames()
      .toJSArray()
      .forEach(childName => {
        enumerateVariableAndChildrenNames(
          `${fullName}.${childName}`,
          variable.getChild(childName)
        ).forEach(name => {
          names.push(name);
        });
      });

    return names;
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
