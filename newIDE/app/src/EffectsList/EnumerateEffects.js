// @flow
import { mapFor } from '../Utils/MapFor';
import { type Schema } from '../PropertiesEditor';
import { type ResourceKind } from '../ResourcesList/ResourceSource';
import flatten from 'lodash/flatten';

export type EnumeratedEffectMetadata = {|
  extension: gdPlatformExtension,
  effectMetadata: gdEffectMetadata,
  type: string,
  fullName: string,
  description: string,
  parametersSchema: Schema,
  isMarkedAsNotWorkingForObjects: boolean,
  isMarkedAsOnlyWorkingFor2D: boolean,
  isMarkedAsOnlyWorkingFor3D: boolean,
|};

/**
 * Fetch all the effects available for a project, and convert them
 * to a format easier to use.
 */
export const enumerateEffectsMetadata = (
  project: gdProject
): Array<EnumeratedEffectMetadata> => {
  const platform = project.getCurrentPlatform();
  const extensionsList = platform.getAllPlatformExtensions();

  return flatten(
    mapFor(0, extensionsList.size(), i => {
      const extension = extensionsList.at(i);

      return extension
        .getExtensionEffectTypes()
        .toJSArray()
        .map(type => extension.getEffectMetadata(type))
        .map((effectMetadata: gdEffectMetadata) => {
          const effectType = effectMetadata.getType();

          // Convert the effect type properties to a PropertiesEditor Schema.
          const properties = effectMetadata.getProperties();
          const parameterNames = properties.keys().toJSArray();
          const parametersSchema: Schema = parameterNames
            .map((parameterName: string) => {
              const property = properties.get(parameterName);
              const valueType = property.getType().toLowerCase();
              const propertyLabel = property.getLabel();
              const propertyDescription = property.getDescription();
              const getLabel = () => propertyLabel;
              const getDescription = () => propertyDescription;
              const getExtraDescription = () => parameterName;

              if (valueType === 'number') {
                return {
                  name: parameterName,
                  valueType: 'number',
                  getValue: (effect: gdEffect) =>
                    effect.getDoubleParameter(parameterName),
                  setValue: (effect: gdEffect, newValue: number) =>
                    effect.setDoubleParameter(parameterName, newValue),
                  getLabel,
                  getDescription,
                  getExtraDescription,
                };
              } else if (valueType === 'boolean') {
                return {
                  name: parameterName,
                  valueType: 'boolean',
                  getValue: (effect: gdEffect) =>
                    effect.getBooleanParameter(parameterName),
                  setValue: (effect: gdEffect, newValue: boolean) =>
                    effect.setBooleanParameter(parameterName, newValue),
                  getLabel,
                  getDescription,
                  getExtraDescription,
                };
              } else if (valueType === 'resource') {
                // Resource is a "string" (with a selector in the UI)
                const kind: ResourceKind =
                  // $FlowFixMe - assume the passed resource kind is always valid.
                  property.getExtraInfo().toJSArray()[0] || '';
                return {
                  name: parameterName,
                  valueType: 'resource',
                  resourceKind: kind,
                  getValue: (effect: gdEffect) =>
                    effect.getStringParameter(parameterName),
                  setValue: (effect: gdEffect, newValue: string) =>
                    effect.setStringParameter(parameterName, newValue),
                  getLabel,
                  getDescription,
                  getExtraDescription,
                };
              } else if (valueType === 'color') {
                return {
                  name: parameterName,
                  valueType: 'color',
                  getValue: (effect: gdEffect) =>
                    effect.getStringParameter(parameterName),
                  setValue: (effect: gdEffect, newValue: string) =>
                    effect.setStringParameter(parameterName, newValue),
                  getLabel,
                  getDescription,
                  getExtraDescription,
                };
              } else if (valueType === 'choice') {
                const choices = property
                  .getExtraInfo()
                  .toJSArray()
                  .map(value => ({ value, label: value }));
                return {
                  name: parameterName,
                  valueType: 'string',
                  getChoices: () => choices,
                  getValue: (effect: gdEffect) =>
                    effect.getStringParameter(parameterName),
                  setValue: (effect: gdEffect, newValue: string) =>
                    effect.setStringParameter(parameterName, newValue),
                  getLabel,
                  getDescription,
                  getExtraDescription,
                };
              } else {
                console.error(
                  `A property with type=${valueType} could not be mapped to a field for effect ${effectType}. Ensure that this type is correct.`
                );
                return null;
              }
            })
            .filter(Boolean);

          return {
            extension,
            type: effectType,
            effectMetadata,
            fullName: effectMetadata.getFullName(),
            description: effectMetadata.getDescription(),
            isMarkedAsNotWorkingForObjects: effectMetadata.isMarkedAsNotWorkingForObjects(),
            isMarkedAsOnlyWorkingFor2D: effectMetadata.isMarkedAsOnlyWorkingFor2D(),
            isMarkedAsOnlyWorkingFor3D: effectMetadata.isMarkedAsOnlyWorkingFor3D(),
            parametersSchema,
          };
        });
    })
  ).sort(
    (
      enumeratedEffectMetadata1: EnumeratedEffectMetadata,
      enumeratedEffectMetadata2: EnumeratedEffectMetadata
    ) => {
      return enumeratedEffectMetadata1.fullName.localeCompare(
        enumeratedEffectMetadata2.fullName
      );
    }
  );
};

export const enumerateEffectNames = (
  effectsContainer: gdEffectsContainer
): Array<string> => {
  return mapFor(0, effectsContainer.getEffectsCount(), (i: number) => {
    const effect: gdEffect = effectsContainer.getEffectAt(i);
    return effect.getName();
  });
};

export const setEffectDefaultParameters = (
  effect: gdEffect,
  effectMetadata: gdEffectMetadata
) => {
  effect.clearParameters();

  const properties = effectMetadata.getProperties();
  const parameterNames = properties.keys().toJSArray();
  parameterNames.forEach((parameterName: string) => {
    const property = properties.get(parameterName);
    const valueType = property.getType().toLowerCase();

    if (valueType === 'number') {
      effect.setDoubleParameter(
        parameterName,
        parseFloat(property.getValue()) || 0
      );
    } else if (valueType === 'boolean') {
      effect.setBooleanParameter(parameterName, property.getValue() === 'true');
    } else {
      effect.setStringParameter(parameterName, property.getValue());
    }
  });
};
