// @flow

const gd: libGDevelop = global.gd;

const readOrInferVariableType = (
  specifiedType: string | null,
  value: string
): string => {
  if (specifiedType) {
    const lowercaseSpecifiedType = specifiedType.toLowerCase();
    if (lowercaseSpecifiedType === 'string') {
      return 'String';
    } else if (lowercaseSpecifiedType === 'number') {
      return 'Number';
    } else if (lowercaseSpecifiedType === 'boolean') {
      return 'Boolean';
    }
  }

  if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
    return 'Boolean';
  }

  const numberValue = Number(value);
  if (!Number.isNaN(numberValue)) {
    return 'Number';
  }

  return 'String';
};

// Parse variable path to handle both dot notation and array indexing
const parseVariablePath = (
  variablePath: string
): Array<{| type: 'property' | 'index', value: string |}> => {
  const segments = [];
  let currentSegment = '';
  let i = 0;

  while (i < variablePath.length) {
    const char = variablePath[i];

    if (char === '.') {
      // End of property segment
      if (currentSegment.trim()) {
        segments.push({ type: 'property', value: currentSegment.trim() });
        currentSegment = '';
      }
      i++;
    } else if (char === '[') {
      // Start of array index
      if (currentSegment.trim()) {
        segments.push({ type: 'property', value: currentSegment.trim() });
        currentSegment = '';
      }

      // Find the closing bracket
      i++; // Skip opening bracket
      let indexContent = '';
      let foundClosingBracketWithProperIndex = false;
      while (i < variablePath.length && variablePath[i] !== ']') {
        indexContent += variablePath[i];
        i++;
      }

      if (i < variablePath.length && variablePath[i] === ']') {
        // Valid array index
        const indexValue = indexContent.trim();
        if (indexValue && !isNaN(parseInt(indexValue, 10))) {
          segments.push({ type: 'index', value: indexValue });
          foundClosingBracketWithProperIndex = true;
        } else {
          throw new Error(
            `Content of the index is invalid ("${indexValue}") - it should be a number.`
          );
        }
        i++; // Skip closing bracket
      }

      if (!foundClosingBracketWithProperIndex) {
        throw new Error(
          'Improperly formatted array index. Please check the variable path - it should be formatted like this: `myVar[1].prop`, `myVar`, `myVar.prop`, etc...'
        );
      }
    } else {
      currentSegment += char;
      i++;
    }
  }

  // Add remaining segment
  if (currentSegment.trim()) {
    segments.push({ type: 'property', value: currentSegment.trim() });
  }

  return segments;
};

const parseValueAsObjectOrArray = (value: string): Array<any> | {} | null => {
  try {
    const parsedValue = JSON.parse(value);

    if (Array.isArray(parsedValue) || typeof parsedValue === 'object') {
      return parsedValue;
    }

    // Value is a primitive, not an object or array.
    return null;
  } catch (error) {
    // Not even a JSON string (probably a primitive or a string).
    return null;
  }
};

const convertJsObjectToVariable = (value: any, variable: gdVariable) => {
  if (value === null) {
    variable.setString('null');
  } else if (value === undefined) {
    variable.setString('undefined');
  } else if (typeof value === 'number') {
    variable.setValue(value || 0);
  } else if (typeof value === 'string') {
    variable.setString(value);
  } else if (typeof value === 'boolean') {
    variable.setBool(value);
  } else if (Array.isArray(value)) {
    variable.castTo('Array');
    variable.clearChildren();
    for (const item of value) {
      convertJsObjectToVariable(item, variable.pushNew());
    }
  } else if (typeof value === 'object') {
    variable.castTo('Structure');
    variable.clearChildren();
    for (const [key, item] of Object.entries(value)) {
      convertJsObjectToVariable(item, variable.getChild(key));
    }
  }
};

export const applyVariableChange = ({
  variablePath,
  forcedVariableType,
  variablesContainer,
  value,
}: {|
  variablePath: string,
  forcedVariableType: string | null,
  variablesContainer: gd.VariablesContainer,
  value: string,
|}) => {
  const pathSegments = parseVariablePath(variablePath);

  if (pathSegments.length === 0) {
    throw new Error('Invalid variable path');
  }

  let addedNewVariable = false;
  const firstSegment = pathSegments[0];

  if (firstSegment.type !== 'property') {
    throw new Error('Variable path must start with a property name');
  }

  const firstVariableName = firstSegment.value;
  let variable = null;
  if (!variablesContainer.has(firstVariableName)) {
    variable = variablesContainer.insertNew(firstVariableName, 0);
    addedNewVariable = true;
  } else {
    variable = variablesContainer.get(firstVariableName);
  }

  for (let i = 1; i < pathSegments.length; i++) {
    const segment = pathSegments[i];

    if (segment.type === 'property') {
      // Navigate to structure property
      variable.castTo('Structure');
      if (!variable.hasChild(segment.value)) {
        addedNewVariable = true;
      }
      variable = variable.getChild(segment.value);
    } else if (segment.type === 'index') {
      // Navigate to array element
      const index = parseInt(segment.value, 10);
      variable.castTo('Array');

      // Ensure array has enough elements
      while (variable.getChildrenCount() <= index) {
        variable.pushNew();
        addedNewVariable = true;
      }

      variable = variable.getAtIndex(index);
    }
  }

  const arrayOrObjectValue = parseValueAsObjectOrArray(value);

  if (arrayOrObjectValue) {
    // Value is an object or array.
    convertJsObjectToVariable(arrayOrObjectValue, variable);

    return {
      variable,
      variableType: variable.getType() === gd.Variable.Array ? 'Array' : 'Structure',
      addedNewVariable,
    }
  } else {
    // Value is a primitive, or not a valid Object/Array in JSON:

    const variableType = readOrInferVariableType(forcedVariableType, value);

    if (variableType === 'String') {
      variable.setString(value);
    } else if (variableType === 'Number') {
      variable.setValue(parseFloat(value));
    } else if (variableType === 'Boolean') {
      variable.setBool(value.toLowerCase() === 'true');
    }

    return {
      variable,
      variableType,
      addedNewVariable,
    };
  }
};
