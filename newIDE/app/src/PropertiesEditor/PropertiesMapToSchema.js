// @flow
import { mapFor } from '../Utils/MapFor';
import { type Schema, type Instance } from '.';
import { type ResourceKind } from '../ResourcesList/ResourceSource';
import { type Field } from '.';
import MeasurementUnitDocumentation from './MeasurementUnitDocumentation';
import * as React from 'react';

const createField = (
  name: string,
  property: gdPropertyDescriptor,
  getProperties: (instance: Instance) => any,
  onUpdateProperty: (
    instance: Instance,
    propertyName: string,
    newValue: string
  ) => void,
  object: ?gdObject
): ?Field => {
  const propertyDescription = property.getDescription();
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
  const getEndAdornment = (instance: Instance) => {
    const property = getProperties(instance).get(name);
    const measurementUnit = property.getMeasurementUnit();
    return {
      label: getMeasurementUnitShortLabel(measurementUnit),
      tooltipContent: (
        <MeasurementUnitDocumentation
          label={measurementUnit.getLabel()}
          description={measurementUnit.getDescription()}
          elementsWithWords={measurementUnit.getElementsWithWords()}
        />
      ),
    };
  };

  const valueType = property.getType().toLowerCase();
  if (valueType === 'number') {
    return {
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
      getEndAdornment,
    };
  } else if (valueType === 'string' || valueType === '') {
    return {
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
    };
  } else if (valueType === 'boolean') {
    return {
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
    };
  } else if (valueType === 'choice') {
    // Choice is a "string" (with a selector for the user in the UI)
    const choices = property
      .getExtraInfo()
      .toJSArray()
      .map(value => ({ value, label: value }));
    return {
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
    };
  } else if (valueType === 'behavior') {
    const behaviorType =
      property.getExtraInfo().size() > 0 ? property.getExtraInfo().at(0) : '';
    return {
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
    };
  } else if (valueType === 'resource') {
    // Resource is a "string" (with a selector in the UI)
    // $FlowFixMe - assume the passed resource kind is always valid.
    const kind: ResourceKind = property.getExtraInfo().toJSArray()[0] || '';
    return {
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
    };
  } else if (valueType === 'color') {
    return {
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
    };
  } else if (valueType === 'textarea') {
    return {
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
    };
  } else {
    console.error(
      `A property with type=${valueType} could not be mapped to a field. Ensure that this type is correct and understood by the IDE.`
    );
    return null;
  }
};

const propertyKeywordCouples: Array<[string, string]> = [
  ['X', 'Y'],
  ['Width', 'Height'],
  ['Top', 'Bottom'],
  ['Left', 'Right'],
  ['Up', 'Down'],
  ['Min', 'Max'],
  ['Low', 'Heigh'],
  ['Color', 'Opacity'],
  ['Horizontal', 'Vertical'],
  ['Acceleration', 'Deceleration'],
  ['Duration', 'Easing'],
];

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
  const alreadyHandledProperties = new Set<string>();
  mapFor(0, propertyNames.size(), i => {
    const name = propertyNames.at(i);
    const property = properties.get(name);
    if (property.isHidden()) return null;
    if (alreadyHandledProperties.has(name)) return null;

    const groupName = property.getGroup() || '';
    let fields = fieldsByGroups.get(groupName);
    if (!fields) {
      fields = [];
      fieldsByGroups.set(groupName, fields);
    }

    // Search a property couple that can be put in a row.
    let field: ?Field = null;
    for (const propertyKeywords of propertyKeywordCouples) {
      const firstKeyword = propertyKeywords[0];
      const secondKeyword = propertyKeywords[1];

      let firstName: ?string = null;
      let secondName: ?string = null;
      if (name.includes(firstKeyword)) {
        const otherPropertyName = name.replace(firstKeyword, secondKeyword);
        if (properties.has(otherPropertyName)) {
          firstName = name;
          secondName = otherPropertyName;
        }
      } else if (name.includes(secondKeyword)) {
        const otherPropertyName = name.replace(secondKeyword, firstKeyword);
        if (properties.has(otherPropertyName)) {
          firstName = otherPropertyName;
          secondName = name;
        }
      }

      if (firstName && secondName) {
        const firstProperty = properties.get(firstName);
        const secondProperty = properties.get(secondName);
        if (firstProperty.getGroup() === secondProperty.getGroup()) {
          field = {
            name: firstName + '-' + secondName,
            type: 'row',
            children: [
              createField(
                firstName,
                firstProperty,
                getProperties,
                onUpdateProperty,
                object
              ),
              createField(
                secondName,
                secondProperty,
                getProperties,
                onUpdateProperty,
                object
              ),
            ],
          };
          alreadyHandledProperties.add(firstName);
          alreadyHandledProperties.add(secondName);
        }
      }
    }
    if (!field) {
      field = createField(
        name,
        property,
        getProperties,
        onUpdateProperty,
        object
      );
    }
    if (field) {
      fields.push(field);
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

const exponents = ['⁰', '¹', '²', '³', '⁴', '⁵'];

export const getMeasurementUnitShortLabel = (
  measurementUnit: gdMeasurementUnit
): string => {
  return mapFor(0, measurementUnit.getElementsCount(), i => {
    const baseUnit = measurementUnit.getElementBaseUnit(i);
    const power = measurementUnit.getElementPower(i);
    const absPower = Math.abs(power);
    const showPower = power < 0 || (absPower > 1 && absPower < 6);
    return (
      baseUnit.getSymbol() +
      (power < 0 ? '⁻' : '') +
      (showPower ? exponents[absPower] : '')
    );
  }).join(' · ');
};

export default propertiesMapToSchema;
