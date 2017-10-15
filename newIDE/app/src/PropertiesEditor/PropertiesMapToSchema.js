import { mapFor } from '../Utils/MapFor';

/**
 * Transform a MapStringPropertyDescriptor to a schema that can be used in PropertiesEditor.
 *
 * @param {MapStringPropertyDescriptor} properties The properties to use
 * @param {*} getProperties The function called to read again the properties
 * @param {*} onUpdateProperty The function called to update a property of an object
 */
export default (
  properties,
  getProperties: instance => any,
  onUpdateProperty: (instance, propertyName, newValue) => void
) => {
  const propertyNames = properties.keys();
  const propertyFields = mapFor(0, propertyNames.size(), i => {
    const name = propertyNames.at(i);
    const property = properties.get(name);
    const valueType = property.getType().toLowerCase();
    const choices = property
      .getExtraInfo()
      .toJSArray()
      .map(value => ({ value, label: value }));

    return {
      name,
      valueType,
      getChoices: valueType === 'choice' ? () => choices : undefined,
      getValue: instance => {
        // Instance custom properties are always stored as string, cast them if necessary
        const rawValue = getProperties(instance)
          .get(name)
          .getValue();
        if (valueType === 'boolean') {
          return rawValue === 'true';
        } else if (valueType === 'number') {
          return parseFloat(rawValue);
        }

        return rawValue;
      },
      setValue: (instance, newValue) => {
        // Instance custom properties are always stored as string, cast them if necessary
        let value;
        if (typeof newValue === 'boolean') {
          value = newValue ? '1' : '0';
        } else {
          value = '' + newValue;
        }

        onUpdateProperty(instance, name, value);
      },
    };
  });

  return propertyFields;
};
