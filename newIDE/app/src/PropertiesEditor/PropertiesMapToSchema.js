// @flow
import { mapFor } from '../Utils/MapFor';
import { type Schema, type Instance } from '.';
import { type ResourceKind } from '../ResourcesList/ResourceSource';
import { type Field } from '.';

/**
 * Transform a MapStringPropertyDescriptor to a schema that can be used in PropertiesEditor.
 *
 * @param {gdMapStringPropertyDescriptor} properties The properties to use
 * @param {*} getProperties The function called to read again the properties
 * @param {*} onUpdateProperty The function called to update a property of an object
 */
const propertiesMapToSchema = (
  properties: gdMapStringPropertyDescriptor,
  getProperties: (instance: Instance) => any,
  onUpdateProperty: (
    instance: Instance,
    propertyName: string,
    newValue: string
  ) => void,
  object: ?gdObject
): Schema => {
  const propertyNames = properties.keys();
  // Aggregate field by groups to be able to build field groups with a title.
  const fieldsByGroups = new Map<string, Array<Field>>();
  mapFor(0, propertyNames.size(), i => {
    const name = propertyNames.at(i);
    const property = properties.get(name);

    const groupName = property.getGroup() || '';
    let fields = fieldsByGroups.get(groupName);
    if (!fields) {
      fields = [];
      fieldsByGroups.set(groupName, fields);
    }

    const propertyDescription = property.getDescription();
    const valueType = property.getType().toLowerCase();
    const getLabel = (instance: Instance) => {
      const propertyName = getProperties(instance)
        .get(name)
        .getLabel();
      if (propertyName) return propertyName;
      return (
        name.charAt(0).toUpperCase() +
        name
          .slice(1)
          .split(/(?=[A-Z])/)
          .join(' ')
      );
    };
    const getDescription = () => propertyDescription;

    if (property.isHidden()) return null;

    if (valueType === 'number') {
      fields.push({
        name,
        valueType,
        getValue: (instance: Instance): number => {
          return (
            parseFloat(
              getProperties(instance)
                .get(name)
                .getValue()
            ) || 0
          ); // Consider a missing value as 0 to avoid propagating NaN.
        },
        setValue: (instance: Instance, newValue: number) => {
          onUpdateProperty(instance, name, '' + newValue);
        },
        getLabel,
        getDescription,
      });
      return null;
    } else if (valueType === 'string' || valueType === '') {
      fields.push({
        name,
        valueType: 'string',
        getValue: (instance: Instance): string => {
          return getProperties(instance)
            .get(name)
            .getValue();
        },
        setValue: (instance: Instance, newValue: string) => {
          onUpdateProperty(instance, name, newValue);
        },
        getLabel,
        getDescription,
      });
      return null;
    } else if (valueType === 'boolean') {
      fields.push({
        name,
        valueType,
        getValue: (instance: Instance): boolean => {
          return (
            getProperties(instance)
              .get(name)
              .getValue() === 'true'
          );
        },
        setValue: (instance: Instance, newValue: boolean) => {
          onUpdateProperty(instance, name, newValue ? '1' : '0');
        },
        getLabel,
        getDescription,
      });
      return null;
    } else if (valueType === 'choice') {
      // Choice is a "string" (with a selector for the user in the UI)
      const choices = property
        .getExtraInfo()
        .toJSArray()
        .map(value => ({ value, label: value }));
      fields.push({
        name,
        valueType: 'string',
        getChoices: () => choices,
        getValue: (instance: Instance): string => {
          return getProperties(instance)
            .get(name)
            .getValue();
        },
        setValue: (instance: Instance, newValue: string) => {
          onUpdateProperty(instance, name, newValue);
        },
        getLabel,
        getDescription,
      });
      return null;
    } else if (valueType === 'behavior') {
      const behaviorType =
        property.getExtraInfo().size() > 0 ? property.getExtraInfo().at(0) : '';
      fields.push({
        name,
        valueType: 'string',
        getChoices: () => {
          return !object || behaviorType === ''
            ? []
            : object
                .getAllBehaviorNames()
                .toJSArray()
                .map(name =>
                  object.getBehavior(name).getTypeName() === behaviorType
                    ? name
                    : null
                )
                .filter(Boolean)
                .map(value => ({ value, label: value }));
        },
        getValue: (instance: Instance): string => {
          return getProperties(instance)
            .get(name)
            .getValue();
        },
        setValue: (instance: Instance, newValue: string) => {
          onUpdateProperty(instance, name, newValue);
        },
        getLabel,
        getDescription,
      });
      return null;
    } else if (valueType === 'resource') {
      // Resource is a "string" (with a selector in the UI)
      // $FlowFixMe - assume the passed resource kind is always valid.
      const kind: ResourceKind = property.getExtraInfo().toJSArray()[0] || '';
      fields.push({
        name,
        valueType: 'resource',
        resourceKind: kind,
        getValue: (instance: Instance): string => {
          return getProperties(instance)
            .get(name)
            .getValue();
        },
        setValue: (instance: Instance, newValue: string) => {
          onUpdateProperty(instance, name, newValue);
        },
        getLabel,
        getDescription,
      });
      return null;
    } else if (valueType === 'color') {
      fields.push({
        name,
        valueType: 'color',
        getValue: (instance: Instance): string => {
          return getProperties(instance)
            .get(name)
            .getValue();
        },
        setValue: (instance: Instance, newValue: string) => {
          onUpdateProperty(instance, name, newValue);
        },
        getLabel,
        getDescription,
      });
      return null;
    } else if (valueType === 'textarea') {
      fields.push({
        name,
        valueType: 'textarea',
        getValue: (instance: Instance): string => {
          return getProperties(instance)
            .get(name)
            .getValue();
        },
        setValue: (instance: Instance, newValue: string) => {
          onUpdateProperty(instance, name, newValue);
        },
        getLabel,
        getDescription,
      });
      return null;
    } else {
      console.error(
        `A property with type=${valueType} could not be mapped to a field. Ensure that this type is correct and understood by the IDE.`
      );
      return null;
    }
  });
  if (fieldsByGroups.size === 0) {
    return [];
  }
  const defaultGroupField = fieldsByGroups.get('');
  if (fieldsByGroups.size === 1 && defaultGroupField) {
    // Avoid to create a blank title
    return defaultGroupField;
  }
  // Create a group for the default one too because it would look weird with the indentation.
  const groupNames = [...fieldsByGroups.keys()].sort((a, b) =>
    a.localeCompare(b)
  );
  return groupNames.map(groupName => ({
    name: groupName,
    type: 'column',
    title: groupName,
    // The group actually always exists here.
    children: fieldsByGroups.get(groupName) || [],
  }));
};

export default propertiesMapToSchema;
